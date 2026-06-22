/*
# Create deals and pending_deals tables

1. New Tables
- `deals` - Verified AI deals and discounts
  - `id` (uuid, primary key)
  - `tool_name` (text, not null)
  - `company` (text)
  - `deal_title` (text, not null)
  - `deal_description` (text)
  - `original_price` (text)
  - `deal_price` (text)
  - `discount_percent` (integer)
  - `deal_type` (text)
  - `deal_url` (text)
  - `valid_until` (date)
  - `is_verified` (boolean)
  - `is_featured` (boolean)
  - `created_at` (timestamptz)

- `pending_deals` - User-submitted deals awaiting admin approval
  - `id` (uuid, primary key)
  - `tool_name` (text, not null)
  - `deal_url` (text)
  - `deal_description` (text)
  - `status` (text) -- 'pending', 'approved', 'rejected'
  - `created_at` (timestamptz)

2. Security
- Enable RLS on both tables.
- Public can read deals, insert pending_deals.
- Public can update/delete pending_deals (for admin flow simplicity).
*/

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL,
  company text,
  deal_title text NOT NULL,
  deal_description text,
  original_price text,
  deal_price text,
  discount_percent integer,
  deal_type text,
  deal_url text,
  valid_until date,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pending_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL,
  deal_url text,
  deal_description text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_deals" ON deals;
CREATE POLICY "public_select_deals" ON deals FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_deals" ON deals;
CREATE POLICY "public_insert_deals" ON deals FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_deals" ON deals;
CREATE POLICY "public_update_deals" ON deals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_deals" ON deals;
CREATE POLICY "public_delete_deals" ON deals FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_select_pending" ON pending_deals;
CREATE POLICY "public_select_pending" ON pending_deals FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_pending" ON pending_deals;
CREATE POLICY "public_insert_pending" ON pending_deals FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_pending" ON pending_deals;
CREATE POLICY "public_update_pending" ON pending_deals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_pending" ON pending_deals;
CREATE POLICY "public_delete_pending" ON pending_deals FOR DELETE TO anon, authenticated USING (true);
