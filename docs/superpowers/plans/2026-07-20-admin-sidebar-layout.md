# Admin Panel Sidebar Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the per-page top nav (`AdminSectionLinks`, re-rendered on every admin page and visibly "jumping" between navigations) with a single, sticky left sidebar rendered once in a shared layout, plus a visual refresh consistent with the existing teal/glass admin palette.

**Architecture:** Use a Next.js route group `src/app/admin/(dashboard)/` to host all authenticated admin pages under one `layout.tsx` that renders a persistent `AdminSidebar` + content area. URLs are unchanged because `(dashboard)` is not part of the path. A new `AdminSidebarActionsContext` lets each page publish its own "refresh" action (label, loading state, handler) to the sidebar, since the sidebar no longer lives inside the page that owns that state. The login page (`/admin`) and the two redirect-only pages (`/admin/review`, `/admin/sweeps`) stay outside the group, unchanged.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, plain CSS (globals.css) — no new dependencies.

## Global Constraints

- URLs must not change: `/admin/places`, `/admin/hero-slides`, `/admin/updates`, `/admin/scrapers/news`, `/admin/scrapers/places`, `/admin/scrapers/places/[id]` all keep their current paths.
- `/admin` (login/password gate) is NOT part of the sidebar shell.
- `/admin/review` and `/admin/sweeps` (redirect-only pages) are untouched.
- Desktop (`>900px`): sidebar is a sticky left column, `position: sticky; top: var(--header-height)`.
- Mobile (`≤900px`): sidebar collapses into a horizontal compact strip (evolution of the existing `.admin-compact-nav` styling), no drawer/hamburger.
- Visual language: reuse existing teal palette (`#0f8f83` / `#0b3b39` active state, `rgba(0, 168, 150, 0.14)` borders, `var(--glass-white-surface)` background, `0 18px 42px rgba(17, 59, 58, 0.09)` shadow), 20-24px border-radius, consistent with `.admin-summary-card-places` / `.admin-shell-places` today.
- No test framework exists in this repo (no Jest/Playwright configured) — verification is `npm run lint` + `npm run build` + manual dev-server check.
- Every touched page keeps its exact current inner content/behavior; only the nav extraction and wrapper markup change.

---

### Task 1: Create `AdminSidebarActionsContext` and `useAdminSidebarRefreshAction` hook

**Files:**
- Create: `src/app/admin/(dashboard)/AdminSidebarActionsContext.tsx`

**Interfaces:**
- Produces:
  - `AdminSidebarActionsProvider({ children }: { children: React.ReactNode })` — React component, wraps the dashboard layout.
  - `useAdminSidebarRefreshAction(action: { label: string; refreshing: boolean; onRefresh: () => void } | null): void` — hook called by each page; registers/updates/clears its refresh action in the shared context as the component mounts/updates/unmounts.
  - `useAdminSidebarRefreshState(): { label: string; refreshing: boolean; onRefresh: () => void } | null` — hook used by `AdminSidebar` to read the currently active page's refresh action.

- [ ] **Step 1: Write the context + hooks file**

