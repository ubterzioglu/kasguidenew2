# Kas Guide -- Codebase Cleanup & Refactor Plan

**Date:** 2026-04-02
**Status:** AWAITING CONFIRMATION
**Scope:** ~20 files across src/lib, src/app/api, src/app/admin, src/features
**Estimated complexity:** MEDIUM-HIGH

---

## 1. Architectural Violations

### 1.1 Triple Category Definition (No Single Source of Truth)

| File | What it defines | Count | Purpose |
|------|----------------|-------|---------|
| `src/lib/supabase.ts` | `CATEGORIES` array | 21 items | Public display (names, icons, Unsplash URLs) |
| `src/lib/place-taxonomy.ts` | `PLACE_CATEGORY_OPTIONS` array | 11 items | Admin pipeline (Google Places type mapping) |
| `src/features/home/components/category-section.tsx` | `CATEGORY_GROUPS`, `CATEGORY_ICONS` inline constants | 19 IDs grouped into 4 sections | Homepage grouping and icon overrides |

**Why it matters:** Adding a new category requires editing 3 files. The public list has 21 categories, the admin pipeline only recognizes 11. Categories like `tarih`, `etkinlik`, `yazilar`, `roportaj`, `fotograf`, `oss`, `kas-local`, `acil-durum`, `patililer` exist in `CATEGORIES` but are invisible to the admin review pipeline since `PLACE_CATEGORY_OPTIONS` does not include them. A place imported with `category_raw = "museum"` maps to `gezi`, but a place manually set to `tarih` would fail validation in `raw-place-store.ts:272` because `PLACE_CATEGORY_OPTIONS` does not contain `tarih`.

**Recommendation:** Create `src/lib/categories.ts` as the single source of truth. One array with all fields: `id`, `label`, `icon`, `imageUrl`, `googleTypes[]`, `group`. All other files import from it. Remove `CATEGORIES` from `supabase.ts`, remove `PLACE_CATEGORY_OPTIONS` from `place-taxonomy.ts`, remove inline `CATEGORY_GROUPS`/`CATEGORY_ICONS` from `category-section.tsx`.

---

### 1.2 Duplicate Type Definitions (PlaceEditorDraft)

`PlaceEditorDraft` is defined twice with identical shapes:

- `src/lib/raw-place-store.ts:18-33` -- server-side type
- `src/app/admin/review/types.ts:47-62` -- client-side type

Same duplication for `RecentRawPlaceItem`, `ExistingPlaceItem`, `ReviewDashboardSnapshot`, and several status union types.

**Why it matters:** Changes to the server type silently diverge from the client type. No compiler error until runtime.

**Recommendation:** Create `src/types/place.ts` and `src/types/review.ts` as shared type modules (no runtime code, only `type` exports). Both server and client import from these. The `src/app/admin/review/types.ts` file becomes a re-export barrel or is deleted.

---

### 1.3 God File: `raw-place-store.ts` (817 lines)

This file handles:
- Draft hydration from raw places (`buildDraftFromRaw`, `loadDraftMapForRawPlaces`)
- Draft hydration from existing places (`buildDraftFromPlace`, `fetchExistingPlaces`)
- Validation (name required, category required, image count check)
- Normalization (delegates to `place-review-utils.ts`)
- Slug generation and uniqueness (`ensureUniqueSlug`)
- Database writes across 5 tables (`places`, `place_content`, `place_images`, `place_sources`, `review_queue`)
- Schema migration workaround (`isMissingKasguideBadgeColumnError` -- retries query without `kasguide_badge` column)
- Status transitions (publish, reject, save_draft)

**Why it matters:** Any change to validation, slug logic, or DB schema requires touching this file. Testing individual concerns is impossible without mocking the entire Supabase client.

**Recommendation:** Split into:
- `src/lib/place-draft-builder.ts` -- `buildDraftFromRaw`, `buildDraftFromPlace`, `loadDraftMapForRawPlaces`
- `src/lib/place-persistence.ts` -- `persistPlaceFromRaw`, `persistExistingPlace`, `rejectRawPlace`
- `src/lib/place-validation.ts` -- validation logic (name, category, image count) extracted into a pure function
- `src/lib/place-slug.ts` -- `ensureUniqueSlug`, `slugifyText` (move from `place-review-utils.ts`)

