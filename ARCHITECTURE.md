# Kaş Guide — Architecture & Engineering Reference

> **Audience**: Engineers onboarding to the project, contributors, or anyone making architectural decisions.
> **Last Updated**: 2026-04-02
> **Stack**: Next.js 15, TypeScript 5.8, Supabase (PostgreSQL), Tailwind CSS 4

---

## 1. Project Overview

**Kaş Guide** is a curated city guide for Kaş, Antalya (Turkey). It ingests raw venue data from Google Places and OpenStreetMap, runs it through a human-in-the-loop review pipeline, and serves the curated content as a public-facing city guide.

### System Boundaries

| Boundary | Description |
|----------|-------------|
| **Public Portal** | Static + ISR Next.js pages serving curated places to end-users |
| **Admin Dashboard** | Password-protected SPA for editorial review and content curation |
| **Data Pipeline** | Scripts + DB tables for importing and normalizing raw place data |
| **API Layer** | Next.js route handlers — public read + admin mutations |
| **Database** | Supabase (PostgreSQL) with Row-Level Security |

### What This System Is NOT

- It is **not** a user-generated content platform (no public writes)
- It is **not** a real-time system (ISR revalidation at 1h intervals)
- It is **not** multi-tenant — single editorial team, single region (Kaş)

---

## 2. Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        EXTERNAL SOURCES                     │
│   Google Places API          OpenStreetMap (Overpass API)   │
└──────────────────┬──────────────────────┬───────────────────┘
                   │                      │
                   ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA INGESTION SCRIPTS                    │
│   scripts/import-google-grid.ts    scripts/import-osm.ts   │
│   (Grid-sweep strategy)            (Bbox queries)           │
└──────────────────────────────┬──────────────────────────────┘
                               │  INSERT raw_places
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE (PostgreSQL)                 │
│                                                             │
│  raw_places ──► review_queue ──► places ──► place_content  │
│  grid_sweeps                              ──► place_images  │
│  hero_slides                              ──► place_sources │
│                                                             │
│  [RLS: public read-only on published places]                │
└──────────┬────────────────────────────────┬────────────────-┘
           │                                │
           ▼                                ▼
┌─────────────────────┐        ┌────────────────────────────┐
│   ADMIN DASHBOARD   │        │       PUBLIC API           │
│   /admin/review     │        │   /api/places              │
│   useReviewDashboard│        │   /api/hero-slides         │
│   PlaceEditorDraft  │        │   /api/health              │
└──────────┬──────────┘        └──────────┬─────────────────┘
           │ X-Admin-Password               │ anon (RLS enforced)
           ▼                                ▼
┌──────────────────────────────────────────────────────────── ┐
│                   NEXT.JS APP ROUTER                        │
│   Server Components + ISR (revalidate: 3600s)               │
│   page.tsx    mekan/[slug]/page.tsx   admin/review/page.tsx │
└─────────────────────────────────────────────────────────────┘
```

### Full Data Lifecycle

```
Raw Import  →  raw_places (pending)
            →  Admin reviews in dashboard
            →  persistPlaceFromRaw()
            →  places (draft/published) + place_content + place_images
            →  ISR cache revalidated at next request (1h TTL)
            →  Public portal shows updated data
```

---

## 3. Backend Architecture

### 3.1 Supabase Role Breakdown

| Supabase Feature | How It's Used |
|-----------------|---------------|
| **PostgreSQL** | Primary database — all place, content, image, review, sweep data |
| **Row-Level Security** | Public users: read published places + content + images only |
| **Anon Key** | Browser-safe key for public reads (SSR + client) |
| **Service Role Key** | Server-only key for admin mutations — never sent to browser |
| **Storage** | NOT YET USED — images are URL references, not file uploads |
| **Auth** | NOT USED — custom password-based admin auth instead |

### 3.2 API Layer Responsibilities

```
/api/places              → Public place listing by category (anon, RLS enforced)
/api/hero-slides         → Public hero carousel (anon)
/api/health              → System liveness check
/api/admin/review        → Review queue read + action (requires X-Admin-Password)
/api/admin/raw-places    → Raw place read + publish/reject (requires X-Admin-Password)
/api/admin/session       → Admin session management
/api/admin/hero-slides   → Hero slide CMS (requires X-Admin-Password)
```

**Each admin API route follows the same pattern:**

```typescript
// 1. Auth check (timing-safe)
const authed = await isAdminAuthorized(request);
if (!authed) return 401;

