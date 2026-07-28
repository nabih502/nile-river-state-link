/*
# Create page_seo table

1. New Tables
- `page_seo`
  - `page_slug`       (text, PK) — unique page identifier (e.g. 'home', 'about', 'investment')
  - `page_label`      (text) — human-readable Arabic page name shown in admin
  - `page_url`        (text) — relative URL of the page
  - `is_dynamic`      (boolean) — whether this is a template for dynamic pages
  - `title`           (text) — <title> tag (50-60 chars ideal)
  - `description`     (text) — meta description (120-160 chars ideal)
  - `keywords`        (text) — comma-separated keywords
  - `og_title`        (text) — Open Graph title
  - `og_description`  (text) — Open Graph description
  - `og_image`        (text) — Open Graph image URL
  - `og_type`         (text) — OG type: website | article | profile
  - `canonical_url`   (text) — canonical URL (full)
  - `robots`          (text) — robots directive e.g. 'index, follow'
  - `twitter_card`    (text) — twitter card type
  - `schema_type`     (text) — JSON-LD schema type
  - `updated_at`      (timestamptz)

2. Security
- RLS enabled; anon + authenticated can SELECT (public SEO data).
- Only authenticated users can INSERT/UPDATE/DELETE.
*/

CREATE TABLE IF NOT EXISTS page_seo (
  page_slug       text PRIMARY KEY,
  page_label      text NOT NULL DEFAULT '',
  page_url        text NOT NULL DEFAULT '',
  is_dynamic      boolean NOT NULL DEFAULT false,
  title           text NOT NULL DEFAULT '',
  description     text NOT NULL DEFAULT '',
  keywords        text NOT NULL DEFAULT '',
  og_title        text NOT NULL DEFAULT '',
  og_description  text NOT NULL DEFAULT '',
  og_image        text NOT NULL DEFAULT '',
  og_type         text NOT NULL DEFAULT 'website',
  canonical_url   text NOT NULL DEFAULT '',
  robots          text NOT NULL DEFAULT 'index, follow',
  twitter_card    text NOT NULL DEFAULT 'summary_large_image',
  schema_type     text NOT NULL DEFAULT 'WebPage',
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_page_seo" ON page_seo;
CREATE POLICY "anon_select_page_seo" ON page_seo FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_page_seo" ON page_seo;
CREATE POLICY "auth_insert_page_seo" ON page_seo FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_page_seo" ON page_seo;
CREATE POLICY "auth_update_page_seo" ON page_seo FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_page_seo" ON page_seo;
CREATE POLICY "auth_delete_page_seo" ON page_seo FOR DELETE
  TO authenticated USING (true);