```tsx
'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type RefreshAction = {
  label: string
  refreshing: boolean
  onRefresh: () => void
}

type AdminSidebarActionsContextValue = {
  refreshAction: RefreshAction | null
  setRefreshAction: (action: RefreshAction | null) => void
}

const AdminSidebarActionsContext = createContext<AdminSidebarActionsContextValue | null>(null)

export function AdminSidebarActionsProvider({ children }: { children: React.ReactNode }) {
  const [refreshAction, setRefreshAction] = useState<RefreshAction | null>(null)

  const value = useMemo(
    () => ({ refreshAction, setRefreshAction }),
    [refreshAction],
  )

  return (
    <AdminSidebarActionsContext.Provider value={value}>
      {children}
    </AdminSidebarActionsContext.Provider>
  )
}

function useAdminSidebarActionsContext(): AdminSidebarActionsContextValue {
  const context = useContext(AdminSidebarActionsContext)

  if (!context) {
    throw new Error('useAdminSidebarActionsContext must be used within AdminSidebarActionsProvider')
  }

  return context
}

export function useAdminSidebarRefreshAction(action: RefreshAction | null): void {
  const { setRefreshAction } = useAdminSidebarActionsContext()

  useEffect(() => {
    setRefreshAction(action)

    return () => setRefreshAction(null)
    // action is a fresh object every render by design (label/refreshing/onRefresh
    // change together); comparing by identity would register on every render,
    // which is fine here since setRefreshAction only updates state when the
    // reference actually changes are cheap no-ops for React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action?.label, action?.refreshing, action?.onRefresh])
}

export function useAdminSidebarRefreshState(): RefreshAction | null {
  const { refreshAction } = useAdminSidebarActionsContext()
  return refreshAction
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors referencing `AdminSidebarActionsContext.tsx` (file has no consumers yet, so it must type-check standalone).

- [ ] **Step 3: Commit**

```bash
git add "src/app/admin/(dashboard)/AdminSidebarActionsContext.tsx"
git commit -m "feat(admin): add sidebar refresh-action context"
```

---

### Task 2: Build the `AdminSidebar` component

**Files:**
- Create: `src/app/admin/(dashboard)/AdminSidebar.tsx`

**Interfaces:**
- Consumes: `useAdminSidebarRefreshState()` from Task 1 (`src/app/admin/(dashboard)/AdminSidebarActionsContext.tsx`).
- Produces: `AdminSidebar()` — no props, default export. Renders navigation + refresh + logout. Reads active section from `usePathname()`. Logout is handled locally (imports `adminLogout` from `@/lib/admin-session-client` and `useRouter` from `next/navigation`, mirroring the existing per-page `logout()` pattern), since no page-level logout function needs to be threaded through context.

- [ ] **Step 1: Write the component**

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { adminLogout } from '@/lib/admin-session-client'

import { useAdminSidebarRefreshState } from './AdminSidebarActionsContext'

type SidebarSection = {
  key: string
  href: string
  label: string
  icon: React.ReactNode
  isActive: (pathname: string) => boolean
}

const SECTIONS: SidebarSection[] = [
  {
    key: 'places',
    href: '/admin/places',
    label: 'Mekanlar',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.4" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/places'),
  },
  {
    key: 'hero',
    href: '/admin/hero-slides',
    label: 'Hero',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2.4" />
        <path d="M3 15l5-5 4 4 3-3 6 6" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/hero-slides'),
  },
  {
    key: 'updates',
    href: '/admin/updates',
    label: 'Haberler ve Duyurular',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4z" />
        <path d="M8 9h7M8 12.5h7M8 16h4" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/updates'),
  },
  {
    key: 'scrapers',
    href: '/admin/scrapers/news',
    label: "Scraper'lar",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-4.4-4.4" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith('/admin/scrapers'),
  },
]

export default function AdminSidebar() {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const refreshAction = useAdminSidebarRefreshState()

  async function handleLogout() {
    await adminLogout()
    router.replace('/admin')
  }

  return (
    <aside className="admin-sidebar" aria-label="Admin bölümleri">
      <div className="admin-sidebar-brand">
        <span className="admin-eyebrow admin-sidebar-eyebrow">Admin</span>
      </div>

      <nav className="admin-sidebar-nav">
        {SECTIONS.map((section) => {
          const active = section.isActive(pathname)

          return (
            <Link
              key={section.key}
              href={section.href}
              className={`admin-sidebar-link${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="admin-sidebar-link-icon">{section.icon}</span>
              <span className="admin-sidebar-link-label">{section.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="admin-sidebar-footer">
        {refreshAction ? (
          <button
            type="button"
            className="admin-sidebar-action"
            onClick={refreshAction.onRefresh}
            disabled={refreshAction.refreshing}
          >
            {refreshAction.refreshing ? 'Yükleniyor...' : refreshAction.label}
          </button>
        ) : null}

        <button type="button" className="admin-sidebar-action admin-sidebar-action-logout" onClick={() => void handleLogout()}>
          Çıkış yap
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verify `adminLogout` export shape matches usage**

Run: `grep -n "export" src/lib/admin-session-client.ts` (or open the file) and confirm `adminLogout` exists and takes no arguments, returning `Promise<void>` or similar — matching how `usePlacesDashboard.ts` calls it (`await adminLogout()`).
Expected: signature matches; no changes needed to `admin-session-client.ts`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/admin/(dashboard)/AdminSidebar.tsx"
git commit -m "feat(admin): add AdminSidebar component"
```

---

### Task 3: Add sidebar CSS to `globals.css`

**Files:**
- Modify: `src/app/globals.css` (append new rules near the existing `.admin-compact-nav` block, e.g. after line 6970)

**Interfaces:**
- Produces CSS classes consumed by Task 2's `AdminSidebar.tsx` and Task 4's dashboard layout: `.admin-dashboard-shell`, `.admin-dashboard-content`, `.admin-sidebar`, `.admin-sidebar-brand`, `.admin-sidebar-eyebrow`, `.admin-sidebar-nav`, `.admin-sidebar-link`, `.admin-sidebar-link.is-active`, `.admin-sidebar-link-icon`, `.admin-sidebar-link-label`, `.admin-sidebar-footer`, `.admin-sidebar-action`, `.admin-sidebar-action-logout`.

- [ ] **Step 1: Insert the CSS block**

Insert after the `.admin-compact-nav-separator` rule (around line 6970 in the current file — search for `.admin-compact-nav-separator {` and insert immediately after its closing `}`):

```css
.admin-dashboard-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  align-items: start;
  gap: 1.5rem;
  max-width: 1360px;
  margin: 0 auto;
  padding: calc(var(--header-height) + 2rem) 1.5rem 3rem;
}

.admin-dashboard-content {
  min-width: 0;
}

.admin-sidebar {
  position: sticky;
  top: calc(var(--header-height) + 1.5rem);
  display: grid;
  gap: 1.25rem;
  padding: 1.35rem 1.1rem;
  border-radius: 24px;
  background: var(--glass-white-surface);
  border: 1px solid rgba(0, 168, 150, 0.14);
  box-shadow: 0 18px 42px rgba(17, 59, 58, 0.09);
}

.admin-sidebar-brand {
  display: flex;
}

.admin-sidebar-eyebrow {
  background: rgba(0, 168, 150, 0.1);
  color: #0b3b39;
}

.admin-sidebar-nav {
  display: grid;
  gap: 0.3rem;
}

.admin-sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.62rem 0.7rem;
  border-radius: 14px;
  color: rgba(15, 23, 42, 0.72);
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.admin-sidebar-link:hover,
.admin-sidebar-link:focus-visible {
  color: #0f8f83;
  background: rgba(0, 168, 150, 0.06);
}

.admin-sidebar-link.is-active {
  color: #0b3b39;
  background: rgba(0, 168, 150, 0.1);
  border-left-color: #0f8f83;
}

.admin-sidebar-link-icon {
  display: inline-flex;
  flex: 0 0 auto;
  color: inherit;
}

.admin-sidebar-link-label {
  flex: 1 1 auto;
  min-width: 0;
}

.admin-sidebar-footer {
  display: grid;
  gap: 0.5rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(15, 23, 42, 0.1);
}

.admin-sidebar-action {
  border: 0;
  background: transparent;
  padding: 0.5rem 0.4rem;
  border-radius: 12px;
  color: rgba(15, 23, 42, 0.72);
  font-size: 0.88rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease, opacity 0.2s ease;
}

.admin-sidebar-action:hover,
.admin-sidebar-action:focus-visible {
  color: #0f8f83;
  background: rgba(0, 168, 150, 0.06);
}

.admin-sidebar-action:disabled {
  opacity: 0.55;
  cursor: wait;
}

.admin-sidebar-action-logout {
  color: rgba(185, 28, 28, 0.82);
}

.admin-sidebar-action-logout:hover,
.admin-sidebar-action-logout:focus-visible {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.08);
}

