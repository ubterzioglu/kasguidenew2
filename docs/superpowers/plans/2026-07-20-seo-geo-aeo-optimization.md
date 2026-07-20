# SEO/GEO/AEO Technical Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix broken internal links in site-wide structured data (the root cause of Search Console 404s), expand the sitemap to include all public pages, add missing OG/Twitter share images, and enrich JSON-LD across the site for better AI/answer-engine (GEO/AEO) parsing — all without writing new page content.

**Architecture:** This is a series of small, independent, mechanical edits across existing metadata/JSON-LD/sitemap files. No new abstractions, no new content copy, no new dependencies. Each task is a self-contained fix to one file or one small group of related files.

**Tech Stack:** Next.js 15 App Router (`MetadataRoute.Sitemap`, `MetadataRoute.Robots`, `Metadata` type), plain JSON-LD via inline `<script type="application/ld+json">`.

## Global Constraints

- Do NOT add 301 redirects for the old/broken URLs found in Search Console — user explicitly decided against this. Only fix the source of the bad links (JSON-LD) and update the sitemap.
- Do NOT write new marketing/body copy for any page. All FAQPage/ItemList entries must be built from data that already exists in the codebase (existing FAQ items, existing page list, existing category data) — no invented Turkish prose.
- Do NOT set up dynamic OG image generation (`opengraph-image.tsx` / `ImageResponse`). Use the existing static `public/og.jpg`.
- Site base URL is `https://www.kasguide.de` (used consistently in `sitemap.ts`, `robots.ts`, `layout.tsx`, `home-jsonld.tsx` — match this exact string everywhere).
- No test framework exists in this repo — verification is `npm run build` + `npx tsc --noEmit` + manual inspection of rendered HTML/JSON-LD (via a local dev server, HTTP-level, since no browser tool is available in this environment).
- Every fix must be verified against the actual current file tree (`ls src/app | grep '^kas-'`), not assumed from memory — the whole point of Task 1 is that a prior hardcoded URL list drifted from reality.

---

### Task 1: Fix broken URLs in the site-wide `CollectionPage.ItemList` JSON-LD

**Files:**
- Modify: `src/features/home/components/home-jsonld.tsx:56-73` (the `buildCollectionPageSchema` function)

**Context:** This is the root cause of the Search Console 404s shown in the screenshot (e.g. `kas-plajlari`, `rehber/gece-hayati`-style stale links). `<HomeJsonLd />` is rendered on the home page AND on every `kas-*` category page (e.g. `src/app/kas-otel-onerileri/page.tsx:277`), so this one hardcoded `itemListElement` array is crawled site-wide. Several of its 9 URLs point to slugs that don't exist as real pages. The real page directories (verified via `ls src/app | grep '^kas-'`) are: `kas-dalis-noktalari`, `kas-en-guzel-plajlar`, `kas-gece-hayati`, `kas-kahvalti-mekanlari`, `kas-koylari`, `kas-merkez-gezilecek-yerler`, `kas-nerede-ne-yenir`, `kas-otel-onerileri`, `kas-tatil-rehberi`, `kas-tekne-turu`, `kas-yapilacak-aktiviteler` (11 pages total).

**Interfaces:**
- Produces: an updated `buildCollectionPageSchema()` return value consumed by `HomeJsonLd()` (same file, line 152) — no signature change, just corrected data.

- [ ] **Step 1: Read the current file to confirm line numbers haven't shifted**

Read `src/features/home/components/home-jsonld.tsx` and confirm the `buildCollectionPageSchema` function still matches what's quoted below. If line numbers differ, adjust the edit target but keep the same logical change.

- [ ] **Step 2: Replace the `itemListElement` array with corrected, verified URLs covering all 11 real category pages**

