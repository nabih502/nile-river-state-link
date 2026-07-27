/*
# Add description fields and slugs to culture tables

1. culture_events: add description text column for full event details
2. culture_news: add slug column for URL routing
3. culture_artists: add slug column for URL routing
4. culture_initiatives: add slug column for URL routing
5. Auto-generate simple slugs for existing rows
*/

ALTER TABLE culture_events   ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE culture_news      ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE culture_artists   ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';
ALTER TABLE culture_initiatives ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '';

-- Back-fill slugs with simple pattern: table-prefix + row number within ordered set
DO $$
DECLARE
  r RECORD;
  n int;
BEGIN
  n := 0;
  FOR r IN SELECT id FROM culture_news ORDER BY created_at LOOP
    n := n + 1;
    UPDATE culture_news SET slug = 'news-' || n WHERE id = r.id AND (slug IS NULL OR slug = '');
  END LOOP;

  n := 0;
  FOR r IN SELECT id FROM culture_artists ORDER BY created_at LOOP
    n := n + 1;
    UPDATE culture_artists SET slug = 'artist-' || n WHERE id = r.id AND (slug IS NULL OR slug = '');
  END LOOP;

  n := 0;
  FOR r IN SELECT id FROM culture_initiatives ORDER BY created_at LOOP
    n := n + 1;
    UPDATE culture_initiatives SET slug = 'initiative-' || n WHERE id = r.id AND (slug IS NULL OR slug = '');
  END LOOP;
END $$;