@media (max-width: 900px) {
  .admin-dashboard-shell {
    grid-template-columns: minmax(0, 1fr);
    padding: calc(var(--header-height) + 1.25rem) 1rem 2rem;
  }

  .admin-sidebar {
    position: static;
    padding: 0.9rem 1rem;
  }

  .admin-sidebar-nav {
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    overflow-x: auto;
    gap: 0.4rem;
    padding-bottom: 0.2rem;
  }

  .admin-sidebar-link {
    border-left: none;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }

  .admin-sidebar-link.is-active {
    border-left-color: transparent;
    border-bottom-color: #0f8f83;
  }

  .admin-sidebar-footer {
    flex-direction: row;
    display: flex;
    justify-content: space-between;
    border-top: none;
    padding-top: 0.6rem;
    border-top: 1px solid rgba(15, 23, 42, 0.1);
  }
}
```

- [ ] **Step 2: Verify the file still parses**

Run: `npm run build` (Next.js build will fail loudly on invalid CSS syntax via the CSS loader).
Expected: build proceeds past CSS compilation (may still fail later in this task if other pieces aren't wired yet — acceptable at this stage; just confirm no CSS parse error is reported).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style(admin): add sidebar layout styles"
```

---

### Task 4: Create the `(dashboard)` route group layout

