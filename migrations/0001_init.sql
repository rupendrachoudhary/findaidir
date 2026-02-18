-- D1 schema for AI tools directory
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tools (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT NOT NULL,
  domain TEXT NOT NULL,
  quality_status TEXT NOT NULL DEFAULT 'verified',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tools_name ON tools(name);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_domain ON tools(domain);
CREATE INDEX IF NOT EXISTS idx_tools_quality ON tools(quality_status);

CREATE TABLE IF NOT EXISTS sponsor_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_slug TEXT NOT NULL,
  network TEXT NOT NULL,
  tracking_url TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tool_slug) REFERENCES tools(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_affiliate_tool_slug ON affiliate_links(tool_slug);
