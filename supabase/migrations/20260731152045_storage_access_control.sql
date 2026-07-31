-- F20: the chat-attachments bucket let the anon role read, overwrite and DELETE every
--      file, with no size or type limit.
-- F21: the images bucket was listable by anyone, exposing every member's personal photo
--      at a predictable path.
-- F27: uploads were size- and type-checked only in the browser.

UPDATE storage.buckets
   SET file_size_limit   = 5242880,
       allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
 WHERE id = 'images';

UPDATE storage.buckets
   SET public             = false,
       file_size_limit    = 5242880,
       allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']
 WHERE id = 'chat-attachments';

-- ── images ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read images"  ON storage.objects;
DROP POLICY IF EXISTS "Auth upload images"  ON storage.objects;
DROP POLICY IF EXISTS "Auth update images"  ON storage.objects;
DROP POLICY IF EXISTS "Auth delete images"  ON storage.objects;

-- Site imagery stays publicly readable (the bucket is public, so object downloads do
-- not consult this policy); member photo folders are no longer enumerable.
CREATE POLICY "images_read_public_except_members" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'images'
    AND (
      (storage.foldername(name))[1] <> 'members'
      OR public.is_admin()
      OR (storage.foldername(name))[2] = public.current_member_id()::text
    )
  );

CREATE POLICY "images_insert_admin_or_own_photo" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND name ~* '\.(jpe?g|png|webp|gif|svg)$'
    AND (
      public.is_admin()
      OR (
        (storage.foldername(name))[1] = 'members'
        AND (storage.foldername(name))[2] = public.current_member_id()::text
      )
    )
  );

CREATE POLICY "images_update_admin_or_own_photo" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (
    bucket_id = 'images'
    AND (
      public.is_admin()
      OR (
        (storage.foldername(name))[1] = 'members'
        AND (storage.foldername(name))[2] = public.current_member_id()::text
      )
    )
  )
  WITH CHECK (
    bucket_id = 'images'
    AND name ~* '\.(jpe?g|png|webp|gif|svg)$'
    AND (
      public.is_admin()
      OR (
        (storage.foldername(name))[1] = 'members'
        AND (storage.foldername(name))[2] = public.current_member_id()::text
      )
    )
  );

CREATE POLICY "images_delete_admin" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'images' AND public.is_admin());

-- ── chat-attachments ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "chat_attach_select" ON storage.objects;
DROP POLICY IF EXISTS "chat_attach_insert" ON storage.objects;
DROP POLICY IF EXISTS "chat_attach_delete" ON storage.objects;

CREATE POLICY "chat_attach_select_participant" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'chat-attachments'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.chat_conversations c
         WHERE c.id::text = (storage.foldername(name))[1]
           AND c.member_id = public.current_member_id()
      )
    )
  );

CREATE POLICY "chat_attach_insert_participant" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.chat_conversations c
         WHERE c.id::text = (storage.foldername(name))[1]
           AND c.member_id = public.current_member_id()
      )
    )
  );

CREATE POLICY "chat_attach_delete_admin" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'chat-attachments' AND public.is_admin());

-- The client never needs to create or reconfigure buckets.
REVOKE ALL ON TABLE storage.buckets FROM anon, authenticated;
GRANT SELECT ON TABLE storage.buckets TO anon, authenticated;
