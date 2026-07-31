/*
# Add File Attachment Support to Chat Messages

## Changes
- Adds `attachment_url` column (TEXT, nullable) to `chat_messages` — stores the public URL of an uploaded file/image
- Adds `attachment_name` column (TEXT, nullable) — stores the original filename for display
- Adds `attachment_type` column (TEXT, nullable) — stores the MIME type (e.g. image/jpeg, application/pdf)

## Storage
- Creates a `chat-attachments` storage bucket (public) so uploaded files are reachable via public URL
- Adds INSERT / SELECT storage policies for anon + authenticated roles

## Notes
- The `body` column remains required; when only a file is sent the body defaults to an empty string
- Attachment columns are nullable — existing messages with no attachment are unaffected
*/

-- Add attachment columns to chat_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN attachment_url  TEXT;
    ALTER TABLE chat_messages ADD COLUMN attachment_name TEXT;
    ALTER TABLE chat_messages ADD COLUMN attachment_type TEXT;
  END IF;
END $$;

-- Allow body to be empty (file-only message)
ALTER TABLE chat_messages ALTER COLUMN body SET DEFAULT '';

-- Storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg','image/png','image/gif','image/webp','application/pdf','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "chat_attach_select" ON storage.objects;
CREATE POLICY "chat_attach_select" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "chat_attach_insert" ON storage.objects;
CREATE POLICY "chat_attach_insert" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "chat_attach_delete" ON storage.objects;
CREATE POLICY "chat_attach_delete" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'chat-attachments');
