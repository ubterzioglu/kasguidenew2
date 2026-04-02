-- ============================================================================
-- MIGRATION: Multi-table → Unified Items System
-- ============================================================================
-- This script migrates data from:
--   - places → items (item_type='place')
--   - pets → items (item_type='pet')
--   - hotels → items (item_type='hotel')
--   - artists → items (item_type='artist')
--
-- Run this AFTER creating the new schema-unified.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: MIGRATE PLACES → ITEMS
-- ============================================================================

INSERT INTO items (
  item_number,
  item_type,
  slug,
  title,
  description,
  long_text,
  phone,
  email,
  website,
  instagram,
  location,
  coordinates_lat,
  coordinates_lng,
  rating,
  verified,
  status,
  submitted_by,
  submission_notes,
  created_at,
  updated_at,
  published_at,
  photos,
  attributes
)
SELECT
  -- Generate item number: PLACE-001, PLACE-002, etc.
  'PLACE-' || LPAD(id::TEXT, 3, '0') AS item_number,
  'place' AS item_type,
  slug,
  title,
  description,
  long_text,
  phone,
  NULL AS email, -- places don't have email
  website,
  instagram,
  location,
  coordinates_lat,
  coordinates_lng,
  rating,
  verified,
  status,
  submitted_by,
  submission_notes,
  created_at,
  updated_at,
  published_at,

  -- Build photos JSONB array
  (
    SELECT JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'url', image_url,
        'sequence', sequence_order,
        'caption', caption,
        'is_primary', FALSE
      ) ORDER BY sequence_order
    )
    FROM place_images
    WHERE place_images.place_id = places.id
  ) ||
  -- Add primary image as first photo if exists
  CASE
    WHEN primary_image IS NOT NULL THEN
      JSONB_BUILD_ARRAY(
        JSONB_BUILD_OBJECT(
          'url', primary_image,
          'sequence', 0,
          'caption', 'Main photo',
          'is_primary', TRUE
        )
      )
    ELSE '[]'::JSONB
  END AS photos,

  -- Build attributes JSONB
  JSONB_BUILD_OBJECT(
    'badge_id', badge_id,
    'categories', (
      SELECT JSONB_AGG(category_id)
      FROM place_categories
      WHERE place_categories.place_id = places.id
    ),
    'price', price,
    'selected', selected,
    'distance', distance,
    'duration', duration,
    'access_info', access_info,
    'google_maps_query', google_maps_query,
    'booking_url', booking_url,
    'info_date', info_date,
    'disclaimer', disclaimer,
    'facilities', (
      SELECT JSONB_AGG(facility_name)
      FROM place_facilities
      WHERE place_facilities.place_id = places.id
    ),
    'features', (
      SELECT JSONB_AGG(feature_text)
      FROM place_features
      WHERE place_features.place_id = places.id
    ),
    'tags', (
      SELECT JSONB_AGG(tag_name)
      FROM place_tags
      WHERE place_tags.place_id = places.id
    )
  ) AS attributes

FROM places
ORDER BY id;

-- ============================================================================
-- STEP 2: MIGRATE PETS → ITEMS
-- ============================================================================

INSERT INTO items (
  item_number,
  item_type,
  slug,
  title,
  description,
  long_text,
  phone,
  email,
  website,
  instagram,
  location,
  coordinates_lat,
  coordinates_lng,
  rating,
  verified,
  status,
  submitted_by,
  submission_notes,
  created_at,
  updated_at,
  published_at,
  resolved_at,
  photos,
  attributes
)
SELECT
  -- Generate item number: PET-001, PET-002, etc.
  'PET-' || LPAD(id::TEXT, 3, '0') AS item_number,
  'pet' AS item_type,
  NULL AS slug, -- pets don't have slugs
  COALESCE(pet_name, pet_type || ' - ' || listing_type) AS title,
  short_note AS description,
  extra_notes AS long_text,
  phone,
  NULL AS email,
  NULL AS website,
  NULL AS instagram,
  NULL AS location,
  NULL AS coordinates_lat,
  NULL AS coordinates_lng,
  NULL AS rating,
  FALSE AS verified,
  status,
  NULL AS submitted_by,
  NULL AS submission_notes,
  created_at,
  updated_at,
  NULL AS published_at,
  resolved_at,

  -- Build photos JSONB array
  (
    SELECT JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'url', photo_url,
        'sequence', sequence_order,
        'is_primary', sequence_order = 0
      ) ORDER BY sequence_order
    )
    FROM pet_photos
    WHERE pet_photos.pet_id = pets.id
  ) AS photos,

  -- Build attributes JSONB
  JSONB_BUILD_OBJECT(
    'listing_type', listing_type,
    'pet_type', pet_type,
    'age', age,
    'breed', breed,
    'short_note', short_note,
    'extra_notes', extra_notes
  ) AS attributes

FROM pets
ORDER BY id;

-- ============================================================================
-- STEP 3: MIGRATE HOTELS → ITEMS
-- ============================================================================

