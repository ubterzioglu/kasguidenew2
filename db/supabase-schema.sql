-- Kaş Guide - Supabase Schema
-- Optimized for Supabase PostgreSQL
-- Created: 2026-03-20

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- UNIFIED ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  
  -- Item Identification
  item_number VARCHAR(50) UNIQUE NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  slug VARCHAR(255) UNIQUE,

  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  long_text TEXT,

  -- Contact Information
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  instagram VARCHAR(255),

  -- Location
  location VARCHAR(255),
  coordinates_lat DECIMAL(10, 7),
  coordinates_lng DECIMAL(10, 7),

  -- Ratings & Trust
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  verified BOOLEAN DEFAULT FALSE,

  -- Status & Publishing
  status VARCHAR(20) DEFAULT 'pending',
  submitted_by VARCHAR(255),
  submission_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP,
  resolved_at TIMESTAMP,

  -- Photos & Attributes (JSONB)
  photos JSONB DEFAULT '[]'::jsonb,
  attributes JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT valid_item_type CHECK (item_type IN ('place', 'pet', 'hotel', 'artist')),
  CONSTRAINT slug_required_for_non_pets CHECK (item_type = 'pet' OR slug IS NOT NULL)
);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read" ON items FOR SELECT USING (status = 'approved' OR status = 'active');
CREATE POLICY "Allow admin all" ON items FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon_code VARCHAR(50),
  color_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ARTICLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  author VARCHAR(100) DEFAULT 'Kaş Guide',
  read_time VARCHAR(20),
  featured_image VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read articles" ON articles FOR SELECT USING (status = 'published');

CREATE TABLE IF NOT EXISTS article_tags (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL
);

-- ============================================================================
-- FAQ SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sequence_order INTEGER DEFAULT 0,
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read faqs" ON faqs FOR SELECT USING (is_published = TRUE);

CREATE TABLE IF NOT EXISTS faq_series (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

ALTER TABLE faq_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read faq_series" ON faq_series FOR SELECT USING (is_published = TRUE);

-- ============================================================================
-- ADMIN & AUDIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'editor',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  item_type VARCHAR(20),
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Items indexes
CREATE INDEX idx_items_type ON items(item_type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_status_type ON items(status, item_type);
CREATE INDEX idx_items_type_published ON items(item_type, published_at);
CREATE INDEX idx_items_number ON items(item_number);
CREATE INDEX idx_items_slug ON items(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_items_location ON items(coordinates_lat, coordinates_lng)
  WHERE coordinates_lat IS NOT NULL AND coordinates_lng IS NOT NULL;
CREATE INDEX idx_items_attrs_gin ON items USING GIN (attributes);
CREATE INDEX idx_items_photos_gin ON items USING GIN (photos);
CREATE INDEX idx_items_type_status_created ON items(item_type, status, created_at);
CREATE INDEX idx_items_type_rating ON items(item_type, rating) WHERE rating IS NOT NULL;

-- Articles indexes
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(published_at);

-- Audit indexes
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_admin ON audit_log(admin_user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
CREATE INDEX idx_audit_item_type ON audit_log(item_type) WHERE item_type IS NOT NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION get_next_item_number(p_item_type VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  v_prefix VARCHAR(10);
  v_next_num INTEGER;
  v_item_number VARCHAR(50);
BEGIN
  v_prefix := CASE p_item_type
    WHEN 'place' THEN 'PLACE'
    WHEN 'pet' THEN 'PET'
    WHEN 'hotel' THEN 'HOTEL'
    WHEN 'artist' THEN 'ARTIST'
    ELSE 'ITEM'
  END;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(item_number FROM '[0-9]+$') AS INTEGER)
  ), 0) + 1
  INTO v_next_num
  FROM items
  WHERE item_number LIKE v_prefix || '-%';

  v_item_number := v_prefix || '-' || LPAD(v_next_num::TEXT, 3, '0');

  RETURN v_item_number;
END;
$$ LANGUAGE plpgsql;
