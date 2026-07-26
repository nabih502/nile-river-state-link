
-- Allow anon (admin panel uses anon key) to read and update inquiries
DROP POLICY IF EXISTS "auth_select_inquiries" ON investment_inquiries;
CREATE POLICY "auth_select_inquiries" ON investment_inquiries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_inquiries" ON investment_inquiries;
CREATE POLICY "auth_update_inquiries" ON investment_inquiries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_inquiries" ON investment_inquiries;
CREATE POLICY "auth_delete_inquiries" ON investment_inquiries FOR DELETE
  TO anon, authenticated USING (true);