// 2. Parse and validate request body/params
// 3. Delegate to store function (business logic lives in lib/)
// 4. Return structured JSON response
```

### 3.3 Store Layer (lib/)

The `lib/` directory acts as a **service layer** — all DB interactions go through store modules. API routes never query Supabase directly.

| Store File | Responsibility |
|-----------|----------------|
| `public-place-store.ts` | Read-only queries for published places (public) |
| `place-review-store.ts` | Admin dashboard data, review queue actions |
| `raw-place-store.ts` | Raw place CRUD, persistPlaceFromRaw, draft hydration |
| `grid-sweep-store.ts` | Grid sweep progress tracking |
| `hero-slide-store.ts` | Hero carousel data |
| `place-review-utils.ts` | Text normalization utilities |
| `place-taxonomy.ts` | Category definitions + Google Places mappings |

### 3.4 Admin Authentication Flow

```
Browser (sessionStorage: password)
    │
    ├─► GET /api/admin/review  [X-Admin-Password: <password>]
    │
    └─► admin-auth.ts: isAdminAuthorized()
              │
              ├─ timingSafeEqual(header, ADMIN_PASSWORD env var)
              └─ timingSafeEqual(header, ADMIN_API_KEY env var)
                        │
                        ├─ 401 if neither matches
                        └─ proceed if either matches
```

**Critical**: The password is stored in `sessionStorage` (cleared on tab close). It is transmitted as a plain HTTP header on every request. This is **not** session-token-based auth.

### 3.5 Request Flow — Admin Review Action

```
User clicks "Publish" in ReviewQueueList
    │
    ▼
useReviewDashboard.runRawPlaceAction(rawPlaceId, 'publish', draft)
    │
    ▼
POST /api/admin/raw-places { action: 'publish', rawPlaceId, draft: PlaceEditorDraft }
    │
    ├─ isAdminAuthorized() → 401 if invalid
    ├─ validate body shape
    ▼
raw-place-store.ts: persistPlaceFromRaw(adminClient, rawPlaceId, draft)
    │
    ├─ Validate required fields (name, category, 1–5 images)
    ├─ Slugify name, check uniqueness
    ├─ Upsert → places table (status: 'published')
    ├─ Upsert → place_content table
    ├─ Upsert → place_images table (deduplicated)
    ├─ Upsert → place_sources table
    ├─ Update raw_places.processing_status = 'normalized'
    └─ Update review_queue.status = 'approved' (if linked)
    │
    ▼
Return { success: true, placeId, slug }
    │
    ▼
useReviewDashboard.loadDashboard() → refresh full snapshot
```

---

## 4. Data Pipeline

### Step-by-Step Pipeline

#### Step 1 — Grid Sweep (Data Ingestion)

```
scripts/import-google-grid.ts
  - Defines a bounding box around Kaş
  - Divides bbox into a grid of cells (configurable size, e.g., 300m)
  - For each cell: calls Google Places API (Nearby Search)
  - Records cell progress in grid_sweeps + grid_sweep_cells tables
  - Inserts raw venue data into raw_places (status: 'pending')
  - Stores full API response in raw_payload JSONB
```

```
scripts/import-osm.ts
  - Queries Overpass API for amenity nodes in Kaş bbox
  - Maps OSM tags to category_raw values
  - Inserts into raw_places (source_name: 'osm')
```

#### Step 2 — Normalization (Admin Editor)

The admin review dashboard at `/admin/review` is the normalization interface:

```
raw_places record (status: 'pending')
    │
    ▼
