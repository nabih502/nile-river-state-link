ALTER TABLE culture_associations
  ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS founded_year text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS members_count text NOT NULL DEFAULT '';

UPDATE culture_associations SET slug = 'assoc-writers'     WHERE id = '8cc19cc9-028c-49f6-b487-61630005fcc7';
UPDATE culture_associations SET slug = 'assoc-nile'        WHERE id = 'be135f7f-4409-4b75-aa44-7fc0f2c700fc';
UPDATE culture_associations SET slug = 'assoc-visual-arts' WHERE id = 'daad8420-9ce5-4646-8ba1-478d3f073a26';
UPDATE culture_associations SET slug = 'assoc-heritage'    WHERE id = 'f37b95ab-4e02-4903-8bd6-8b3e0b341f5b';
UPDATE culture_associations SET slug = 'assoc-musicians'   WHERE id = '38577b77-87b6-48f2-bbb0-041c19027716';