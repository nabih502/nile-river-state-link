/*
# Create content_gallery table

Unified gallery table linking images to any content type across the site.

1. New Tables
- `content_gallery`: stores gallery images linked to news, events, culture, investment, social content
  - `id`: unique identifier
  - `content_type`: e.g. 'news', 'events', 'culture_events', 'culture_news', 'culture_artist', 'investment_opportunity', 'social_initiative', 'social_service', 'page_culture', 'page_investment', 'page_social'
  - `content_id`: UUID of the related content row (nullable for page-level galleries)
  - `image_url`: URL of the image
  - `caption`: optional Arabic caption
  - `sort_order`: display order
  - `published`: toggle visibility
  - `created_at`: timestamp

2. Security
- RLS enabled, anon + authenticated can read published rows
- Anon + authenticated can insert/update/delete (admin uses service role; public site reads only)
*/

CREATE TABLE IF NOT EXISTS content_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid,
  image_url text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_gallery_type_id ON content_gallery(content_type, content_id);

ALTER TABLE content_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_select" ON content_gallery;
CREATE POLICY "gallery_select" ON content_gallery FOR SELECT
  TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "gallery_insert" ON content_gallery;
CREATE POLICY "gallery_insert" ON content_gallery FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_update" ON content_gallery;
CREATE POLICY "gallery_update" ON content_gallery FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_delete" ON content_gallery;
CREATE POLICY "gallery_delete" ON content_gallery FOR DELETE
  TO anon, authenticated USING (true);
