-- Add media type support to content_gallery
ALTER TABLE content_gallery
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Constrain media_type to known values
ALTER TABLE content_gallery
  DROP CONSTRAINT IF EXISTS content_gallery_media_type_check;
ALTER TABLE content_gallery
  ADD CONSTRAINT content_gallery_media_type_check CHECK (media_type IN ('image', 'video'));