PlaceEditorDraft hydrated via buildDraftFromRaw()
    │
    ├─ name_raw → editable name field
    ├─ category_raw → suggestCategoryFromRaw() → editable category
    ├─ address_raw → editable address
    ├─ phone/website → normalizePhone() / normalizeWebsite()
    └─ raw_payload.photos → editable image URL list
```

The editor presents raw data on the left and the editable draft on the right. An admin writes headline, short description, and long description manually.

#### Step 3 — Deduplication (Review Queue)

```
Duplicate detection (TBD — currently manual):
  - review_queue table holds flagged conflicts
  - Possible triggers: same name + close coordinates, same phone number
  - Queue item status: pending → in_review → approved / merged / rejected
  - 'merge' action links raw place to an existing place record
```

> **Gap**: Duplicate detection logic is not yet automated. The review_queue is populated manually or via future automation.

#### Step 4 — Publishing

```
persistPlaceFromRaw(adminClient, rawPlaceId, draft)
    │
    ├─ Creates record in places table (status = 'published')
    ├─ Creates record in place_content (headline, descriptions)
    ├─ Creates records in place_images (deduplicated, cover = first)
    └─ Creates record in place_sources (traceability)
```

#### Step 5 — Public Visibility

```
/api/places?category=restoran
    │
    ├─ public-place-store.listPublishedPlacesByCategory()
    ├─ Joins: places + place_content + place_images (cover only)
    ├─ Filter: status = 'published'
    ├─ RLS: anon user only sees published places
    └─ Returns: PublicPlaceListItem[]

