-- Add proper unique constraint on page_slug
ALTER TABLE page_seo ADD CONSTRAINT page_seo_slug_unique UNIQUE (page_slug);
