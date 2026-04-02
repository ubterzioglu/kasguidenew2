-- Kaş Guide Unified Items Schema
-- PostgreSQL Database for kasguide.de
-- Created: 2024-12-29
-- Migration: Multi-table → Unified Item System

-- ============================================================================
-- UNIFIED ITEMS TABLE
-- ============================================================================
-- This table consolidates: places, pets, hotels, artists
-- Benefits: Reduced function count, better scalability, simpler queries

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,

  -- Item Identification
  item_number VARCHAR(50) UNIQUE NOT NULL, -- PLACE-001, PET-001, HOTEL-001, ARTIST-001
  item_type VARCHAR(20) NOT NULL, -- 'place', 'pet', 'hotel', 'artist'
  slug VARCHAR(255) UNIQUE, -- For places, hotels, artists (NULL for pets)

  -- =========================================================================
  -- COMMON FIELDS (Indexed columns for performance & searchability)
  -- =========================================================================

  -- Basic Information
  title VARCHAR(255) NOT NULL, -- place title, hotel name, artist name, pet name
  description TEXT, -- Short description (all types)
  long_text TEXT, -- Long description (places, hotels, artists)

  -- Contact Information
  phone VARCHAR(50), -- All types can have phone
  email VARCHAR(255), -- Hotels, artists
  website VARCHAR(500), -- Places, hotels, artists
  instagram VARCHAR(255), -- All types

  -- Location (places, hotels)
  location VARCHAR(255), -- Text location
  coordinates_lat DECIMAL(10, 7),
  coordinates_lng DECIMAL(10, 7),

  -- Ratings & Trust
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  verified BOOLEAN DEFAULT FALSE,

  -- Status & Publishing
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, approved, rejected, resolved, expired
  submitted_by VARCHAR(255),
  submission_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  resolved_at TIMESTAMP, -- For pets (resolved = found/reunited)

  -- =========================================================================
  -- PHOTOS (Common JSONB array for all types)
  -- =========================================================================
  photos JSONB, -- Array of photo URLs with metadata
  /*
  Example structure:
  [
    {
      "url": "https://...",
      "sequence": 0,
      "caption": "Main photo",
      "is_primary": true
    },
    {
      "url": "https://...",
      "sequence": 1,
      "caption": "Gallery photo"
    }
  ]
  */

  -- =========================================================================
  -- TYPE-SPECIFIC ATTRIBUTES (JSONB for flexibility)
  -- =========================================================================
  attributes JSONB,
  /*
  PLACE attributes:
  {
    "badge_id": 1,
    "categories": [1, 2, 3],
    "price": "₺₺",
    "selected": false,
    "distance": "500m from center",
    "duration": "2-3 hours",
    "access_info": "Wheelchair accessible",
    "google_maps_query": "...",
    "booking_url": "...",
    "info_date": "2024-12",
    "disclaimer": true,
    "facilities": ["wifi", "parking", "ac"],
    "features": ["family-friendly", "sea-view"],
    "tags": ["romantic", "sunset"]
  }

  PET attributes:
  {
    "listing_type": "lost", // or "found"
    "pet_type": "dog", // or "cat"
    "age": "2 years",
    "breed": "Golden Retriever",
    "short_note": "Lost near beach",
    "extra_notes": "Very friendly, responds to Max"
  }

  HOTEL attributes:
  {
    "hotel_type": "boutique", // butik, aile, luks, pansiyon, apart, hostel, villa
    "star_rating": "4",
    "room_count": 20,
    "capacity": 40,
    "price_range": "mid", // budget, mid, high, luxury
    "checkin_time": "14:00",
    "checkout_time": "11:00",
    "distance_to_sea": "200m",
    "booking_url": "...",
    "google_maps_query": "...",
    "info_date": "2024-12",
    "disclaimer": true,
    "facilities": ["pool", "wifi", "restaurant", "spa"],
    "tags": ["romantic", "family-friendly"],
    "review_count": 150
  }

  ARTIST attributes:
  {
    "categories": ["musician", "dj"],
    "youtube": "youtube.com/...",
    "music_link": "spotify.com/...",
    "banner_photo": "https://...",
    "viewport": "Kaş",
    "short_text": "DJ and live performer"
  }
  */

  -- Constraints
  CONSTRAINT valid_item_type CHECK (item_type IN ('place', 'pet', 'hotel', 'artist')),
  CONSTRAINT slug_required_for_non_pets CHECK (
    item_type = 'pet' OR slug IS NOT NULL
  )
);

