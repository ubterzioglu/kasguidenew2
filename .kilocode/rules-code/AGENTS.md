# Project Coding Rules (Non-Obvious Only)

- **Execution Flags for TS**: Never use `ts-node`. Node native TS support is used via `--experimental-strip-types`.
- **Admin Auth**: `lib/admin-auth.ts` is required for `/api/admin/*` endpoints, do not build custom verification.
- **Store Abstractions**: Do not query the DB directly in frontend components. Use `lib/public-place-store.ts` for public data, and `raw-place-store.ts`/`place-review-store.ts` for admin.
- **Data Normalization**: `scripts/normalize-places.ts` and `scripts/dedupe-places.ts` contain the specific business logic for resolving duplicates.
