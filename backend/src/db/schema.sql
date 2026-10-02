-- =======================================================
-- Software Component Cataloging System (CBSE) Database Schema
-- Database: SQLite with Foreign Keys Enabled
-- =======================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('consumer', 'contributor', 'admin')) DEFAULT 'consumer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- 3. Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- 4. Components Table
CREATE TABLE IF NOT EXISTS components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  owner_id INTEGER NOT NULL,
  framework TEXT NOT NULL,
  license TEXT NOT NULL DEFAULT 'MIT',
  repo_url TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Component Tags Relation Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS component_tags (
  component_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (component_id, tag_id),
  FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 6. Versions Table
CREATE TABLE IF NOT EXISTS versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id INTEGER NOT NULL,
  version_number TEXT NOT NULL,
  release_notes TEXT,
  html_code TEXT NOT NULL,
  css_code TEXT DEFAULT '',
  js_code TEXT DEFAULT '',
  usage_notes TEXT,
  status TEXT NOT NULL CHECK(status IN ('active', 'deprecated')) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(component_id, version_number),
  FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
);

-- 7. Dependencies Table
CREATE TABLE IF NOT EXISTS dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id INTEGER NOT NULL,
  library_name TEXT NOT NULL,
  library_version TEXT NOT NULL,
  FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
);

-- 8. Reviews Table (One review per user per component)
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(component_id, user_id),
  FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for high-performance discovery and search
CREATE INDEX IF NOT EXISTS idx_components_status ON components(status);
CREATE INDEX IF NOT EXISTS idx_components_category ON components(category_id);
CREATE INDEX IF NOT EXISTS idx_components_framework ON components(framework);
CREATE INDEX IF NOT EXISTS idx_versions_component ON versions(component_id);
CREATE INDEX IF NOT EXISTS idx_reviews_component ON reviews(component_id);
