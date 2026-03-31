# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Non-Obvious Patterns

- **TypeScript Scripts Execution**: All `.ts` scripts in the `scripts/` directory MUST be run directly with node using the specific flags: `node --no-warnings=MODULE_TYPELESS_PACKAGE_JSON --env-file=.env.local --experimental-strip-types scripts/script-name.ts`. Do not use `ts-node`.
- **Next.js Chunk Syncing**: The `scripts/sync-next-server-chunks.mjs` must run post-build and pre-start (`npm run sync:next-chunks`) to handle Next.js chunk sync issues.
- **Turkish Terminology in Routing**: The public dynamic route for places is `app/mekan/[slug]`. "Mekan" means place/venue in Turkish.
- **Data Ingestion Workflow**: Place data goes through a multi-stage pipeline: ingestion scripts (`import-osm.ts`, `import-google-grid.ts`) → review queue (`raw-place-store.ts`, `place-review-store.ts`) → public display (`public-place-store.ts`).
