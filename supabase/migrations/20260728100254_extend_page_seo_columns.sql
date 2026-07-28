/*
# Extend page_seo table with full SEO fields

Adds all missing columns needed for comprehensive SEO management:
- page_slug (rename from page_key or add as alias)
- page_label, page_url, is_dynamic
- og_title, og_description, og_type
- robots, twitter_card, schema_type

Keeps existing data intact.
*/

-- Add all missing columns idempotently
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='page_slug') THEN
    ALTER TABLE page_seo ADD COLUMN page_slug text;
    -- Copy from page_key if it exists
    UPDATE page_seo SET page_slug = page_key WHERE page_slug IS NULL AND page_key IS NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='page_label') THEN
    ALTER TABLE page_seo ADD COLUMN page_label text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='page_url') THEN
    ALTER TABLE page_seo ADD COLUMN page_url text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='is_dynamic') THEN
    ALTER TABLE page_seo ADD COLUMN is_dynamic boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='title') THEN
    ALTER TABLE page_seo ADD COLUMN title text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='description') THEN
    ALTER TABLE page_seo ADD COLUMN description text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='og_title') THEN
    ALTER TABLE page_seo ADD COLUMN og_title text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='og_description') THEN
    ALTER TABLE page_seo ADD COLUMN og_description text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='og_type') THEN
    ALTER TABLE page_seo ADD COLUMN og_type text NOT NULL DEFAULT 'website';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='robots') THEN
    ALTER TABLE page_seo ADD COLUMN robots text NOT NULL DEFAULT 'index, follow';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='twitter_card') THEN
    ALTER TABLE page_seo ADD COLUMN twitter_card text NOT NULL DEFAULT 'summary_large_image';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='page_seo' AND column_name='schema_type') THEN
    ALTER TABLE page_seo ADD COLUMN schema_type text NOT NULL DEFAULT 'WebPage';
  END IF;
END $$;

-- Make page_slug unique if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'page_seo' AND indexname = 'page_seo_page_slug_key'
  ) THEN
    CREATE UNIQUE INDEX page_seo_page_slug_key ON page_seo (page_slug) WHERE page_slug IS NOT NULL;
  END IF;
END $$;

-- RLS policies (drop + recreate for idempotency)
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_page_seo" ON page_seo;
CREATE POLICY "anon_select_page_seo" ON page_seo FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_page_seo" ON page_seo;
CREATE POLICY "auth_insert_page_seo" ON page_seo FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_page_seo" ON page_seo;
CREATE POLICY "auth_update_page_seo" ON page_seo FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_page_seo" ON page_seo;
CREATE POLICY "auth_delete_page_seo" ON page_seo FOR DELETE TO authenticated USING (true);
