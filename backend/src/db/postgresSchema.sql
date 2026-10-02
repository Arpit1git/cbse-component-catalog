-- =======================================================
-- Software Component Cataloging System (CBSE) Database Schema
-- Database: PostgreSQL (Render, Neon, Supabase, Railway)
-- =======================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL CHECK(role IN ('consumer', 'contributor', 'admin')) DEFAULT 'consumer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT
);

-- 3. Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- 4. Components Table
CREATE TABLE IF NOT EXISTS components (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  framework VARCHAR(100) NOT NULL,
  license VARCHAR(100) NOT NULL DEFAULT 'MIT',
  repo_url TEXT,
  status VARCHAR(50) NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Component Tags Relation Table
CREATE TABLE IF NOT EXISTS component_tags (
  component_id INTEGER NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (component_id, tag_id)
);

-- 6. Versions Table
CREATE TABLE IF NOT EXISTS versions (
  id SERIAL PRIMARY KEY,
  component_id INTEGER NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  version_number VARCHAR(50) NOT NULL,
  release_notes TEXT,
  html_code TEXT NOT NULL,
  css_code TEXT DEFAULT '',
  js_code TEXT DEFAULT '',
  usage_notes TEXT,
  status VARCHAR(50) NOT NULL CHECK(status IN ('active', 'deprecated')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(component_id, version_number)
);

-- 7. Dependencies Table
CREATE TABLE IF NOT EXISTS dependencies (
  id SERIAL PRIMARY KEY,
  version_id INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  library_name VARCHAR(255) NOT NULL,
  library_version VARCHAR(100) NOT NULL
);

-- 8. Reviews Table (One review per user per component)
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  component_id INTEGER NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(component_id, user_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_components_status ON components(status);
CREATE INDEX IF NOT EXISTS idx_components_category ON components(category_id);
CREATE INDEX IF NOT EXISTS idx_components_framework ON components(framework);
CREATE INDEX IF NOT EXISTS idx_versions_component ON versions(component_id);
CREATE INDEX IF NOT EXISTS idx_reviews_component ON reviews(component_id);
