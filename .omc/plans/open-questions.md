# Open Questions

## codebase-cleanup-refactor - 2026-04-02

- [ ] Should the 10 categories missing from `PLACE_CATEGORY_OPTIONS` (tarih, etkinlik, yazilar, roportaj, fotograf, oss, kas-local, acil-durum, patililer, doga) be added to the admin pipeline, or are they intentionally editorial-only categories? -- Determines the shape of the unified `categories.ts` and whether the validation in `raw-place-store.ts:272` needs to accept more IDs.

- [ ] Is the `kasguide_badge` column now present in all environments (production, staging)? -- If yes, we can remove all 4 `isMissingKasguideBadgeColumnError` fallback blocks immediately in Phase 1 instead of Phase 3. If not, we need to run the migration first.

- [ ] What is the desired session lifetime for admin access? -- Currently infinite (localStorage, no expiry). Phase 3.2 proposes HTTP-only cookies but needs a TTL decision (e.g., 8 hours, 24 hours, 7 days).

- [ ] Are there any downstream consumers of the `Item` interface from `supabase.ts`? -- Grep shows zero imports, but there may be external services or scripts referencing this type. Need confirmation before deletion.

- [ ] Should the API response envelope change be applied to public endpoints (`/api/places`, `/api/place-counts`) as well, or only admin endpoints? -- Changing public endpoints requires updating `category-section.tsx` fetch logic simultaneously.

- [ ] Is there a preference for Supabase RPC (stored procedure) vs. client-side sequential writes for transaction safety in Phase 3.4? -- RPC is more reliable but requires database-side function deployment.