ISR revalidation: Next request after 3600s triggers regeneration
```

### Pipeline Risk Map

| Risk | Location | Severity | Notes |
|------|----------|----------|-------|
| Duplicate data | raw_places import | High | No automated dedup |
| Manual content bottleneck | admin/review | High | 1 editor = bottleneck |
| Image URL rot | place_images | Medium | External URLs, no storage |
| Google API quota | import-google-grid.ts | Medium | No retry/backoff visible |
| No schema validation on raw_payload | raw_places insert | Medium | JSONB is untyped |
| Slug collision on publish | persistPlaceFromRaw | Low | Checked but not auto-resolved |

---

## 5. Security & Auth

### Current Security Model

| Control | Implementation | Strength |
|---------|---------------|----------|
| Admin API auth | `timingSafeEqual(header, ADMIN_PASSWORD)` | Medium |
| DB public access | Supabase RLS (anon key) | Strong |
| Service role key | Server-only, never sent to browser | Strong |
| Input normalization | `normalizeText()`, `normalizePhone()`, etc. | Medium |
| DB constraints | Check constraints on status enums | Medium |
| CSP headers | `vercel.json` (referenced but not confirmed) | Unknown |
| Rate limiting | **NOT IMPLEMENTED** | Gap |
| Token rotation | **NOT IMPLEMENTED** | Gap |
| Audit logging | **NOT IMPLEMENTED** | Gap |

### Identified Security Risks

**Risk 1 — Password-in-Header Auth**
- The admin password is sent as a plain HTTP header on every request
- Stored in `sessionStorage` (XSS accessible)
- No session expiry, no token rotation
- Recommendation: Replace with JWT-based session + httpOnly cookie

**Risk 2 — No Rate Limiting on Admin Endpoints**
- `/api/admin/*` endpoints are brute-forceable
- Recommendation: Add rate limiting middleware (e.g., Upstash Redis + @upstash/ratelimit)

**Risk 3 — Image URLs Not Validated**
- `imageUrls` in PlaceEditorDraft are stored directly
- No validation that URLs are image MIME types
- Recommendation: Validate URL format + optionally probe content-type header

**Risk 4 — No Audit Trail**
- No record of who approved/rejected what or when
- Recommendation: Add `reviewed_by`, `reviewed_at` fields to review_queue and places

**Risk 5 — SSRF via Image URLs**
- Admin can submit arbitrary URLs that the server may later process
- Recommendation: Validate URLs against an allowlist of trusted image CDNs

---

## 6. Performance & Optimization

### Current Caching Strategy

| Layer | Mechanism | TTL |
|-------|-----------|-----|
| Home page | ISR (`revalidate: 3600`) | 1 hour |
| Place detail (`/mekan/[slug]`) | ISR (`revalidate: 3600`) | 1 hour |
| Public API routes | `force-dynamic` (no cache) | None |
| Admin routes | `force-dynamic` | None |

### Missing Optimization Opportunities

1. **No API response caching** — `/api/places` is `force-dynamic`. Low-traffic public API could use `Cache-Control: s-maxage=300` with stale-while-revalidate.

2. **No image optimization pipeline** — Images are external URLs served via raw `<img>` tags or `next/image`. No CDN-hosted copies, no lazy loading guaranteed, no WebP conversion.

3. **No pagination on category results** — `listPublishedPlacesByCategory()` defaults to `limit=12`. Adding 100+ places will require cursor-based pagination.

4. **Category section loads all categories eagerly** — The CategorySection fetches data for the initially selected category on mount. Other categories load on user interaction (lazy). This is correct behavior, but there's no prefetching or SWR-style revalidation.

5. **No DB query optimization** — No indexes visible beyond default primary keys. As place count grows, queries joining `places + place_content + place_images` on category filter will need composite indexes.

---

## 7. Missing Engineering Practices

### Logging

- **Status**: Not implemented
- **Gap**: No structured logging in API routes or store functions
- **Impact**: Impossible to debug production errors without re-deploying with console.log
- **Recommendation**: Use Pino or Winston; log request ID, action type, outcome at INFO level; log stack traces at ERROR level; ship to Sentry or Logtail

### Monitoring & Observability

- **Status**: Not implemented
- **Gap**: No error tracking, no performance monitoring, no alerting
- **Recommendation**: Add Sentry (Next.js SDK) for error capture + Vercel Analytics or Posthog for page-level metrics

### Error Handling

- **Status**: Partial — `error.tsx` boundary exists for pages, but store functions throw uncaught errors
- **Gap**: Store functions like `persistPlaceFromRaw()` throw on Supabase errors; API routes do not wrap in try/catch uniformly
- **Recommendation**: Wrap all store functions in `Result<T, E>` pattern; API routes should always return structured `{ success, data, error }` JSON

### Testing

- **Status**: Not implemented (zero test files found)
- **Gap**: No unit tests, no integration tests, no E2E tests
- **Critical paths with no test coverage**:
  - `persistPlaceFromRaw()` — complex upsert logic
  - `isAdminAuthorized()` — security-critical
  - `slugifyText()` — Türkçe character normalization
  - Review queue state transitions
- **Recommendation**: Start with unit tests for `lib/` pure functions, then integration tests for API routes using Supabase local dev

### CI/CD

- **Status**: No CI pipeline configured (no `.github/workflows/` found)
- **Recommendation**: Add GitHub Actions: lint → typecheck → test → build on every PR; deploy preview on PR; deploy production on merge to main

### Rate Limiting

- **Status**: Not implemented
- **Gap**: All admin and public endpoints are unprotected
- **Recommendation**: Upstash Redis rate limiter as Next.js middleware

### Data Validation

- **Status**: Partial — manual normalization in store functions
- **Gap**: No schema-level validation (no Zod, no JSON Schema)
- **Recommendation**: Add Zod schemas at API route boundaries for all request bodies; reuse schemas for TypeScript inference

---

## 8. Backend Cleanup TODO List

### Architecture & Structure

- [ ] **Introduce Zod validation at all API route boundaries**
  - Problem: Request bodies parsed with manual checks or no validation
  - Why: Type safety is not runtime safety; malformed payloads reach store functions
  - Solution: Define Zod schemas in `lib/schemas/`; validate in every route handler before touching DB

- [ ] **Standardize API response envelope**
  - Problem: Some routes return `{ success, data }`, others return raw arrays or objects
  - Why: Client code handles inconsistent shapes; errors are ambiguous
  - Solution: Create `lib/api-response.ts` helper — always return `{ ok: boolean, data?: T, error?: string }`

- [ ] **Add try/catch + structured error returns to all store functions**
  - Problem: `persistPlaceFromRaw()` and others throw on DB errors; no caller handles them uniformly
  - Why: Unhandled rejections crash the API route; admin sees a 500 with no context
  - Solution: Store functions return `Result<T, AppError>`; callers check `.ok` before reading `.data`

- [ ] **Split raw-place-store.ts (515 lines) into focused modules**
  - Problem: Single file handles CRUD, draft hydration, validation, and publishing logic
  - Why: Violates single-responsibility; difficult to test in isolation
  - Solution: Split into `raw-place-queries.ts`, `place-publisher.ts`, `draft-hydrator.ts`

- [ ] **Move PlaceEditorDraft validation out of persistPlaceFromRaw()**
  - Problem: Validation (name required, 1-5 images) is buried inside the publish function
  - Why: Same validation should run before any API route accepts the body
  - Solution: Create `validatePlaceEditorDraft(draft: unknown): PlaceEditorDraft` using Zod

- [ ] **Replace password-header auth with JWT session cookies**
  - Problem: Admin password sent as plaintext header on every request; stored in sessionStorage (XSS accessible)
  - Why: Compromised XSS = full admin access; no session expiry; no revocation
  - Solution: POST `/api/admin/session` → verify password → sign JWT → set httpOnly cookie with 8h expiry

- [ ] **Add rate limiting middleware to admin endpoints**
  - Problem: `/api/admin/*` can be brute-forced
  - Why: Single-password auth is only as strong as its brute-force resistance
  - Solution: Upstash Redis rate limiter in `middleware.ts` for `/api/admin/*` paths

- [ ] **Add audit log to all review actions**
  - Problem: No record of who did what or when in the review pipeline
  - Why: Content disputes, debugging pipeline issues, and compliance require history
  - Solution: Add `review_audit_log` table with `action`, `raw_place_id`, `actor_ip`, `occurred_at`

### Data Integrity

- [ ] **Implement automated duplicate detection on raw place insert**
  - Problem: review_queue is manually populated; no automated flagging
  - Why: Without it, duplicate places will accumulate unnoticed
  - Solution: PostgreSQL trigger on `raw_places` INSERT: compute geo distance to existing places, fuzzy match on name; insert into review_queue if similarity > threshold

- [ ] **Add composite indexes for common query patterns**
  - Problem: `places` table queried by `status + category_primary`; no index on these columns
  - Why: Full-table scans at 10K+ places will degrade public page load
  - Solution: `CREATE INDEX ON places (status, category_primary)` and `CREATE INDEX ON place_images (place_id, is_cover)`

- [ ] **Migrate image storage from external URLs to Supabase Storage**
  - Problem: Images are referenced by external URLs (Google, OSM CDNs)
  - Why: External URLs rot; no control over resizing/format; GDPR issues with third-party CDNs
  - Solution: On publish, download images server-side → upload to Supabase Storage → replace URLs

- [ ] **Add slug collision auto-resolution**
  - Problem: `persistPlaceFromRaw()` throws if slug exists but placeId is null
  - Why: Reprocessing a rejected place with the same name fails silently from admin perspective
  - Solution: Append `-2`, `-3` suffix on collision; or use UUID suffix as fallback

- [ ] **Validate image URLs before storing**
  - Problem: Any string is accepted as an image URL in PlaceEditorDraft
  - Why: Broken images degrade UX; SSRF risk if server-side processing is added later
  - Solution: Validate URL format with Zod `z.string().url()`; optionally probe content-type header

### Content & API

- [ ] **Add cursor-based pagination to /api/places**
  - Problem: `limit=12` hardcoded default; no pagination beyond first 12 results
  - Why: With 100+ places per category, users cannot discover beyond the first page
  - Solution: Add `cursor` query param; return `nextCursor` in response envelope

- [ ] **Add category group metadata to /api/places response**
  - Problem: CATEGORY_GROUPS defined only client-side in category-section.tsx
  - Why: Duplicated data that can drift; mobile app or future clients must re-implement
  - Solution: Move to `place-taxonomy.ts`; expose via `/api/taxonomy` endpoint

- [ ] **Deduplicate CATEGORIES between supabase.ts and place-taxonomy.ts**
  - Problem: Two separate category definitions exist with different shapes and entries
  - Why: Risk of category label/ID drift; confusing for new developers
  - Solution: Single source of truth in `place-taxonomy.ts`; import everywhere

- [ ] **Cache /api/places with stale-while-revalidate headers**
  - Problem: `/api/places` is `force-dynamic` — every request hits Supabase
  - Why: Public read traffic should not be DB-bound
  - Solution: Add `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` for published place queries

### Observability

- [ ] **Add structured logging to all API routes**
  - Problem: No logs — errors are invisible in production
  - Why: Without logs, debugging requires redeploy with console.log
  - Solution: Add Pino logger; log `{ method, path, action, outcome, durationMs }` per request

- [ ] **Add Sentry error tracking**
  - Problem: Unhandled errors in store functions are invisible
  - Why: Production bugs go undetected until users report them
  - Solution: `@sentry/nextjs` SDK; capture exceptions in API routes and store functions

- [ ] **Add /api/health with DB connectivity check**
  - Problem: `/api/health` exists but likely returns static 200
  - Why: Uptime monitors need to detect DB connectivity failures
  - Solution: Health check should query Supabase with a lightweight probe query

### Testing

- [ ] **Add unit tests for lib/ pure functions**
  - Problem: Zero test coverage on `slugifyText()`, `normalizePhone()`, `suggestCategoryFromRaw()`, `timingSafeEqual()` logic
  - Why: These are mission-critical functions used on every place publish
  - Solution: Vitest unit tests in `src/lib/__tests__/`

- [ ] **Add integration tests for admin API routes**
  - Problem: `/api/admin/raw-places` POST is the most complex endpoint; untested
  - Why: A regression here means places cannot be published
  - Solution: Vitest + Supabase local dev for end-to-end API route testing

- [ ] **Add E2E smoke tests for public portal**
  - Problem: Homepage and place detail pages have no E2E coverage
  - Why: ISR or DB schema changes can silently break public pages
  - Solution: Playwright tests: home loads → category filter works → place detail opens

---

## 9. Scalability

### What Breaks at Scale

| Component | Breaks At | Root Cause |
|-----------|-----------|------------|
| Category API | ~10K places | Full-table scan on `places + joins`, no index on `status + category` |
| Admin dashboard snapshot | ~5K raw places | `getReviewDashboardSnapshot()` loads full arrays into memory |
| Place detail ISR | ~100K pages | ISR regeneration queue backlog under traffic spikes |
| Image loading | 50+ images/page | External URLs, no CDN, no lazy loading guarantee |
| Grid sweep import | Global expansion | Grid cell granularity hardcoded; no distributed worker |

### Concrete Improvements

1. **DB Indexes**: Add `(status, category_primary)` composite index on `places`; add `(place_id, is_cover)` on `place_images`.

2. **Paginated Admin Dashboard**: Replace full snapshot load with server-side cursor pagination. The current model loads all pending raw places at once.

3. **On-Demand ISR Revalidation**: Replace TTL-based ISR with `revalidatePath('/mekan/[slug]')` called from `persistPlaceFromRaw()` on publish. This ensures freshness without hourly sweeps.

4. **Read Replica for Public API**: As traffic grows, separate public reads (anon key) to a Supabase read replica or edge function. Admin writes stay on primary.

5. **CDN-Hosted Images**: Move from external URL references to Supabase Storage with CloudFront or Supabase CDN. Enables resizing, format negotiation (WebP), and TTL control.

6. **Queue-Based Import**: Replace synchronous script execution for Google Places import with a queue (e.g., BullMQ or Upstash QStash). Enables retry, backpressure, and distributed import workers.

---

## 10. Final Expert Recommendations

**1. The service layer is your most valuable asset — protect it.**
The `lib/` store pattern is architecturally sound. Every DB interaction goes through a named function. Do not bypass this with direct Supabase calls in API routes or components.

**2. Kill password-in-header auth before going to production at scale.**
It is the single highest-risk decision in the current codebase. The migration to JWT + httpOnly cookie is a one-afternoon change.

**3. Zod at the boundary, TypeScript everywhere else.**
TypeScript types do not validate runtime data. Add Zod schemas to every API route that accepts a body. This will eliminate the entire class of "malformed payload reaches the DB" bugs.

**4. The duplicate detection gap is a content quality time bomb.**
The review_queue is only as useful as the data that flows into it. Without automated duplicate detection on raw_places INSERT, you will have duplicate places in production by the time you hit 500 entries. Add the PostgreSQL trigger now.

**5. Zero tests is not a starting point — it is a liability.**
Start with `slugifyText()` and `isAdminAuthorized()`. Both are pure functions. Both are security/correctness critical. Tests for these take 30 minutes and eliminate entire categories of regression.

**6. Image URL rot will hurt you quietly.**
External Google Places CDN URLs expire. OSM image links change. By the time you notice, places will have broken images you cannot audit because there is no monitoring. Migrate to owned storage before publishing more than 200 places.

**7. One editor does not scale.**
The current admin model assumes a single reviewer. If editorial volume increases, the `useReviewDashboard` state management (single active selection, sequential flow) will become a bottleneck. Design multi-reviewer support before you need it.

---

## Appendix A — Database Schema Reference

### Core Tables

```
places               → canonical place records (slug, name, category, geo, status)
place_content        → editorial content per place (headline, descriptions)
place_images         → image gallery per place (url, is_cover, sort_order)
place_sources        → traceability (which raw source created this place)
raw_places           → unprocessed imported data (name_raw, payload, status)
review_queue         → conflict/duplicate resolution queue
grid_sweeps          → spatial import sessions
grid_sweep_cells     → per-cell progress within a sweep
hero_slides          → homepage carousel slides
```

### Status Enums

```
raw_places.processing_status:  pending | normalized | review | rejected | error
places.status:                 draft | review | published | archived
places.verification_status:    pending | reviewed | verified | rejected
review_queue.status:           pending | in_review | approved | merged | rejected
grid_sweeps.status:            running | completed | partial | failed
```

---

## Appendix B — Environment Variables

```env
# Public (sent to browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Admin auth (one of the two)
ADMIN_PASSWORD=
ADMIN_API_KEY=

# Data import scripts (optional, not used in app runtime)
GOOGLE_PLACES_API_KEY=
DATABASE_URL=
POSTGRES_URL=
```

---

## Appendix C — Key File Locations

| Concern | File |
|---------|------|
| Admin auth | `src/lib/admin-auth.ts` |
| Admin DB client | `src/lib/supabase-admin.ts` |
| Place publishing | `src/lib/raw-place-store.ts` → `persistPlaceFromRaw()` |
| Review queue logic | `src/lib/place-review-store.ts` → `applyReviewAction()` |
| Category definitions | `src/lib/place-taxonomy.ts` |
| Public place queries | `src/lib/public-place-store.ts` |
| Admin dashboard state | `src/app/admin/review/useReviewDashboard.ts` |
| Place detail page | `src/app/mekan/[slug]/page.tsx` |
| Category UI | `src/features/home/components/category-section.tsx` |
| DB migrations | `supabase/migrations/` |
