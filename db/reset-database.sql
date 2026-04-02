-- ============================================================================
-- DATABASE RESET SCRIPT
-- ============================================================================
-- WARNING: This will DELETE ALL DATA in the database!
-- Use only for development/testing purposes.
--
-- Usage:
--   psql $DATABASE_URL -f db/reset-database.sql
-- ============================================================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Drop all tables in correct order (respecting dependencies)
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS badges CASCADE;

-- Drop old tables if they exist (from previous schema)
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS place_images CASCADE;
DROP TABLE IF EXISTS place_categories CASCADE;
DROP TABLE IF EXISTS place_facilities CASCADE;
DROP TABLE IF EXISTS place_features CASCADE;
DROP TABLE IF EXISTS place_tags CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS hotel_images CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS faq_series CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_next_item_number(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_next_place_number() CASCADE;
DROP FUNCTION IF EXISTS get_next_pet_number() CASCADE;
DROP FUNCTION IF EXISTS get_next_hotel_number() CASCADE;
DROP FUNCTION IF EXISTS get_next_artist_number() CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database reset complete. All tables dropped.';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Run: psql $DATABASE_URL -f db/schema-unified.sql';
  RAISE NOTICE '   2. Run: psql $DATABASE_URL -f db/seeds/01_categories.sql';
  RAISE NOTICE '   3. Run: psql $DATABASE_URL -f db/seeds/02_badges.sql';
END $$;