**Files:**
- Create: `src/app/admin/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: `AdminSidebarActionsProvider` (Task 1), `AdminSidebar` default export (Task 2), CSS classes `.admin-dashboard-shell` / `.admin-dashboard-content` (Task 3).
- Produces: default-exported `AdminDashboardLayout({ children }: { children: React.ReactNode })`, the layout Next.js applies to every route under `src/app/admin/(dashboard)/`.

- [ ] **Step 1: Write the layout**

```tsx
import { AdminSidebarActionsProvider } from './AdminSidebarActionsContext'
import AdminSidebar from './AdminSidebar'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSidebarActionsProvider>
      <div className="admin-dashboard-shell">
        <AdminSidebar />
        <div className="admin-dashboard-content">{children}</div>
      </div>
    </AdminSidebarActionsProvider>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/admin/(dashboard)/layout.tsx"
git commit -m "feat(admin): add dashboard route group layout with sidebar"
```

---

### Task 5: Move `places`, `hero-slides`, `updates` pages into the route group and wire the refresh hook

**Files:**
- Move: `src/app/admin/places/page.tsx` → `src/app/admin/(dashboard)/places/page.tsx`
- Move: `src/app/admin/places/usePlacesDashboard.ts` → `src/app/admin/(dashboard)/places/usePlacesDashboard.ts`
- Move: `src/app/admin/hero-slides/page.tsx` → `src/app/admin/(dashboard)/hero-slides/page.tsx`
- Move: `src/app/admin/updates/page.tsx` → `src/app/admin/(dashboard)/updates/page.tsx`
- Modify (each of the 3 files above): remove `AdminSectionLinks` usage, add `useAdminSidebarRefreshAction` call, remove the now-unused wrapper markup (`admin-places-header-actions` / `admin-toolbar-places` div that only existed to hold the nav + status — keep the status element, drop the nav).

**Interfaces:**
- Consumes: `useAdminSidebarRefreshAction` from `../../AdminSidebarActionsContext` (Task 1) — relative path from `src/app/admin/(dashboard)/places/page.tsx` is `../AdminSidebarActionsContext` (one level up, since `places/` is a direct child of `(dashboard)/`).

- [ ] **Step 1: Move the three page files and the places hook file with git so history is preserved**

```bash
git mv src/app/admin/places "src/app/admin/(dashboard)/places"
git mv src/app/admin/hero-slides "src/app/admin/(dashboard)/hero-slides"
git mv src/app/admin/updates "src/app/admin/(dashboard)/updates"
```

- [ ] **Step 2: Fix `usePlacesDashboard.ts` import path if needed**

Open `src/app/admin/(dashboard)/places/usePlacesDashboard.ts` and check its imports (e.g. `@/lib/...`, `../review/...`). Since it only used `@/`-alias imports and the file didn't move relative to `review/`, confirm any `../review/` relative import now needs to become `../../review/` (one extra directory level, since `places/` moved from `admin/places/` to `admin/(dashboard)/places/`). Search:

Run: `grep -n "from '\.\./" "src/app/admin/(dashboard)/places/usePlacesDashboard.ts"`

For every match pointing outside `(dashboard)/places/` at something under `src/app/admin/` (not under `(dashboard)/`), add one extra `../`.

- [ ] **Step 3: Edit `src/app/admin/(dashboard)/places/page.tsx`**

Change the import block:

```tsx
import { Button } from '@/components/ui/button'
import { CATEGORIES, CATEGORY_GROUPS } from '@/lib/categories'