Replace the current `mainEntity.itemListElement` array (currently 9 items, some broken) with this exact 11-item array — one entry per real page directory, named with a clear, natural Turkish label, ordered roughly by expected user intent (accommodation/food first, since those are the highest-intent categories per the user's stated goal of ranking for "otel"/"tatil" searches):

```tsx
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Kaş Tatil Rehberi', url: 'https://www.kasguide.de/kas-tatil-rehberi' },
        { '@type': 'ListItem', position: 2, name: 'Kaş Otel Önerileri', url: 'https://www.kasguide.de/kas-otel-onerileri' },
        { '@type': 'ListItem', position: 3, name: 'Kaş Gezilecek Yerler', url: 'https://www.kasguide.de/kas-merkez-gezilecek-yerler' },
        { '@type': 'ListItem', position: 4, name: 'Kaş Plajları', url: 'https://www.kasguide.de/kas-en-guzel-plajlar' },
        { '@type': 'ListItem', position: 5, name: 'Kaş Dalış Noktaları', url: 'https://www.kasguide.de/kas-dalis-noktalari' },
        { '@type': 'ListItem', position: 6, name: 'Kaş Tekne Turu', url: 'https://www.kasguide.de/kas-tekne-turu' },
        { '@type': 'ListItem', position: 7, name: 'Kaş Nerede Ne Yenir', url: 'https://www.kasguide.de/kas-nerede-ne-yenir' },
        { '@type': 'ListItem', position: 8, name: 'Kaş Kahvaltı Mekanları', url: 'https://www.kasguide.de/kas-kahvalti-mekanlari' },
        { '@type': 'ListItem', position: 9, name: 'Kaş Gece Hayatı', url: 'https://www.kasguide.de/kas-gece-hayati' },
        { '@type': 'ListItem', position: 10, name: 'Kaş Köyleri', url: 'https://www.kasguide.de/kas-koylari' },
        { '@type': 'ListItem', position: 11, name: 'Kaş Yapılacak Aktiviteler', url: 'https://www.kasguide.de/kas-yapilacak-aktiviteler' },
      ],
```

Also update `numberOfItems: 9` to `numberOfItems: 11` on the line directly above `itemListElement` (currently line 59).

- [ ] **Step 3: Verify every URL in the new array resolves to a real page**

Run: `for slug in kas-tatil-rehberi kas-otel-onerileri kas-merkez-gezilecek-yerler kas-en-guzel-plajlar kas-dalis-noktalari kas-tekne-turu kas-nerede-ne-yenir kas-kahvalti-mekanlari kas-gece-hayati kas-koylari kas-yapilacak-aktiviteler; do test -f "src/app/$slug/page.tsx" && echo "OK: $slug" || echo "MISSING: $slug"; done`
Expected: all 11 lines print `OK: <slug>`, zero `MISSING` lines.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `home-jsonld.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/components/home-jsonld.tsx
git commit -m "fix(seo): correct broken category URLs in site-wide ItemList schema"
```

---

### Task 2: Add all 11 category pages and `/faq` to the sitemap

**Files:**
- Modify: `src/app/sitemap.ts`

**Context:** The current `staticPages` array (lines 8-14) only lists 5 static pages (`/`, `/biz-kimiz`, `/iletisim`, `/faq`... wait, re-check: currently it's `/`, `/biz-kimiz`, `/iletisim`, `/faq`, `/mekan-oner`). Actually `/faq` IS already present. Missing: all 11 `kas-*` category pages are absent from the sitemap entirely, despite being real, indexable, content-rich pages — this is a significant gap for a site whose whole SEO strategy depends on these category pages ranking.

**Interfaces:**
- Produces: an updated `MetadataRoute.Sitemap` array returned by `sitemap()` — no function signature change.

- [ ] **Step 1: Read the current file to confirm the exact current `staticPages` array**

Read `src/app/sitemap.ts` in full and confirm the `staticPages` array's current exact contents before editing (it may have already changed since this plan was written — always edit against what's actually there, not this plan's assumption).

- [ ] **Step 2: Add the 11 category pages as new sitemap entries**

Add this array of 11 new entries to the `staticPages` array (append after the existing entries, before the closing `]`), using `changeFrequency: 'monthly'` and `priority: 0.8` (higher than the generic static pages at 0.5, since these are the primary keyword-targeting landing pages; lower than the homepage's 1.0):

```ts
    { url: `${BASE}/kas-tatil-rehberi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-otel-onerileri`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-merkez-gezilecek-yerler`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-en-guzel-plajlar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-dalis-noktalari`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-tekne-turu`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-nerede-ne-yenir`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-kahvalti-mekanlari`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-gece-hayati`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-koylari`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kas-yapilacak-aktiviteler`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
```

If `/faq` is not already present in `staticPages` (double-check against Step 1's read), also add:

```ts
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
```

- [ ] **Step 2b: Confirm none of the Search Console 404 URLs are present anywhere in the sitemap**

Run: `grep -nE "kas-pansiyonlar|kas-3-gunluk-gezi-plani|rehber/|places\.html|index\.html|kas-plajlari\"|kas-restoran-onerileri|kas-oteller\"|kas-butik-oteller|kas-gezilecek-yerler\"|kas-barlar-ve-gece-hayati" src/app/sitemap.ts`
Expected: no output (these stale/broken slugs must never appear in the sitemap).

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `sitemap.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(seo): add all category pages to sitemap"
```

---

### Task 3: Add OG/Twitter share image to root layout metadata

**Files:**
- Modify: `src/app/layout.tsx:18-32` (the `openGraph` and `twitter` metadata blocks)

**Context:** `public/og.jpg` exists (confirmed via `ls public/`) and is already referenced as `HOME_OG_IMAGE_URL` inside `home-jsonld.tsx:9` for JSON-LD `image` fields, but the root `Metadata.openGraph` and `Metadata.twitter` objects in `layout.tsx` have no `images` field at all — so link previews on WhatsApp/Facebook/X/iMessage/Slack currently show no image for any page that doesn't override metadata with its own image.

**Interfaces:** None — this is metadata-object-only, no new exports or functions.

- [ ] **Step 1: Read the current file to confirm exact current content**

Read `src/app/layout.tsx` in full and confirm the `openGraph` and `twitter` blocks match what's quoted below before editing.

- [ ] **Step 2: Add `images` to the `openGraph` block**

Change:

```tsx
  openGraph: {
    title: "Kaş Guide - Kaş'ta Gezilecek Yerler ve Yerel Rehber",
    description:
      "Kaş'ın en kapsamlı yerel rehberi. Gezilecek yerler, restoranlar, oteller, patili dostu mekanlar ve pratik seyahat bilgileri.",
    url: 'https://www.kasguide.de',
    siteName: 'Kaş Guide',
    locale: 'tr_TR',
    type: 'website',
  },
```

to:

```tsx
  openGraph: {
    title: "Kaş Guide - Kaş'ta Gezilecek Yerler ve Yerel Rehber",
    description:
      "Kaş'ın en kapsamlı yerel rehberi. Gezilecek yerler, restoranlar, oteller, patili dostu mekanlar ve pratik seyahat bilgileri.",
    url: 'https://www.kasguide.de',
    siteName: 'Kaş Guide',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: 'https://www.kasguide.de/og.jpg',
        width: 1200,
        height: 630,
        alt: "Kaş Guide - Kaş'ta Gezilecek Yerler ve Yerel Rehber",
      },
    ],
  },
```

- [ ] **Step 3: Add `images` to the `twitter` block**

Change:

```tsx
  twitter: {
    card: 'summary_large_image',
    title: "Kaş Guide - Kaş'ta Gezilecek Yerler ve Yerel Rehber",
    description: "Kaş'ın en kapsamlı yerel rehberi.",
    site: '@thekasguide',
  },
```

to:

```tsx
  twitter: {
    card: 'summary_large_image',
    title: "Kaş Guide - Kaş'ta Gezilecek Yerler ve Yerel Rehber",
    description: "Kaş'ın en kapsamlı yerel rehberi.",
    site: '@thekasguide',
    images: ['https://www.kasguide.de/og.jpg'],
  },
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `layout.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(seo): add OG/Twitter share image to root metadata"
```

---

### Task 4: Audit and fix missing `alternates.canonical` across public pages

**Files:**
- Modify: any public page found missing `alternates.canonical` in its `metadata` export (exact file list determined by Step 1's audit — do not guess file names in advance)

**Context:** Several pages already set `alternates: { canonical: '/some-path' }` correctly (confirmed in `layout.tsx:15-17`, `faq/page.tsx:10`, `kas-otel-onerileri/page.tsx:98`). This task closes any gaps across the remaining public pages.

**Interfaces:** None — metadata-object-only edits, following the exact same `alternates: { canonical: '/path' }` pattern already used elsewhere in this codebase.

- [ ] **Step 1: Find every page with a `metadata` export, and check which ones lack `alternates`**

Run: `grep -rL "alternates" $(grep -rl "export const metadata" src/app --include=page.tsx)`

This prints the list of `page.tsx` files that have a `metadata` export but do NOT contain the string `alternates` anywhere in the file. Exclude from consideration: `src/app/admin/**` (admin pages are `noindex`, canonical is irrelevant there) and `src/app/result/page.tsx` / `src/app/planner/page.tsx` (already `noindex`, per the existing `robots: { index: false, follow: false }` — canonical doesn't matter for pages excluded from indexing, skip these too).

- [ ] **Step 2: For each remaining file from Step 1's output, add `alternates.canonical` matching its route**

For each file, open it, find its `metadata` object, and add an `alternates: { canonical: '/its-actual-route-path' }` entry following the exact pattern used in `kas-otel-onerileri/page.tsx:98` (`alternates: { canonical: '/kas-otel-onerileri' }`). The canonical path must match the page's real route (e.g. `src/app/kas-koylari/page.tsx` → `/kas-koylari`; `src/app/mekan/[slug]/page.tsx` → dynamic, use the same pattern already present for other dynamic routes in that file if one exists, or construct `` `/mekan/${slug}` `` consistent with how the file already builds URLs elsewhere in its own JSON-LD).

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors in any file touched by this task.

- [ ] **Step 4: Commit**

```bash
git add -A -- 'src/app/*.tsx' 'src/app/**/page.tsx'
git commit -m "fix(seo): add missing canonical URLs across public pages"
```

(Adjust the `git add` paths to exactly the files actually changed in Step 2 if the glob above doesn't match cleanly on this shell — list them explicitly instead: `git add <file1> <file2> ...`.)

---

### Task 5: Enrich `Organization` schema with `LocalBusiness`/geo fields for GEO

**Files:**
- Modify: `src/features/home/components/home-jsonld.tsx:11-26` (the `buildOrganizationSchema` function)

**Context:** AI answer engines (ChatGPT, Perplexity, Google AI Overviews) weight structured geographic/business data heavily when answering "best X in [place]" queries. The current `Organization` schema has no `address` or geographic anchor at all, which weakens Kaş Guide's association with Kaş, Antalya, Turkey in machine-readable form (the human-readable content already establishes this well — this task only strengthens the machine-readable layer, per the user's "technical only" scope decision).

**Interfaces:**
- Produces: an updated `buildOrganizationSchema()` return value consumed by `HomeJsonLd()` (same file) — no signature change.

- [ ] **Step 1: Read the current file to confirm exact current content**

Read `src/features/home/components/home-jsonld.tsx` and confirm `buildOrganizationSchema` still matches what's quoted below before editing.

- [ ] **Step 2: Add `address` and `areaServed` fields to the Organization schema**

Change:

```tsx
function buildOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kaş Guide',
    url: 'https://www.kasguide.de',
    logo: 'https://www.kasguide.de/logo.png',
    sameAs: [
      'https://instagram.com/guidekas',
      'https://facebook.com/kasguide',
      'https://x.com/thekasguide',
      'https://wa.me/4915258450111',
      'mailto:info@kasguide.de',
    ],
  }
}
```

to:

```tsx
function buildOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kaş Guide',
    url: 'https://www.kasguide.de',
    logo: 'https://www.kasguide.de/logo.png',
    areaServed: {
      '@type': 'City',
      name: 'Kaş',
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Antalya',
        containedInPlace: {
          '@type': 'Country',
          name: 'Türkiye',
        },
      },
    },
    sameAs: [
      'https://instagram.com/guidekas',
      'https://facebook.com/kasguide',
      'https://x.com/thekasguide',
      'https://wa.me/4915258450111',
      'mailto:info@kasguide.de',
    ],
  }
}
```

Do NOT add a fabricated street `address` (no PostalAddress) — Kaş Guide is a content/media site, not a physical business with a street address, so `PostalAddress` would be inaccurate. `areaServed` correctly expresses "this site is about/serves the Kaş area" without inventing false business-location data.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `home-jsonld.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/features/home/components/home-jsonld.tsx
git commit -m "feat(seo): add areaServed geo data to Organization schema for GEO/AEO"
```

---

### Task 6: Full verification pass

**Files:** None modified — verification only.

- [ ] **Step 1: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors/warnings in any file touched by this plan (pre-existing warnings in untouched files are acceptable).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds, all `kas-*` pages and `/faq` still compile as static routes.

- [ ] **Step 4: Manual verification via local dev server (HTTP-level, since no browser tool is available)**

Run: `npx next dev -p 3901` (background), then:

1. `curl -s http://localhost:3901/sitemap.xml | grep -c "kas-"` — expect at least 11 (the 11 category pages), confirm no stale slugs: `curl -s http://localhost:3901/sitemap.xml | grep -E "kas-plajlari|kas-restoran-onerileri|kas-oteller<|kas-butik-oteller|kas-gezilecek-yerler<|kas-barlar-ve-gece-hayati"` should return no output.
2. `curl -s http://localhost:3901/ | grep -o 'kas-plajlari\|kas-restoran-onerileri\|kas-butik-oteller\|kas-oteller"\|kas-gezilecek-yerler"\|kas-barlar-ve-gece-hayati'` on the homepage HTML — expect no output (confirms the fixed JSON-LD no longer contains any broken slug).
3. `curl -s http://localhost:3901/ | grep -o 'og:image[^>]*'` — expect to see `https://www.kasguide.de/og.jpg` referenced.
4. `curl -s http://localhost:3901/kas-koylari | grep -o 'rel="canonical"[^>]*'` (or whichever file(s) Task 4 touched) — expect a canonical link tag present.
5. Stop the dev server afterward (find and kill the process listening on port 3901).

- [ ] **Step 5: Report to user — manual Search Console step required**

This step cannot be automated by the agent (requires the user's Google Search Console access). After all commits are verified, tell the user: "Kod tarafı tamam — şimdi Google Search Console'da Sitemaps bölümünden `sitemap.xml`'i 'Yeniden gönder' yapman gerekiyor ki Google güncellenmiş linkleri görsün. Bu adımı ben yapamam, sana kalıyor."