INSERT INTO items (
  item_number,
  item_type,
  slug,
  title,
  description,
  long_text,
  phone,
  email,
  website,
  instagram,
  location,
  coordinates_lat,
  coordinates_lng,
  rating,
  verified,
  status,
  submitted_by,
  submission_notes,
  created_at,
  updated_at,
  published_at,
  photos,
  attributes
)
SELECT
  -- Generate item number: HOTEL-001, HOTEL-002, etc.
  'HOTEL-' || LPAD(id::TEXT, 3, '0') AS item_number,
  'hotel' AS item_type,
  slug,
  title,
  description,
  long_text,
  phone,
  email,
  website,
  instagram,
  location,
  coordinates_lat,
  coordinates_lng,
  rating,
  verified,
  status,
  submitted_by,
  submission_notes,
  created_at,
  updated_at,
  published_at,

  -- Build photos JSONB array
  (
    SELECT JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'url', image_url,
        'sequence', sequence_order,
        'caption', caption,
        'is_primary', FALSE
      ) ORDER BY sequence_order
    )
    FROM hotel_images
    WHERE hotel_images.hotel_id = hotels.id
  ) ||
  -- Add primary image as first photo if exists
  CASE
    WHEN primary_image IS NOT NULL THEN
      JSONB_BUILD_ARRAY(
        JSONB_BUILD_OBJECT(
          'url', primary_image,
          'sequence', 0,
          'caption', 'Main photo',
          'is_primary', TRUE
        )
      )
    ELSE '[]'::JSONB
  END AS photos,

  -- Build attributes JSONB
  JSONB_BUILD_OBJECT(
    'hotel_type', hotel_type,
    'star_rating', star_rating,
    'room_count', room_count,
    'capacity', capacity,
    'price_range', price_range,
    'checkin_time', checkin_time,
    'checkout_time', checkout_time,
    'distance_to_sea', distance_to_sea,
    'booking_url', booking_url,
    'google_maps_query', google_maps_query,
    'info_date', info_date,
    'disclaimer', disclaimer,
    'review_count', review_count,
    'facilities', (
      SELECT JSONB_AGG(facility_name)
      FROM hotel_facilities
      WHERE hotel_facilities.hotel_id = hotels.id
    ),
    'tags', (
      SELECT JSONB_AGG(tag_name)
      FROM hotel_tags
      WHERE hotel_tags.hotel_id = hotels.id
    )
  ) AS attributes

FROM hotels
ORDER BY id;

-- ============================================================================
-- STEP 4: MIGRATE ARTISTS → ITEMS
-- ============================================================================

INSERT INTO items (
  item_number,
  item_type,
  slug,
  title,
  description,
  long_text,
  phone,
  email,
  website,
  instagram,
  location,
  coordinates_lat,
  coordinates_lng,
  rating,
  verified,
  status,
  submitted_by,
  submission_notes,
  created_at,
  updated_at,
  published_at,
  photos,
  attributes
)
SELECT
  -- Generate item number: ARTIST-001, ARTIST-002, etc.
  'ARTIST-' || LPAD(id::TEXT, 3, '0') AS item_number,
  'artist' AS item_type,
  slug,
  artist_name AS title,
  short_text AS description,
  long_text,
  phone,
  email,
  website,
  instagram,
  NULL AS location,
  NULL AS coordinates_lat,
  NULL AS coordinates_lng,
  NULL AS rating,
  FALSE AS verified,
  status,
  NULL AS submitted_by,
  submission_notes,
  created_at,
  updated_at,
  published_at,

  -- Build photos JSONB array (profile and banner)
  JSONB_BUILD_ARRAY(
    CASE
      WHEN profile_photo IS NOT NULL THEN
        JSONB_BUILD_OBJECT(
          'url', profile_photo,
          'sequence', 0,
          'caption', 'Profile photo',
          'is_primary', TRUE,
          'type', 'profile'
        )
      ELSE NULL
    END,
    CASE
      WHEN banner_photo IS NOT NULL THEN
        JSONB_BUILD_OBJECT(
          'url', banner_photo,
          'sequence', 1,
          'caption', 'Banner photo',
          'is_primary', FALSE,
          'type', 'banner'
        )
      ELSE NULL
    END
  ) - NULL AS photos, -- Remove NULL elements

  -- Build attributes JSONB
  JSONB_BUILD_OBJECT(
    'categories', (
      SELECT JSONB_AGG(category_name)
      FROM artist_categories
      WHERE artist_categories.artist_id = artists.id
    ),
    'youtube', youtube,
    'music_link', music_link,
    'banner_photo', banner_photo,
    'viewport', viewport,
    'short_text', short_text
  ) AS attributes

FROM artists
ORDER BY id;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these after migration to verify data integrity

-- Count items by type
-- SELECT item_type, COUNT(*) as count
-- FROM items
-- GROUP BY item_type
-- ORDER BY item_type;

-- Verify item numbers are unique and sequential
-- SELECT item_type, COUNT(DISTINCT item_number) as unique_numbers, COUNT(*) as total
-- FROM items
-- GROUP BY item_type;

-- Check for any NULL required fields
-- SELECT item_type, COUNT(*) as items_with_null_title
-- FROM items
-- WHERE title IS NULL
-- GROUP BY item_type;

-- Sample photos structure for each type
-- SELECT item_type, item_number, photos
-- FROM items
-- WHERE photos IS NOT NULL
-- LIMIT 5;

-- Sample attributes structure for each type
-- SELECT item_type, item_number, attributes
-- FROM items
-- LIMIT 5;
