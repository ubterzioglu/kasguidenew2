-- Kaş Guide Database Schema
-- PostgreSQL Database for kasguide.de
-- Created: 2025-12-29

-- ============================================================================
-- CORE TABLES
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
-- PLACES (Venues, Restaurants, Bars, Attractions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  long_text TEXT NOT NULL,

  -- Classification
  badge_id INTEGER REFERENCES badges(id),

  -- Ratings & Pricing
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  price VARCHAR(10), -- ₺, ₺₺, ₺₺₺, ₺₺₺₺
  selected BOOLEAN DEFAULT FALSE,

  -- Location
  location VARCHAR(255),
  distance VARCHAR(100),
  coordinates_lat DECIMAL(10, 7),
  coordinates_lng DECIMAL(10, 7),

  -- Images
  primary_image VARCHAR(500),

  -- Timing & Access
  duration VARCHAR(100),
  access_info TEXT,

  -- Contact Information
  phone VARCHAR(50),
  website VARCHAR(500),
  instagram VARCHAR(255),
  booking_url VARCHAR(500),
  google_maps_query TEXT,

  -- Trust & Verification
  verified BOOLEAN DEFAULT FALSE,
  info_date VARCHAR(20), -- YYYY-MM format
  disclaimer BOOLEAN DEFAULT TRUE,

  -- Status & Publishing
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, draft
  submitted_by VARCHAR(255),
  submission_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Place Images (Gallery)
CREATE TABLE IF NOT EXISTS place_images (
  id SERIAL PRIMARY KEY,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  sequence_order INTEGER DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Place Categories (Many-to-Many)
CREATE TABLE IF NOT EXISTS place_categories (
  id SERIAL PRIMARY KEY,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(place_id, category_id)
);

-- Place Facilities
CREATE TABLE IF NOT EXISTS place_facilities (
  id SERIAL PRIMARY KEY,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  facility_name VARCHAR(100) NOT NULL
);

-- Place Features
CREATE TABLE IF NOT EXISTS place_features (
  id SERIAL PRIMARY KEY,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  feature_text VARCHAR(255) NOT NULL
);

-- Place Tags
CREATE TABLE IF NOT EXISTS place_tags (
  id SERIAL PRIMARY KEY,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL
);

-- ============================================================================
-- HOTELS / ACCOMMODATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- Basic Information
  title VARCHAR(255) NOT NULL,
  hotel_type VARCHAR(50) NOT NULL, -- butik, aile, luks, pansiyon, apart, hostel, villa
  star_rating VARCHAR(10), -- 1-5 or 'yok'
  room_count INTEGER,
  capacity INTEGER,

  -- Location
  location VARCHAR(255) NOT NULL,
  distance_to_sea VARCHAR(100),
  coordinates_lat DECIMAL(10, 7),
  coordinates_lng DECIMAL(10, 7),

  -- Description
  description TEXT NOT NULL,
  long_text TEXT NOT NULL,

  -- Images
  primary_image VARCHAR(500),

  -- Pricing & Booking
  price_range VARCHAR(20), -- budget, mid, high, luxury
  checkin_time VARCHAR(10), -- HH:MM
  checkout_time VARCHAR(10), -- HH:MM

  -- Contact
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  instagram VARCHAR(255),
  booking_url VARCHAR(500),
  google_maps_query TEXT,

  -- Ratings
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,

  -- Trust & Verification
  verified BOOLEAN DEFAULT FALSE,
  info_date VARCHAR(20),
  disclaimer BOOLEAN DEFAULT TRUE,

  -- Status & Publishing
  status VARCHAR(20) DEFAULT 'pending',
  submitted_by VARCHAR(255),
  submission_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Hotel Images
CREATE TABLE IF NOT EXISTS hotel_images (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  sequence_order INTEGER DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hotel Facilities
CREATE TABLE IF NOT EXISTS hotel_facilities (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  facility_name VARCHAR(100) NOT NULL
);

-- Hotel Tags
CREATE TABLE IF NOT EXISTS hotel_tags (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL
);

-- ============================================================================
-- PETS (Lost/Found Listings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,

  -- Classification
  listing_type VARCHAR(20) NOT NULL, -- Kayıp (Lost) or Bulundu (Found)
  pet_name VARCHAR(100),
  pet_type VARCHAR(50) NOT NULL, -- kedi, kopek

  -- Details
  age VARCHAR(100),
  breed VARCHAR(100),
  short_note TEXT NOT NULL,
  extra_notes TEXT,

  -- Contact
  phone VARCHAR(50) NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, resolved, expired

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Pet Photos
CREATE TABLE IF NOT EXISTS pet_photos (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ARTISTS / PERFORMERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS artists (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- Basic Information
  artist_name VARCHAR(255) NOT NULL,
  short_text VARCHAR(500),
  long_text TEXT NOT NULL,

  -- Images
  profile_photo VARCHAR(500),
  banner_photo VARCHAR(500),

  -- Contact & Links
  phone VARCHAR(50),
  email VARCHAR(255),
  instagram VARCHAR(255),
  youtube VARCHAR(255),
  music_link VARCHAR(500),
  website VARCHAR(500),

  -- Metadata
  viewport VARCHAR(100),
  submission_notes TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Artist Categories
CREATE TABLE IF NOT EXISTS artist_categories (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  category_name VARCHAR(100) NOT NULL
);

-- ============================================================================
-- ARTICLES / BLOG POSTS
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
-- FAQ SYSTEM
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

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL, -- create, update, delete, approve, reject
  entity_type VARCHAR(50) NOT NULL, -- place, hotel, pet, article, etc.
  entity_id INTEGER NOT NULL,
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Places
CREATE INDEX IF NOT EXISTS idx_places_status ON places(status);
CREATE INDEX IF NOT EXISTS idx_places_slug ON places(slug);
CREATE INDEX IF NOT EXISTS idx_places_badge ON places(badge_id);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(coordinates_lat, coordinates_lng);
CREATE INDEX IF NOT EXISTS idx_places_published ON places(published_at);

-- Hotels
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(status);
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug);
CREATE INDEX IF NOT EXISTS idx_hotels_type ON hotels(hotel_type);
CREATE INDEX IF NOT EXISTS idx_hotels_location ON hotels(coordinates_lat, coordinates_lng);

-- Pets
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(pet_type);
CREATE INDEX IF NOT EXISTS idx_pets_listing_type ON pets(listing_type);
CREATE INDEX IF NOT EXISTS idx_pets_created ON pets(created_at);

-- Articles
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at);

-- Artists
CREATE INDEX IF NOT EXISTS idx_artists_status ON artists(status);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);

-- Audit
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

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

-- Apply to all relevant tables
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_series_updated_at BEFORE UPDATE ON faq_series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
