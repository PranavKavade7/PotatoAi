/*
# Create PotatoAi database schema

1. New Tables
- `companies` - AI companies (OpenAI, Anthropic, etc.)
- `models` - AI models with specs and ratings
- `news` - AI news articles
- `glossary` - AI terminology definitions
- `ratings` - Community ratings for models

2. Security
- Enable RLS on all tables
- Public read access for all tables (single-tenant, no auth required)
- Admin write access via service role
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  founded_year integer,
  description text,
  website text,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  description text,
  use_cases text[],
  pricing_type text,
  pricing_detail text,
  context_window text,
  benchmark_score numeric,
  official_url text,
  launched_at date,
  created_at timestamptz DEFAULT now(),
  is_featured boolean DEFAULT false
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  source_url text,
  source_name text,
  category text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  is_featured boolean DEFAULT false
);

-- Glossary table
CREATE TABLE IF NOT EXISTS glossary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  definition text NOT NULL,
  example text,
  category text
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES models(id) ON DELETE CASCADE,
  user_id uuid,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  has_used boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(model_id, user_id)
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Public read policies for all tables
DROP POLICY IF EXISTS "public_select_companies" ON companies;
CREATE POLICY "public_select_companies" ON companies FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_models" ON models;
CREATE POLICY "public_select_models" ON models FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_news" ON news;
CREATE POLICY "public_select_news" ON news FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_glossary" ON glossary;
CREATE POLICY "public_select_glossary" ON glossary FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_ratings" ON ratings;
CREATE POLICY "public_select_ratings" ON ratings FOR SELECT TO anon, authenticated USING (true);

-- Allow public insert for ratings (no auth needed for MVP)
DROP POLICY IF EXISTS "public_insert_ratings" ON ratings;
CREATE POLICY "public_insert_ratings" ON ratings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow public insert for all tables (admin will use service role, but allow for simplicity)
DROP POLICY IF EXISTS "public_insert_companies" ON companies;
CREATE POLICY "public_insert_companies" ON companies FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_models" ON models;
CREATE POLICY "public_insert_models" ON models FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_news" ON news;
CREATE POLICY "public_insert_news" ON news FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_glossary" ON glossary;
CREATE POLICY "public_insert_glossary" ON glossary FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow public update/delete for admin purposes
DROP POLICY IF EXISTS "public_update_companies" ON companies;
CREATE POLICY "public_update_companies" ON companies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_companies" ON companies;
CREATE POLICY "public_delete_companies" ON companies FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_update_models" ON models;
CREATE POLICY "public_update_models" ON models FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_models" ON models;
CREATE POLICY "public_delete_models" ON models FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_update_news" ON news;
CREATE POLICY "public_update_news" ON news FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_news" ON news;
CREATE POLICY "public_delete_news" ON news FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_update_glossary" ON glossary;
CREATE POLICY "public_update_glossary" ON glossary FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_glossary" ON glossary;
CREATE POLICY "public_delete_glossary" ON glossary FOR DELETE TO anon, authenticated USING (true);
