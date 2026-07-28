-- Contact page settings (single row per key)
CREATE TABLE IF NOT EXISTS contact_settings (
  key         text PRIMARY KEY,
  value       text NOT NULL DEFAULT ''
);

ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_contact_settings" ON contact_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_insert_contact_settings" ON contact_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_contact_settings" ON contact_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_contact_settings" ON contact_settings FOR DELETE TO authenticated USING (true);

-- Contact info items (phone, email, address cards)
CREATE TABLE IF NOT EXISTS contact_info_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL DEFAULT '',
  lines       text[] NOT NULL DEFAULT '{}',
  icon_name   text NOT NULL DEFAULT 'Phone',
  link_url    text NOT NULL DEFAULT '',
  color       text NOT NULL DEFAULT '#2563eb',
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true
);

ALTER TABLE contact_info_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_contact_info" ON contact_info_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_insert_contact_info" ON contact_info_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_contact_info" ON contact_info_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_contact_info" ON contact_info_items FOR DELETE TO authenticated USING (true);

-- Contact FAQ / quick links items
CREATE TABLE IF NOT EXISTS contact_faq_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  icon_name   text NOT NULL DEFAULT 'CircleHelp',
  link_url    text NOT NULL DEFAULT '#contact-form',
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true
);

ALTER TABLE contact_faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_contact_faq" ON contact_faq_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_insert_contact_faq" ON contact_faq_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_contact_faq" ON contact_faq_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_contact_faq" ON contact_faq_items FOR DELETE TO authenticated USING (true);
