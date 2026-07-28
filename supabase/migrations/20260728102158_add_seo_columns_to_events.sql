/*
# Add seo columns to events table

Adds seo_title, seo_description, seo_image to events (they already exist in news).
Idempotent — uses DO block.
*/
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='seo_title') THEN
    ALTER TABLE events ADD COLUMN seo_title text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='seo_description') THEN
    ALTER TABLE events ADD COLUMN seo_description text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='seo_image') THEN
    ALTER TABLE events ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
END $$;