import { useAdminSidebarRefreshAction } from '../AdminSidebarActionsContext'
import { PlaceEditorForm } from '../../review/components/PlaceEditorForm'
import { formatCompactDate, formatDate, formatPlaceStatus } from '../../review/formatters'
import { usePlacesDashboard } from './usePlacesDashboard'
```

(Remove the `AdminSectionLinks` import line entirely.)

Inside the component, after the `usePlacesDashboard()` destructure, add:

```tsx
  useAdminSidebarRefreshAction({
    label: 'Listeyi yenile',
    refreshing: isLoading,
    onRefresh: () => loadDashboard(),
  })
```

Replace the JSX block:

```tsx
        <div className="admin-places-header-actions">
          <AdminSectionLinks
            current="places"
            onRefresh={() => loadDashboard()}
            refreshLabel="Listeyi yenile"
            refreshing={isLoading}
            onLogout={logout}
          />

          <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
            <span>{status.message}</span>
          </div>
        </div>
```

with:

```tsx
        <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
          <span>{status.message}</span>
        </div>
```

`logout` is still destructured from `usePlacesDashboard()` but no longer used in JSX — remove it from the destructure too (the sidebar now owns logout via Task 2's `AdminSidebar`).

- [ ] **Step 4: Edit `src/app/admin/(dashboard)/hero-slides/page.tsx`**

Change the import block (remove `AdminSectionLinks` import, add):

```tsx
import { useAdminSidebarRefreshAction } from '../AdminSidebarActionsContext'
```

After the `activeCount` `useMemo`, add:

```tsx
  useAdminSidebarRefreshAction({
    label: 'Hero listesini yenile',
    refreshing: isLoading,
    onRefresh: () => loadSlides(),
  })
```

Replace:

```tsx
      <section className="admin-toolbar admin-toolbar-places">
        <AdminSectionLinks
          current="hero"
          onRefresh={() => loadSlides()}
          refreshLabel="Hero listesini yenile"
          refreshing={isLoading}
          onLogout={logout}
        />

        <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
          <span>{status.message}</span>
        </div>
      </section>
```

with:

```tsx
      <section className="admin-toolbar admin-toolbar-places">
        <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
          <span>{status.message}</span>
        </div>
      </section>
```

The local `logout` function in this file becomes unused — remove its definition (the function declared as `function logout() { clearStoredAdminPassword(); setAdminPassword(''); router.replace('/admin') }`). If `clearStoredAdminPassword` becomes unused after removal, also remove it from the import from `@/lib/admin-password-client`.

- [ ] **Step 5: Edit `src/app/admin/(dashboard)/updates/page.tsx`**

Same pattern: remove `AdminSectionLinks` import, add `useAdminSidebarRefreshAction` import from `../AdminSidebarActionsContext`. Find where `loadData`, `isLoading`, and `logout` are defined (near the top of the component) and add after their declarations:

```tsx
  useAdminSidebarRefreshAction({
    label: 'Listeyi yenile',
    refreshing: isLoading,
    onRefresh: () => loadData(),
  })
```

Replace:

```tsx
        <div className="admin-places-header-actions">
          <AdminSectionLinks
            current="updates"
            onRefresh={() => loadData()}
            refreshLabel="Listeyi yenile"
            refreshing={isLoading}
            onLogout={logout}
          />

          <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
            <span>{status.message}</span>
          </div>
        </div>
```

with:

```tsx
        <div className={`admin-status admin-status-${status.tone} admin-status-places`}>
          <span>{status.message}</span>
        </div>