---

### 1.4 Mixed Concerns: `supabase.ts`

This file contains three unrelated things:
1. Supabase client initialization (lines 1-12)
2. Legacy `Item` interface (lines 16-29) -- maps to a `items` table that NO LONGER EXISTS
3. `Category` interface + 21-item `CATEGORIES` array (lines 31-187)

**Why it matters:** Every file that needs the Supabase client also imports category display data. The `Item` interface is dead code referencing a deleted schema.

**Recommendation:** Keep `supabase.ts` as client init only. Delete the `Item` interface. Move `CATEGORIES` into the unified `src/lib/categories.ts`.

---

### 1.5 Mixed Concerns: `useReviewDashboard.ts` (483 lines)

This single hook manages:
- Auth state (password from localStorage, redirect on missing password)
- API communication (4 different fetch calls with auth headers)
- Draft form state for raw places (`drafts`, `updateDraftField`, `updateImageField`, `addImageField`, `removeImageField`)
- Draft form state for existing places (identical pattern duplicated: `existingDrafts`, `updateExistingDraftField`, `updateExistingImageField`, `addExistingImageField`, `removeExistingImageField`)
- UI state (`activeActionId`, `activeRawPlaceId`, `activeExistingPlaceId`, `status`, `isLoading`)

The raw place draft helpers and existing place draft helpers are **structurally identical** -- the same logic is written twice.

**Why it matters:** Adding a new field to the editor requires changes in 8+ places within this single file. The duplicated draft state logic is a maintenance hazard.

**Recommendation:** Extract:
- `useAdminAuth.ts` -- password management, auth header injection, redirect logic
- `useDraftEditor.ts` -- generic hook parameterized by ID type, handles `updateField`, `updateImage`, `addImage`, `removeImage` for any draft record
- Keep `useReviewDashboard.ts` as the orchestrator that composes these hooks

---

### 1.6 Duplicated `getAdminAccessError` in API Routes

The function `getAdminAccessError` is copy-pasted identically in:
- `src/app/api/admin/review/route.ts:67-81`
- `src/app/api/admin/raw-places/route.ts:61-75`
- `src/app/api/admin/places/route.ts:64-78`
- `src/app/api/admin/hero-slides/route.ts` (similar pattern)

Similarly, `readStringField`, `readLimit`, `readDraft` are duplicated across routes.

**Recommendation:** Create `src/lib/api-helpers.ts` with shared admin auth guard middleware and common field readers.

---

## 2. Dirty Code Findings

### 2.1 Unsafe Cast of Untrusted Input

**File:** `src/app/api/admin/raw-places/route.ts:109`
**File:** `src/app/api/admin/places/route.ts:102`

```typescript
// CURRENT: blindly cast external JSON body to PlaceEditorDraft
return value as PlaceEditorDraft
```

The `readDraft` function checks `typeof value === 'object'` but does not validate any fields. A malicious or malformed request body with missing `name`, wrong `status` value, or extra fields passes straight through to database writes.

**Fix:** Add Zod schema for `PlaceEditorDraft` and validate at the API boundary.

---

### 2.2 Repeated `isMissingKasguideBadgeColumnError` Fallback Pattern

**File:** `src/lib/raw-place-store.ts` -- lines 133-142, 296-301, 467-472, 609-619

The same try-with-fallback pattern for the `kasguide_badge` column appears **4 times**. This is a schema migration workaround that should have been a one-time migration.

**Fix:** Run the ALTER TABLE to add the column, then remove all 4 fallback blocks.

---

### 2.3 Massive Code Duplication in `page.tsx`

**File:** `src/app/admin/review/page.tsx`

The editor JSX for raw places (lines 146-312) and existing places (lines 400-557) are nearly identical -- same fields, same structure, different state variables. ~160 lines of duplicated JSX.

**Fix:** Extract a `<PlaceEditorForm>` component that accepts `draft`, `onFieldChange`, `onImageChange`, `onAddImage`, `onRemoveImage`, `onSave`, `onPublish` as props.

---

### 2.4 `slugifyText` Strips Turkish Characters

**File:** `src/lib/place-review-utils.ts:29-35`

```typescript
.replace(/[^a-z0-9\s-]/g, ' ')  // Strips all non-ASCII including Turkish chars
```

