-- Add show_specs column to investment_opportunities
ALTER TABLE investment_opportunities ADD COLUMN IF NOT EXISTS show_specs boolean NOT NULL DEFAULT true;

-- Create public images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for images bucket
CREATE POLICY "Public read images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'images');
CREATE POLICY "Auth upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');
CREATE POLICY "Auth update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images');
CREATE POLICY "Auth delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images');
