# Project Documentation Rules (Non-Obvious Only)

- **Terminology mappings**: Public routes use `app/mekan/[slug]`. "Mekan" is the Turkish term used here for place/venue.
- **CLAUDE.md vs Reality**: `CLAUDE.md` mentions older structures. The current app is built as a Next.js 15 App Router app where `app/` replaces `old/index.html`.
- **Database Architecture**: `schema.sql` might contain legacy tables. The active unified schema differentiates via the `item_type` column rather than table names.
