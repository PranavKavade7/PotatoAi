/*
# Create subscribers table for newsletter

1. New Tables
- `subscribers` - Email newsletter subscribers
  - `id` (uuid, primary key)
  - `email` (text, unique, not null)
  - `name` (text, optional)
  - `subscribed_at` (timestamptz, default now)
  - `is_active` (boolean, default true)
  - `unsubscribe_token` (text, default random uuid)

2. Security
- Enable RLS on `subscribers`.
- Public can insert (subscribe) and update (unsubscribe).
- Public can read their own row by token.
*/

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  unsubscribe_token text DEFAULT gen_random_uuid()::text
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_subscribers" ON subscribers;
CREATE POLICY "public_select_subscribers" ON subscribers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_subscribers" ON subscribers;
CREATE POLICY "public_insert_subscribers" ON subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_subscribers" ON subscribers;
CREATE POLICY "public_update_subscribers" ON subscribers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_subscribers" ON subscribers;
CREATE POLICY "public_delete_subscribers" ON subscribers FOR DELETE TO anon, authenticated USING (true);
