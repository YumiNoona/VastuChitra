-- ================================================================
-- IPDS ArchViz — COMPLETE DATABASE RESET
-- ⚠️ WARNING: THIS WILL DELETE ALL EXISTING DATA AND IMAGES ⚠️
-- ================================================================

-- 1. DROP ALL EXISTING TABLES
DROP TABLE IF EXISTS project_auth CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS site_config CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- 2. STORAGE CLEANUP (MANUAL)
-- Note: Supabase restricts direct SQL deletion from storage tables to prevent data loss.
-- To completely clear old images, please go to the "Storage" tab in your Supabase Dashboard,
-- and manually empty the 'project-images' and 'site-updates' buckets before proceeding.

-- ================================================================
-- RECREATE TABLES
-- ================================================================

CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Admin write config" ON site_config FOR ALL USING (true) WITH CHECK (true);


CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  image_url TEXT,
  image_url_dark TEXT,
  image_url_light TEXT,
  stream_url TEXT,
  type TEXT DEFAULT 'Residential',
  location TEXT,
  year TEXT,
  access_type TEXT DEFAULT 'public',
  access_password TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'discarded')) DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  narrative_sections JSONB DEFAULT '[]'::jsonb,
  gallery_updates JSONB DEFAULT '[]'::jsonb,
  story TEXT,
  has_live_updates BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admin write projects" ON projects FOR ALL USING (true) WITH CHECK (true);


CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact TEXT,
  project TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public write visitors" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read visitors" ON visitors FOR SELECT USING (true);


CREATE TABLE project_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT,
  code TEXT,
  token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_auth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write auth" ON project_auth FOR ALL USING (true) WITH CHECK (true);


-- 3. SEED INITIAL CONFIG
INSERT INTO site_config (key, value) VALUES 
('global_settings', '{"site_name": "IPDS", "admin_email": "admin@ipds.com"}'::jsonb);


-- ================================================================
-- RECREATE BUCKETS & FIXED POLICIES
-- ================================================================

-- Recreate buckets explicitly checking for public access
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-updates', 'site-updates', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- The missing key for storage policies when uploading from a client API anonymously
-- is that you need ALL operations (SELECT, INSERT, UPDATE, DELETE) uniquely permitted.

-- Project Images 
CREATE POLICY "Public Access project-images read" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Public Access project-images insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Public Access project-images update" ON storage.objects FOR UPDATE USING (bucket_id = 'project-images');
CREATE POLICY "Public Access project-images delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-images');

-- Site Updates 
CREATE POLICY "Public Access site-updates read" ON storage.objects FOR SELECT USING (bucket_id = 'site-updates');
CREATE POLICY "Public Access site-updates insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-updates');
CREATE POLICY "Public Access site-updates update" ON storage.objects FOR UPDATE USING (bucket_id = 'site-updates');
CREATE POLICY "Public Access site-updates delete" ON storage.objects FOR DELETE USING (bucket_id = 'site-updates');
