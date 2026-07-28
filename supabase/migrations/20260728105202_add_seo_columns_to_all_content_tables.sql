DO $$
BEGIN
  -- culture_events
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='culture_events' AND column_name='seo_title') THEN
    ALTER TABLE culture_events ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE culture_events ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE culture_events ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- culture_news
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='culture_news' AND column_name='seo_title') THEN
    ALTER TABLE culture_news ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE culture_news ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE culture_news ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- culture_artists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='culture_artists' AND column_name='seo_title') THEN
    ALTER TABLE culture_artists ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE culture_artists ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE culture_artists ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- culture_associations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='culture_associations' AND column_name='seo_title') THEN
    ALTER TABLE culture_associations ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE culture_associations ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE culture_associations ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- culture_initiatives
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='culture_initiatives' AND column_name='seo_title') THEN
    ALTER TABLE culture_initiatives ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE culture_initiatives ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE culture_initiatives ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- culture_media
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='culture_media' AND column_name='seo_title') THEN
    ALTER TABLE culture_media ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE culture_media ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE culture_media ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- culture_art_categories
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='culture_art_categories' AND column_name='seo_title') THEN
    ALTER TABLE culture_art_categories ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE culture_art_categories ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE culture_art_categories ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- investment_sectors
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='investment_sectors' AND column_name='seo_title') THEN
    ALTER TABLE investment_sectors ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE investment_sectors ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE investment_sectors ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- investment_opportunities
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='investment_opportunities' AND column_name='seo_title') THEN
    ALTER TABLE investment_opportunities ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE investment_opportunities ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE investment_opportunities ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- social_services
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_services' AND column_name='seo_title') THEN
    ALTER TABLE social_services ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE social_services ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE social_services ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
  -- social_initiatives
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_initiatives' AND column_name='seo_title') THEN
    ALTER TABLE social_initiatives ADD COLUMN seo_title text NOT NULL DEFAULT '';
    ALTER TABLE social_initiatives ADD COLUMN seo_description text NOT NULL DEFAULT '';
    ALTER TABLE social_initiatives ADD COLUMN seo_image text NOT NULL DEFAULT '';
  END IF;
END $$;