```

Remove the local `logout` function definition and, if it becomes unused, its `clearStoredAdminPassword` import — same as Task 5 Step 4's pattern. Keep `getStoredAdminPassword` / `storeAdminPassword` if still used elsewhere in the file (they are, for `loadData`/auth restore).

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors. Pay attention to "declared but never used" for `logout`/`clearStoredAdminPassword` — remove any leftover unused bindings the compiler flags.

- [ ] **Step 7: Commit**

```bash
git add "src/app/admin/(dashboard)/places" "src/app/admin/(dashboard)/hero-slides" "src/app/admin/(dashboard)/updates"
git commit -m "refactor(admin): move places/hero/updates pages into dashboard sidebar layout"
```

---

### Task 6: Move `scrapers/news`, `scrapers/places`, `scrapers/places/[id]` pages into the route group

**Files:**
- Move: `src/app/admin/scrapers/news/page.tsx` → `src/app/admin/(dashboard)/scrapers/news/page.tsx`
- Move: `src/app/admin/scrapers/places/page.tsx` → `src/app/admin/(dashboard)/scrapers/places/page.tsx`
- Move: `src/app/admin/scrapers/places/[id]/page.tsx` → `src/app/admin/(dashboard)/scrapers/places/[id]/page.tsx`
- Modify (all 3): same pattern as Task 5 — drop `AdminSectionLinks`, add `useAdminSidebarRefreshAction`.

**Interfaces:**
- Consumes: `useAdminSidebarRefreshAction` from `../../AdminSidebarActionsContext` (for `scrapers/news/page.tsx` and `scrapers/places/page.tsx`, which sit two levels under `(dashboard)/`) and `../../../AdminSidebarActionsContext` (for `scrapers/places/[id]/page.tsx`, three levels under `(dashboard)/`).

- [ ] **Step 1: Move the files**

```bash
git mv "src/app/admin/scrapers" "src/app/admin/(dashboard)/scrapers"
```

(This moves `news/`, `places/`, and `places/[id]/` together in one operation since they're all under `scrapers/`.)

- [ ] **Step 2: Edit `src/app/admin/(dashboard)/scrapers/news/page.tsx`**

Remove the `AdminSectionLinks` import (was `'../../components/AdminSectionLinks'`), add:

```tsx
import { useAdminSidebarRefreshAction } from '../../AdminSidebarActionsContext'
```

Find where `loadData`, `isLoading`/`isRunning` and `logout` are defined near the top of the component body and add:

```tsx
  useAdminSidebarRefreshAction({
    label: 'Yenile',
    refreshing: isLoading,
    onRefresh: () => loadData(),
  })
```

(Use the exact loading-state variable name already in this file — confirm via the file's own state declarations, it is the boolean controlling the existing `refreshing` prop passed to `AdminSectionLinks`.)

Replace the JSX region containing `<AdminSectionLinks current="scrapers" ... />` (structurally identical to Task 5's pattern: nav + status wrapped in `admin-places-header-actions`) by deleting the `<AdminSectionLinks ... />` element and un-wrapping the status `div` exactly as done for `places`/`updates` in Task 5. Remove the now-unused local `logout` function and `clearStoredAdminPassword` import if unused after removal.

- [ ] **Step 3: Edit `src/app/admin/(dashboard)/scrapers/places/page.tsx`**

Same pattern as Step 2: remove `AdminSectionLinks` import (`'../../components/AdminSectionLinks'`), add:

```tsx
import { useAdminSidebarRefreshAction } from '../../AdminSidebarActionsContext'
```

Register the refresh action using this file's own `loadData`/loading-state names, with the label matching this page's current `refreshLabel="Listeyi yenile"`:

```tsx
  useAdminSidebarRefreshAction({
    label: 'Listeyi yenile',
    refreshing: isLoading,
    onRefresh: () => loadData(),
  })
```

Delete the `<AdminSectionLinks current="scrapers" ... />` element and un-wrap the status div (same transformation as Task 5), remove the unused local `logout`.

- [ ] **Step 4: Edit `src/app/admin/(dashboard)/scrapers/places/[id]/page.tsx`**

Remove the `AdminSectionLinks` import (was `'../../../components/AdminSectionLinks'`), add:

```tsx
import { useAdminSidebarRefreshAction } from '../../../AdminSidebarActionsContext'
```

Register the refresh action using this file's `loadData`/`isLoading` names (label `'Yenile'`, matching the current `refreshLabel="Yenile"` on this page). Delete the `<AdminSectionLinks current="scrapers" ... />` element and un-wrap the status div. Remove the unused local `logout`.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(dashboard)/scrapers"
git commit -m "refactor(admin): move scrapers pages into dashboard sidebar layout"
```