-- ============================================================================
-- REFERENCE TABLES (Unchanged from original schema)
-- ============================================================================

-- Categories (Reference Table)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon_code VARCHAR(50),
  color_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Badges (Reference Table)
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ARTICLES / BLOG POSTS (Separate - not unified)
-- ============================================================================

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,

  -- Metadata
  author VARCHAR(100) DEFAULT 'Kaş Guide',
  read_time VARCHAR(20),
  featured_image VARCHAR(500),

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Article Tags
CREATE TABLE IF NOT EXISTS article_tags (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL
);

-- ============================================================================
-- FAQ SYSTEM (Separate - not unified)
-- ============================================================================

-- Standard FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sequence_order INTEGER DEFAULT 0,
  category VARCHAR(100),

  -- Status
  is_published BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FAQ Special Series
CREATE TABLE IF NOT EXISTS faq_series (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),

  -- Status
  is_published BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- ============================================================================
-- ADMIN & AUDIT
-- ============================================================================

-- Admin Users (Simple auth for now)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'editor', -- admin, editor, viewer
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log (Updated to handle unified items)
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL, -- create, update, delete, approve, reject
  entity_type VARCHAR(50) NOT NULL, -- item, article, faq, etc.
  entity_id INTEGER NOT NULL,
  item_type VARCHAR(20), -- For items: place, pet, hotel, artist
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Items - Core indexes
CREATE INDEX IF NOT EXISTS idx_items_type ON items(item_type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_status_type ON items(status, item_type);
CREATE INDEX IF NOT EXISTS idx_items_type_published ON items(item_type, published_at);
CREATE INDEX IF NOT EXISTS idx_items_number ON items(item_number);
CREATE INDEX IF NOT EXISTS idx_items_slug ON items(slug) WHERE slug IS NOT NULL;

-- Items - Location indexes
CREATE INDEX IF NOT EXISTS idx_items_location ON items(coordinates_lat, coordinates_lng)
  WHERE coordinates_lat IS NOT NULL AND coordinates_lng IS NOT NULL;

-- Items - JSONB GIN index for attribute queries
CREATE INDEX IF NOT EXISTS idx_items_attrs_gin ON items USING GIN (attributes);

-- Items - Photo JSONB index
CREATE INDEX IF NOT EXISTS idx_items_photos_gin ON items USING GIN (photos);

-- Items - Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_items_type_status_created ON items(item_type, status, created_at);
CREATE INDEX IF NOT EXISTS idx_items_type_rating ON items(item_type, rating) WHERE rating IS NOT NULL;

-- Articles
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_item_type ON audit_log(item_type) WHERE item_type IS NOT NULL;

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to items table
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_series_updated_at BEFORE UPDATE ON faq_series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate next item number for a given type
CREATE OR REPLACE FUNCTION get_next_item_number(p_item_type VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  v_prefix VARCHAR(10);
  v_next_num INTEGER;
  v_item_number VARCHAR(50);
BEGIN
  -- Determine prefix based on type
  v_prefix := CASE p_item_type
    WHEN 'place' THEN 'PLACE'
    WHEN 'pet' THEN 'PET'
    WHEN 'hotel' THEN 'HOTEL'
    WHEN 'artist' THEN 'ARTIST'
    ELSE 'ITEM'
  END;

  -- Get the next number for this type
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(item_number FROM '[0-9]+$') AS INTEGER
    )
  ), 0) + 1
  INTO v_next_num
  FROM items
  WHERE item_number LIKE v_prefix || '-%';

  -- Format as PREFIX-NNN (e.g., PLACE-001, PET-042)
  v_item_number := v_prefix || '-' || LPAD(v_next_num::TEXT, 3, '0');

  RETURN v_item_number;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT get_next_item_number('place'); -- Returns: PLACE-001
-- SELECT get_next_item_number('pet');   -- Returns: PET-001