Despite CLAUDE.md specifying Turkish normalization (g->g, u->u, s->s, i->i, o->o, c->c), the current implementation strips Turkish characters entirely instead of transliterating them. "Guzel Kafe" becomes "g-zel-kafe" if the input is "Guzel Kafe", but "Gokkusagi" from "Gokkusagi" silently becomes "g-kk-sa-" since o, u, s, g are stripped.

**Fix:** Add Turkish transliteration map before the regex strip.

---

### 2.5 Inline Styles in Production Components

**File:** `src/app/admin/review/page.tsx` -- lines 138, 139, 321, 331
**File:** `src/features/home/components/category-section.tsx` -- line 284

```typescript
style={{ fontSize: '0.8rem', color: '#35c8b4' }}
```

Hardcoded color values and font sizes scattered through JSX instead of using CSS classes.

**Fix:** Move to CSS classes in the existing stylesheet.

---

### 2.6 `eslint-disable` Suppressing Real Issues

**File:** `src/app/admin/review/useReviewDashboard.ts:167`

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
```

This suppresses a legitimate warning: `loadDashboard` is in the dependency array of the `useCallback` but is omitted from the `useEffect` deps. The effect runs once on mount but uses a stale closure if `loadDashboard` identity changes.

---

## 3. Critical Production Risks

### HIGH -- Unvalidated Draft from Client (Direct DB Write)

**Files:** `raw-place-store.ts:persistPlaceFromRaw`, `raw-place-store.ts:persistExistingPlace`
**API entry:** `admin/raw-places/route.ts`, `admin/places/route.ts`

The `PlaceEditorDraft` received from the HTTP request body is cast without validation (`value as PlaceEditorDraft`). The store functions do validate `name` and `category`, but `status` and `verificationStatus` are written directly to the database without checking against allowed values. A crafted request could set `status` to an arbitrary string.

**Failure mode:** Data corruption in the `places` table. Any value can be injected into `status` and `verification_status` columns.

---

### HIGH -- Password Stored in localStorage Without Expiry

**File:** `src/lib/admin-password-client.ts`

Admin password is stored in `localStorage` with key `kasguide.admin.password`. No expiry. No session timeout. Anyone with access to the browser (shared computer, XSS) has permanent admin access.

**Failure mode:** Persistent credential exposure. Survives browser restarts.

---

### HIGH -- Password Sent in HTTP Header on Every Request

**File:** `src/app/admin/review/useReviewDashboard.ts` -- lines 104, 108, 187, 237, 299

The plaintext admin password is sent as `X-Admin-Password` header on every API call. If the deployment does not enforce HTTPS (development, misconfigured proxy), the password is visible in network traffic. Even with HTTPS, the password appears in server access logs if headers are logged.

**Failure mode:** Credential leakage via logs or non-TLS connections.

---

### MEDIUM -- No Rate Limiting on Admin API Endpoints

**Files:** All `src/app/api/admin/*/route.ts`

No rate limiting on authentication attempts. The `timingSafeEqual` in `admin-auth.ts` prevents timing attacks but does not prevent brute force.

**Failure mode:** Password brute-force if the admin password is weak.

---

### MEDIUM -- Unhandled Promise Rejections in Store Layer

**File:** `src/lib/raw-place-store.ts:persistPlaceFromRaw` (lines 397-556)

This function performs 6 sequential database operations. If operation 4 fails (e.g., `place_images` insert), operations 1-3 have already committed. There is no transaction wrapping. The place exists but has no images, and the raw place status is not updated.

**Failure mode:** Partially written data. Place visible without images. Raw place stuck in wrong processing status.

---

### MEDIUM -- External Image URLs Stored Without Validation

**File:** `src/lib/place-review-utils.ts:uniqueImageUrls` -- only deduplicates, does not validate URL format.
**File:** `src/lib/raw-place-store.ts:500-510` -- URLs written directly to `place_images.public_url`.

No URL format validation. No domain allowlist. No check for `javascript:`, `data:`, or other dangerous URI schemes.

**Failure mode:** Stored XSS via image URL injection. Broken images from invalid URLs.

---

### LOW -- Legacy `Item` Interface (Dead Code)

**File:** `src/lib/supabase.ts:16-29`

The `Item` interface references `item_type: 'place' | 'pet' | 'hotel' | 'artist'` and `status: 'pending' | 'approved' | 'rejected'`, mapping to the old `items` table. The current schema uses `places` with different status values. This interface is not imported anywhere but could mislead future developers.

**Failure mode:** Developer confusion, potential misuse.

---

### LOW -- No Cache-Control on Public API Responses

**File:** `src/app/api/places/route.ts` and `src/app/api/place-counts/route.ts` both set `Cache-Control: no-store`. For a city guide with relatively static place data, this means every page load hits the database.

**Failure mode:** Unnecessary database load. Slow page loads.

---

## 4. Phased Refactor Plan

### Phase 1: Safe Quick Wins (No Behavior Change, Low Risk)

| Step | What | Why | Risk | Effort |
|------|------|-----|------|--------|
| 1.1 | Delete `Item` interface from `supabase.ts` | Dead code referencing deleted table | NONE | 5 min |
| 1.2 | Create `src/lib/api-helpers.ts` -- extract `getAdminAccessError`, `readStringField`, `readLimit` from 4 route files | Eliminate 4x copy-paste | LOW | 30 min |
| 1.3 | Create `src/types/place.ts` and `src/types/review.ts` -- move shared types, delete duplicates from `raw-place-store.ts` and `admin/review/types.ts` | Single source of truth for types | LOW | 45 min |
| 1.4 | Fix `slugifyText` to handle Turkish characters | Bug fix: slugs currently corrupted for Turkish names | LOW | 15 min |
| 1.5 | Remove inline styles from `page.tsx` and `category-section.tsx`, replace with CSS classes | Code quality | NONE | 20 min |
| 1.6 | Add URL validation to `uniqueImageUrls` (reject non-http(s) schemes) | Security hardening | LOW | 15 min |

---

### Phase 2: Structural Improvements (Medium Risk, High Impact)

| Step | What | Why | Risk | Effort |
|------|------|-----|------|--------|
| 2.1 | Create unified `src/lib/categories.ts` -- merge `CATEGORIES` + `PLACE_CATEGORY_OPTIONS` + `CATEGORY_GROUPS` | Single source of truth | MEDIUM | 2 hrs |
| 2.2 | Split `raw-place-store.ts` into `place-draft-builder.ts`, `place-persistence.ts`, `place-validation.ts`, `place-slug.ts` | Decompose god file | MEDIUM | 2 hrs |
| 2.3 | Extract `<PlaceEditorForm>` component from `page.tsx` | Eliminate ~160 lines of duplicated JSX | MEDIUM | 1.5 hrs |
| 2.4 | Extract `useDraftEditor.ts` generic hook from `useReviewDashboard.ts` | Eliminate duplicated draft state logic | MEDIUM | 1.5 hrs |
| 2.5 | Extract `useAdminAuth.ts` from `useReviewDashboard.ts` | Separate auth concern from form state | LOW | 45 min |
| 2.6 | Add Zod schemas for API request bodies (`PlaceEditorDraftSchema`, `ReviewActionSchema`, `RawPlaceActionSchema`) | Input validation at API boundary | MEDIUM | 1.5 hrs |
| 2.7 | Standardize API response envelope: `{ success: boolean, data?: T, error?: string }` across all routes | Consistent client-side error handling | MEDIUM | 1 hr |

---

### Phase 3: Architecture Upgrades (Higher Effort, Long-Term Payoff)

| Step | What | Why | Risk | Effort |
|------|------|-----|------|--------|
| 3.1 | Remove `isMissingKasguideBadgeColumnError` fallback -- run migration to add column permanently | Remove 4 code blocks of workaround logic | MEDIUM | 1 hr (migration) + 30 min (code cleanup) |
| 3.2 | Replace localStorage password with HTTP-only session cookie | Eliminate credential storage in browser JS | HIGH | 4 hrs |
| 3.3 | Add rate limiting middleware for admin routes | Brute-force protection | LOW | 2 hrs |
| 3.4 | Wrap multi-table writes in Supabase RPC transactions | Prevent partial writes | MEDIUM | 3 hrs |
| 3.5 | Add Vitest + first 5 test files (see Section 9) | Establish testing baseline | LOW | 4 hrs |
| 3.6 | Add `Cache-Control: s-maxage=60, stale-while-revalidate=300` to public GET endpoints | Reduce DB load | LOW | 30 min |

---

## 5. Target Architecture

```
src/
  types/
    place.ts                    # PlaceEditorDraft, RecentRawPlaceItem, ExistingPlaceItem
    review.ts                   # ReviewQueueItem, ReviewDashboardSnapshot, status unions
    api.ts                      # ApiResponse<T> envelope type

  lib/
    supabase.ts                 # Client init ONLY (no types, no data)
    supabase-admin.ts           # Admin client init (unchanged)
    categories.ts               # UNIFIED: id, label, icon, imageUrl, googleTypes[], group
    place-taxonomy.ts           # suggestCategoryFromRaw(), getPlaceCategoryLabel() -- imports from categories.ts
    place-validation.ts         # validatePlaceDraft() -- pure function, returns Result type
    place-slug.ts               # slugifyText() (with Turkish support), ensureUniqueSlug()
    place-draft-builder.ts      # buildDraftFromRaw(), buildDraftFromPlace(), loadDraftMapForRawPlaces()
    place-persistence.ts        # persistPlaceFromRaw(), persistExistingPlace(), rejectRawPlace()
    place-review-store.ts       # Orchestrator: getReviewDashboardSnapshot(), applyReviewAction(), applyRawPlaceAction()
    place-review-utils.ts       # normalizeText(), normalizePhone(), normalizeWebsite(), uniqueImageUrls()
    grid-sweep-store.ts         # Unchanged
    admin-auth.ts               # Unchanged (timing-safe compare)
    admin-password-client.ts    # Phase 3: replaced with cookie-based session
    api-helpers.ts              # getAdminAccessError(), readStringField(), readLimit(), readDraft()
    public-place-store.ts       # Unchanged

  app/
    api/
      admin/
        review/route.ts         # Uses api-helpers.ts, Zod validation
        raw-places/route.ts     # Uses api-helpers.ts, Zod validation
        places/route.ts         # Uses api-helpers.ts, Zod validation
        hero-slides/route.ts    # Uses api-helpers.ts
        session/route.ts        # Unchanged

    admin/
      review/
        page.tsx                # Slim orchestrator, delegates to components
        useReviewDashboard.ts   # Orchestrator hook, composes useAdminAuth + useDraftEditor
        useAdminAuth.ts         # Auth state, password management, redirect
        useDraftEditor.ts       # Generic draft form state (parameterized)
        types.ts                # Re-exports from src/types/ (or deleted)
        formatters.ts           # Unchanged
        components/
          PlaceEditorForm.tsx   # Shared editor form (raw + existing)
          AdminHero.tsx         # Unchanged
          SweepBoard.tsx        # Unchanged

  features/
    home/
      components/
        category-section.tsx    # Imports groups/icons from categories.ts
```

---

## 6. Code Standards

### API Response Envelope

```typescript
// src/types/api.ts
type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}
```

All routes return this shape. Client code checks `response.success` instead of guessing the shape.

### Error Handling Pattern

```typescript
// Store functions: throw with descriptive message
// API routes: catch and wrap in ApiResponse
// Client hooks: catch, set status.tone = 'error', set status.message
```

No unhandled promise rejections. Every `await` in a store function is inside a function that the API route wraps in try/catch.

### Naming Conventions

- Files: `kebab-case.ts`
- Types: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE` for static arrays/maps, `camelCase` for derived values
- Hooks: `use` prefix, one hook per file

### File Size Limits

- Components: max 200 lines (extract sub-components)
- Hooks: max 150 lines (extract sub-hooks)
- Store files: max 200 lines (split by concern)
- API routes: max 80 lines (delegate to helpers)

### Validation Pattern

- Zod schemas defined next to the types they validate
- API routes call `schema.safeParse(body)` before any store call
- Store functions assume validated input (no redundant checks)

---

## 7. Quick Wins (Top 8, High Impact / Low Effort)

1. **Delete `Item` interface** from `supabase.ts` -- dead code, 0 risk, 5 minutes
2. **Fix Turkish slug transliteration** in `place-review-utils.ts` -- active bug, 15 minutes
3. **Add URL scheme validation** to `uniqueImageUrls` -- security fix, 15 minutes
4. **Extract `getAdminAccessError`** to `api-helpers.ts` -- removes 4x copy-paste, 30 minutes
5. **Move shared types** to `src/types/` -- removes duplicate `PlaceEditorDraft`, 45 minutes
6. **Remove inline styles** from admin `page.tsx` -- code quality, 20 minutes
7. **Add `Cache-Control` headers** with short TTL to public GET endpoints -- performance, 10 minutes
8. **Fix `eslint-disable react-hooks/exhaustive-deps`** in `useReviewDashboard.ts` -- correctness, 10 minutes

---

## 8. Anti-Patterns (What NOT to Do in This Codebase)

1. **Do NOT define categories in component files.** All category data lives in `src/lib/categories.ts`. Components import, never define.

2. **Do NOT duplicate types between server and client.** Shared types live in `src/types/`. If a type is used by both `'server-only'` code and `'use client'` code, it belongs in `src/types/`.

3. **Do NOT cast `request.json()` with `as`.** Always validate with Zod at the API boundary. `value as PlaceEditorDraft` is forbidden.

4. **Do NOT copy-paste helper functions across API routes.** If two routes need the same logic, extract to `src/lib/api-helpers.ts`.

5. **Do NOT write database migration workarounds in application code.** The `isMissingKasguideBadgeColumnError` pattern must not be repeated. Run the migration.

6. **Do NOT store secrets in localStorage/sessionStorage.** Use HTTP-only cookies for session management.

7. **Do NOT put business logic in React components.** `page.tsx` should be pure rendering. All state logic belongs in hooks. All data logic belongs in store files.

8. **Do NOT create hooks with 10+ `useState` calls.** If a hook manages more than 4-5 pieces of state, split it into smaller hooks that compose.

---

## 9. Minimal Testing Strategy

### Framework

Install **Vitest** (fast, native ESM, TypeScript-first, works with Next.js).

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### First 5 Test Files (Priority Order)

1. **`src/lib/__tests__/place-review-utils.test.ts`**
   - Test `normalizeText`, `normalizePhone`, `normalizeWebsite`, `uniqueImageUrls`, `slugifyText`
   - Pure functions, no mocking needed
   - Covers the Turkish character bug immediately
   - ~15 test cases

2. **`src/lib/__tests__/place-taxonomy.test.ts`**
   - Test `suggestCategoryFromRaw` with known Google types, unknown types, null input
   - Test `getPlaceCategoryLabel` with valid/invalid IDs
   - Pure functions, no mocking needed
   - ~10 test cases

3. **`src/lib/__tests__/place-validation.test.ts`** (after Phase 2.2 extraction)
   - Test `validatePlaceDraft` with valid draft, missing name, invalid category, wrong image count
   - Pure function returning result type
   - ~12 test cases

4. **`src/lib/__tests__/admin-auth.test.ts`**
   - Test `isAdminRequestAuthorized` with correct password, wrong password, missing header, timing safety
   - Requires mocking `process.env`
   - ~8 test cases

5. **`src/app/admin/review/__tests__/formatters.test.ts`**
   - Test all formatter functions with known inputs and edge cases
   - Pure functions, no mocking
   - ~20 test cases

### Coverage Target

Start with 80% coverage on `src/lib/place-review-utils.ts`, `src/lib/place-taxonomy.ts`, `src/lib/admin-auth.ts`, and `src/app/admin/review/formatters.ts`. These are all pure functions and represent the highest-value, lowest-effort tests.

---

## Summary

| Phase | Steps | Risk | Effort |
|-------|-------|------|--------|
| Phase 1: Quick Wins | 6 steps | LOW | ~2.5 hours |
| Phase 2: Structural | 7 steps | MEDIUM | ~10 hours |
| Phase 3: Architecture | 6 steps | MEDIUM-HIGH | ~15 hours |

**Key deliverables:**
1. Unified category system (single source of truth)
2. Decomposed god file (`raw-place-store.ts` split into 4 focused modules)
3. Input validation with Zod at API boundaries
4. Shared types eliminating server/client drift
5. Extracted reusable components and hooks
6. Testing foundation with Vitest

---

**WAITING FOR CONFIRMATION -- reply "proceed" to begin execution, or "modify: [changes]" to adjust the plan.**
