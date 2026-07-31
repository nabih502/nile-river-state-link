-- F11/F12: member support conversations and messages were fully readable, editable and
-- deletable by the anon role (USING (true) on all four verbs), and because sender_type
-- came from the request body with WITH CHECK (true), anyone could post a message that
-- appears to come from the association's staff.

DROP POLICY IF EXISTS "anon_select_chat_conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "anon_insert_chat_conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "anon_update_chat_conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "anon_delete_chat_conversations" ON public.chat_conversations;

CREATE POLICY "chat_conv_select_own_or_admin" ON public.chat_conversations
  FOR SELECT TO anon, authenticated
  USING (member_id = public.current_member_id() OR public.is_admin());
CREATE POLICY "chat_conv_insert_own" ON public.chat_conversations
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_admin() OR member_id = public.current_member_id());
CREATE POLICY "chat_conv_update_own_or_admin" ON public.chat_conversations
  FOR UPDATE TO anon, authenticated
  USING (member_id = public.current_member_id() OR public.is_admin())
  WITH CHECK (member_id = public.current_member_id() OR public.is_admin());
CREATE POLICY "chat_conv_delete_admin" ON public.chat_conversations
  FOR DELETE TO anon, authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "anon_select_chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "anon_insert_chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "anon_update_chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "anon_delete_chat_messages" ON public.chat_messages;

CREATE POLICY "chat_msg_select_own_or_admin" ON public.chat_messages
  FOR SELECT TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.chat_conversations c
       WHERE c.id = chat_messages.conversation_id
         AND c.member_id = public.current_member_id()
    )
  );
CREATE POLICY "chat_msg_insert_own" ON public.chat_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (public.is_admin() AND sender_type IN ('admin', 'system'))
    OR (
      sender_type = 'member'
      AND EXISTS (
        SELECT 1 FROM public.chat_conversations c
         WHERE c.id = chat_messages.conversation_id
           AND c.member_id = public.current_member_id()
      )
    )
  );
CREATE POLICY "chat_msg_update_own_or_admin" ON public.chat_messages
  FOR UPDATE TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.chat_conversations c
       WHERE c.id = chat_messages.conversation_id
         AND c.member_id = public.current_member_id()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.chat_conversations c
       WHERE c.id = chat_messages.conversation_id
         AND c.member_id = public.current_member_id()
    )
  );
CREATE POLICY "chat_msg_delete_admin" ON public.chat_messages
  FOR DELETE TO anon, authenticated USING (public.is_admin());
