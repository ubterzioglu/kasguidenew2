# Supabase Table Report

Date: 2026-04-04
Source of truth: `supabase inspect db table-stats --linked`
Repo scanned with: `rg` over `src`, `scripts`, `db`, `supabase`

## Executive Summary

The active database is centered around the place ingestion and publishing pipeline.
The most heavily used production tables are `places`, `raw_places`, `place_sources`, `place_content`, and `review_queue`.

Remote migration status shows one pending migration:
- `20260402190000_add_kasguide_badge_to_places.sql`

This means the repo expects `public.places.kasguide_badge`, but the linked remote database had not applied that migration at the time of inspection.

## Remote Tables

| Table | Estimated rows | Total size | Notes |
|---|---:|---:|---|
| `public.places` | 629 | 336 kB | Main published/admin place records |
| `public.raw_places` | 609 | 880 kB | Imported raw source data |
| `public.place_sources` | 610 | 320 kB | Maps raw sources to canonical places |
| `public.place_content` | 629 | 216 kB | Copy/headline/long text for places |
| `public.place_images` | 22 | 48 kB | Gallery/cover image records |
| `public.review_queue` | 353 | 192 kB | Manual review / dedupe queue |
| `public.grid_sweeps` | 2 | 64 kB | Sweep sessions for ingest jobs |
| `public.grid_sweep_cells` | 2 | 80 kB | Per-cell sweep progress |
| `public.hero_slides` | 2 | 48 kB | Homepage hero carousel |
| `public.items` | 357 | 1608 kB | Legacy/unified content model |
| `public.articles` | 2 | 96 kB | Article content |
| `public.article_tags` | 5 | 24 kB | Article tags |
| `public.categories` | 19 | 40 kB | Taxonomy/reference data |
| `public.badges` | 16 | 48 kB | Reference badges |
| `public.faqs` | 0 | 16 kB | FAQ entries |
| `public.faq_series` | 0 | 24 kB | FAQ grouping |
| `public.admin_users` | 0 | 24 kB | Admin users table |
| `public.audit_log` | 0 | 48 kB | Audit trail table |

## Table Usage Map

### Core place pipeline

`places`
- Main runtime read model for public pages and admin editing.
- Used in [src/lib/public-place-store.ts](C:\.temp_private\kasguidenew2\src\lib\public-place-store.ts)
- Used in [src/lib/raw-place-store.ts](C:\.temp_private\kasguidenew2\src\lib\raw-place-store.ts)
- Used in [src/lib/place-persistence.ts](C:\.temp_private\kasguidenew2\src\lib\place-persistence.ts)
- Used in scripts such as [scripts/normalize-places.ts](C:\.temp_private\kasguidenew2\scripts\normalize-places.ts), [scripts/publish-reviewed.ts](C:\.temp_private\kasguidenew2\scripts\publish-reviewed.ts), [scripts/seed-sample-bar.ts](C:\.temp_private\kasguidenew2\scripts\seed-sample-bar.ts)
- Defined in [supabase/migrations/20260328193000_create_place_ingestion_core.sql](C:\.temp_private\kasguidenew2\supabase\migrations\20260328193000_create_place_ingestion_core.sql)

`raw_places`
- Landing table for imported Google/OSM/raw venue data.
- Used in [src/lib/raw-place-store.ts](C:\.temp_private\kasguidenew2\src\lib\raw-place-store.ts)
- Used in [src/lib/place-persistence.ts](C:\.temp_private\kasguidenew2\src\lib\place-persistence.ts)
- Used in [scripts/import-google-grid.ts](C:\.temp_private\kasguidenew2\scripts\import-google-grid.ts)
- Used in [scripts/import-osm.ts](C:\.temp_private\kasguidenew2\scripts\import-osm.ts)
- Used in [scripts/dedupe-places.ts](C:\.temp_private\kasguidenew2\scripts\dedupe-places.ts)

`place_sources`
- Canonical link table between `raw_places` and `places`.
- Used in [src/lib/place-persistence.ts](C:\.temp_private\kasguidenew2\src\lib\place-persistence.ts)
- Used in [scripts/normalize-places.ts](C:\.temp_private\kasguidenew2\scripts\normalize-places.ts)
- Used in [scripts/consolidate-raw-into-places.ts](C:\.temp_private\kasguidenew2\scripts\consolidate-raw-into-places.ts)
- Used in [scripts/seed-sample-bar.ts](C:\.temp_private\kasguidenew2\scripts\seed-sample-bar.ts)

`place_content`
- Stores editorial place copy: headline, short text, long text.
- Used in [src/lib/public-place-store.ts](C:\.temp_private\kasguidenew2\src\lib\public-place-store.ts)
- Used in [src/lib/raw-place-store.ts](C:\.temp_private\kasguidenew2\src\lib\raw-place-store.ts)
- Used in [src/lib/place-persistence.ts](C:\.temp_private\kasguidenew2\src\lib\place-persistence.ts)
- Used in [scripts/seed-placeholder-places.ts](C:\.temp_private\kasguidenew2\scripts\seed-placeholder-places.ts)