---

### Task 7: Delete the now-unused `AdminSectionLinks` component and its old directory

**Files:**
- Delete: `src/app/admin/components/AdminSectionLinks.tsx`
- Delete (if empty after removal): `src/app/admin/components/` directory
- Delete (if empty after Task 5/6 moves): `src/app/admin/scrapers/` (old location, should already be gone via `git mv`), `src/app/admin/places/`, `src/app/admin/hero-slides/`, `src/app/admin/updates/` (old locations)

**Interfaces:** None — this task only removes dead code. Verify nothing outside the moved pages imports `AdminSectionLinks` before deleting.

- [ ] **Step 1: Confirm no remaining references**

Run: `grep -rn "AdminSectionLinks" src/`
Expected: no output (all six page files were updated in Tasks 5-6, and the component's own file is about to be deleted).

- [ ] **Step 2: Delete the component file**

```bash
git rm "src/app/admin/components/AdminSectionLinks.tsx"
```

- [ ] **Step 3: Confirm old directories are gone**

Run: `git status`
Expected: no leftover files under `src/app/admin/places/`, `src/app/admin/hero-slides/`, `src/app/admin/updates/`, `src/app/admin/scrapers/`, or `src/app/admin/components/` (they were moved via `git mv` in Tasks 5-6, so this should already be clean — if `src/app/admin/components/` still exists because it held other files, leave it and only confirm `AdminSectionLinks.tsx` is gone from it).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(admin): remove unused AdminSectionLinks component"
```

---

### Task 8: Full verification pass

**Files:** None modified — verification only.

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors (warnings pre-existing in untouched files are acceptable; any warning/error in a file touched by this plan must be fixed).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds; Next.js route list in the build output shows `/admin/places`, `/admin/hero-slides`, `/admin/updates`, `/admin/scrapers/news`, `/admin/scrapers/places`, `/admin/scrapers/places/[id]` as valid routes (the `(dashboard)` segment must NOT appear in the printed route paths — if it does, the route group naming/placement is wrong).

- [ ] **Step 4: Manual dev-server check**

Run: `npm run dev` (background)

Then in a browser:
1. Visit `/admin`, log in with the admin password. Confirm redirect to `/admin/places` and NO sidebar/route-group flash on the login screen itself.
2. On `/admin/places`, confirm the sidebar renders on the left, "Mekanlar" is highlighted as active, and the page content (list, filters, pagination) renders unchanged.
3. Click "Hero" in the sidebar → confirm URL becomes `/admin/hero-slides`, sidebar does NOT visibly unmount/remount (no flash/jump), "Hero" is now highlighted, and the sidebar's refresh button now reads "Hero listesini yenile".
4. Click "Haberler ve Duyurular" → confirm URL, active state, and refresh label ("Listeyi yenile") update correctly.
5. Click "Scraper'lar" → confirm it navigates to `/admin/scrapers/news`, sidebar highlights "Scraper'lar". Then manually navigate to `/admin/scrapers/places` and to a job detail page (`/admin/scrapers/places/<id>`) — confirm "Scraper'lar" stays highlighted on both.
6. Click the sidebar's refresh action on at least 2 different pages — confirm each triggers that page's own reload (network tab shows the expected API call) and shows its loading label while in flight.
7. Click "Çıkış yap" — confirm it logs out and redirects to `/admin`.
8. Resize the browser to <900px width — confirm the sidebar collapses into a horizontal strip at the top, remains usable (all 4 links + actions reachable, horizontal scroll if needed), and page content below it is not obscured or overlapped.

Expected: all 8 checks pass with no visual "jump" of the nav between page transitions, no console errors.

- [ ] **Step 5: Commit (only if manual verification required follow-up fixes; otherwise skip — nothing to commit)**

If Step 4 revealed no issues, this step is a no-op — the plan is complete as of Task 7's commit.
