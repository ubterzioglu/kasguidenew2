# Project Architecture Rules (Non-Obvious Only)

- **Ingestion Pipeline**: The architecture enforces a strict flow: Raw Data (`import-osm`, `import-google-grid`) → Review Queue (`place-review-store`) → Production (`public-place-store`). Raw data cannot be published directly to public.
- **Vercel/Next.js Limits**: Build scripts rely heavily on syncing Next.js server chunks (`scripts/sync-next-server-chunks.mjs`). This script must remain part of the build pipeline (`postbuild`/`prestart`).
- **Data Normalization**: Separate normalization (`normalize:places`) and deduplication (`dedupe:places`) scripts ensure consistency before human review.