`place_images`
- Stores place gallery and cover image ordering.
- Used in [src/lib/public-place-store.ts](C:\.temp_private\kasguidenew2\src\lib\public-place-store.ts)
- Used in [src/lib/raw-place-store.ts](C:\.temp_private\kasguidenew2\src\lib\raw-place-store.ts)
- Used in [src/lib/place-persistence.ts](C:\.temp_private\kasguidenew2\src\lib\place-persistence.ts)
- Used in [scripts/seed-sample-bar.ts](C:\.temp_private\kasguidenew2\scripts\seed-sample-bar.ts)

`review_queue`
- Manual review / merge / reject workflow for normalized places.
- Used in [src/lib/place-review-store.ts](C:\.temp_private\kasguidenew2\src\lib\place-review-store.ts)
- Used in [src/lib/place-persistence.ts](C:\.temp_private\kasguidenew2\src\lib\place-persistence.ts)
- Used in [scripts/normalize-places.ts](C:\.temp_private\kasguidenew2\scripts\normalize-places.ts)
- Used in [scripts/dedupe-places.ts](C:\.temp_private\kasguidenew2\scripts\dedupe-places.ts)
- Used in [scripts/publish-reviewed.ts](C:\.temp_private\kasguidenew2\scripts\publish-reviewed.ts)

### Ingestion tracking

`grid_sweeps`
- Parent table for sweep jobs.
- Used in [src/lib/grid-sweep-store.ts](C:\.temp_private\kasguidenew2\src\lib\grid-sweep-store.ts)
- Used in [scripts/import-google-grid.ts](C:\.temp_private\kasguidenew2\scripts\import-google-grid.ts)
- Used in [scripts/import-osm.ts](C:\.temp_private\kasguidenew2\scripts\import-osm.ts)

`grid_sweep_cells`
- Child table for per-cell ingest status.
- Used in [src/lib/grid-sweep-store.ts](C:\.temp_private\kasguidenew2\src\lib\grid-sweep-store.ts)
- Used in [scripts/import-google-grid.ts](C:\.temp_private\kasguidenew2\scripts\import-google-grid.ts)
- Used in [scripts/import-osm.ts](C:\.temp_private\kasguidenew2\scripts\import-osm.ts)

### Homepage CMS

`hero_slides`
- Homepage hero carousel CMS table.
- Used in [src/lib/hero-slide-store.ts](C:\.temp_private\kasguidenew2\src\lib\hero-slide-store.ts)
- Used by admin API under [src/app/api/admin/hero-slides/route.ts](C:\.temp_private\kasguidenew2\src\app\api\admin\hero-slides\route.ts)

### Legacy / reference / partially active tables

`items`
- Legacy unified content model used mainly by import/migration scripts.
- Used in [db/import-static-to-supabase.js](C:\.temp_private\kasguidenew2\db\import-static-to-supabase.js)
- Used in [scripts/backfill-legacy-items-to-review.ts](C:\.temp_private\kasguidenew2\scripts\backfill-legacy-items-to-review.ts)
- Not part of the current place-first runtime path.

`articles`
- Present in remote DB, but repo usage is mostly in import SQL/JS scripts.
- Main references are under [db/extract-and-import.js](C:\.temp_private\kasguidenew2\db\extract-and-import.js) and [db/import-data.js](C:\.temp_private\kasguidenew2\db\import-data.js)

`article_tags`
- Used only in import/schema scripts.

`categories`
- Reference data for legacy and import flows.
- Main references are import scripts and schema files rather than live app reads.

`badges`
- Reference data in legacy model.
- Current place detail page uses hardcoded/category-driven guide badges in UI rather than querying this table directly.
- See [src/app/mekan/[slug]/page.tsx](C:\.temp_private\kasguidenew2\src\app\mekan\[slug]\page.tsx)

`faqs`, `faq_series`, `admin_users`, `audit_log`
- Present in remote schema.
- No meaningful live runtime usage found in current `src` app flow.
- Mostly referenced in schema, reset, or migration scripts.

## Practical Observations

- The current app is primarily built around the place ingestion stack, not the older unified `items` model.
- `public.places` is the hottest table by sequential scans in the CLI output and is central to both public pages and admin flows.
- `public.items` still exists and is sizeable, but appears to be more legacy/migration-oriented than actively rendered by the current Next.js app.
- `public.badges` exists, but current “Kas Guide” badges in the place page are generated in code, not loaded from that table.

## Recommended Next Steps

- Apply the pending migration for `kasguide_badge`:
  - `supabase db push --include-all`
- Decide whether `items` remains a supported model or should be formally deprecated.
- If you want a deeper phase-2 report, add:
  - column-level lineage
  - API endpoint to table mapping
  - read/write matrix per table
