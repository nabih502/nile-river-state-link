-- F13/F14: visitor chat sessions (name + phone) and their whole transcripts were
-- readable, editable and deletable by the anon role. Visitors are anonymous by design,
-- so scope each conversation to a random per-browser token instead of to a login.

ALTER TABLE public.visitor_conversations
  ADD COLUMN IF NOT EXISTS visitor_token text;
CREATE INDEX IF NOT EXISTS visitor_conversations_token_idx
  ON public.visitor_conversations(visitor_token);

DROP POLICY IF EXISTS "vis_conv_select" ON public.visitor_conversations;
DROP POLICY IF EXISTS "vis_conv_insert" ON public.visitor_conversations;
DROP POLICY IF EXISTS "vis_conv_update" ON public.visitor_conversations;
DROP POLICY IF EXISTS "vis_conv_delete" ON public.visitor_conversations;

CREATE POLICY "vis_conv_select_own_or_admin" ON public.visitor_conversations
  FOR SELECT TO anon, authenticated
  USING (
    public.is_admin()
    OR (visitor_token IS NOT NULL AND visitor_token = public.current_visitor_token())
  );
CREATE POLICY "vis_conv_insert_own" ON public.visitor_conversations
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    public.is_admin()
    OR (visitor_token IS NOT NULL AND visitor_token = public.current_visitor_token())
  );
CREATE POLICY "vis_conv_update_own_or_admin" ON public.visitor_conversations
  FOR UPDATE TO anon, authenticated
  USING (
    public.is_admin()
    OR (visitor_token IS NOT NULL AND visitor_token = public.current_visitor_token())
  )
  WITH CHECK (
    public.is_admin()
    OR (visitor_token IS NOT NULL AND visitor_token = public.current_visitor_token())
  );
CREATE POLICY "vis_conv_delete_admin" ON public.visitor_conversations
  FOR DELETE TO anon, authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "vis_msg_select" ON public.visitor_messages;
DROP POLICY IF EXISTS "vis_msg_insert" ON public.visitor_messages;
DROP POLICY IF EXISTS "vis_msg_update" ON public.visitor_messages;
DROP POLICY IF EXISTS "vis_msg_delete" ON public.visitor_messages;

CREATE POLICY "vis_msg_select_own_or_admin" ON public.visitor_messages
  FOR SELECT TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.visitor_conversations c
       WHERE c.id = visitor_messages.conversation_id
         AND c.visitor_token IS NOT NULL
         AND c.visitor_token = public.current_visitor_token()
    )
  );
CREATE POLICY "vis_msg_insert_own" ON public.visitor_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (public.is_admin() AND sender_type IN ('admin', 'system', 'bot'))
    OR EXISTS (
      SELECT 1 FROM public.visitor_conversations c
       WHERE c.id = visitor_messages.conversation_id
         AND c.visitor_token IS NOT NULL
         AND c.visitor_token = public.current_visitor_token()
    )
  );
CREATE POLICY "vis_msg_update_own_or_admin" ON public.visitor_messages
  FOR UPDATE TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.visitor_conversations c
       WHERE c.id = visitor_messages.conversation_id
         AND c.visitor_token IS NOT NULL
         AND c.visitor_token = public.current_visitor_token()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.visitor_conversations c
       WHERE c.id = visitor_messages.conversation_id
         AND c.visitor_token IS NOT NULL
         AND c.visitor_token = public.current_visitor_token()
    )
  );
CREATE POLICY "vis_msg_delete_admin" ON public.visitor_messages
  FOR DELETE TO anon, authenticated USING (public.is_admin());
