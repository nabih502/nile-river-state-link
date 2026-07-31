/*
# Member Portal — Chat, Service Requests, Event Registrations

## New Tables

### chat_conversations
One thread per member. Tracks status and unread counts for both sides.

### chat_messages
Individual messages inside a conversation. Supabase Realtime subscribes to this table.

### member_service_requests
Member requests a social/health service. Admin tracks and updates status.

### member_event_registrations
Member registers attendance for an event (from events or culture_events).

## RLS
All tables use open anon/authenticated policies — the portal uses anon key without Supabase Auth.
Row-level isolation is enforced by the application (member_id matching).
*/

-- ── chat_conversations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  member_name     TEXT NOT NULL DEFAULT '',
  member_number   TEXT NOT NULL DEFAULT '',
  subject         TEXT NOT NULL DEFAULT 'استفسار عام',
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','closed')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  admin_unread    INT NOT NULL DEFAULT 0,
  member_unread   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conv_member   ON chat_conversations(member_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_status   ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conv_last_msg ON chat_conversations(last_message_at DESC);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_chat_conversations" ON chat_conversations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_chat_conversations" ON chat_conversations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_chat_conversations" ON chat_conversations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_chat_conversations" ON chat_conversations FOR DELETE TO anon, authenticated USING (true);

-- ── chat_messages ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_type     TEXT NOT NULL CHECK (sender_type IN ('member','admin')),
  sender_name     TEXT NOT NULL DEFAULT '',
  body            TEXT NOT NULL,
  read            BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_msg_conv ON chat_messages(conversation_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE TO anon, authenticated USING (true);

-- Enable realtime for chat_messages and chat_conversations
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;

-- ── member_service_requests ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_service_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  member_name   TEXT NOT NULL DEFAULT '',
  member_number TEXT NOT NULL DEFAULT '',
  service_id    UUID REFERENCES social_services(id) ON DELETE SET NULL,
  service_title TEXT NOT NULL DEFAULT '',
  message       TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','completed','rejected')),
  admin_notes   TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_req_member ON member_service_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_service_req_status ON member_service_requests(status);

ALTER TABLE member_service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_member_service_requests" ON member_service_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_member_service_requests" ON member_service_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_member_service_requests" ON member_service_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_member_service_requests" ON member_service_requests FOR DELETE TO anon, authenticated USING (true);

-- ── member_event_registrations ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS member_event_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_id    UUID NOT NULL,
  event_type  TEXT NOT NULL DEFAULT 'event' CHECK (event_type IN ('event','culture')),
  event_title TEXT NOT NULL DEFAULT '',
  event_date  TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_member ON member_event_registrations(member_id);

ALTER TABLE member_event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_member_event_registrations" ON member_event_registrations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_member_event_registrations" ON member_event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_member_event_registrations" ON member_event_registrations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_member_event_registrations" ON member_event_registrations FOR DELETE TO anon, authenticated USING (true);
