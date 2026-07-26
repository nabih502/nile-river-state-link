/*
# جدول طلبات الاستثمار (investment_inquiries)

1. جداول جديدة
- `investment_inquiries`
  - `id` (uuid, مفتاح رئيسي)
  - `type` (text) — 'sector' أو 'opportunity'
  - `reference_slug` (text) — slug القطاع أو الفرصة
  - `reference_title` (text) — عنوان القطاع أو الفرصة
  - `name` (text) — اسم مقدم الطلب
  - `email` (text) — البريد الإلكتروني
  - `phone` (text) — رقم الهاتف
  - `message` (text) — الرسالة أو الملاحظات
  - `status` (text) — حالة الطلب: new/contacted/closed
  - `created_at` (timestamptz)

2. الأمان
- تفعيل RLS.
- السماح لأي زائر (anon) بإرسال طلب جديد (INSERT).
- قراءة وتعديل الطلبات للمستخدمين المصادق عليهم فقط (لوحة التحكم).
*/

CREATE TABLE IF NOT EXISTS investment_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'opportunity',
  reference_slug text NOT NULL DEFAULT '',
  reference_title text NOT NULL DEFAULT '',
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_inquiries" ON investment_inquiries;
CREATE POLICY "anon_insert_inquiries" ON investment_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_inquiries" ON investment_inquiries;
CREATE POLICY "auth_select_inquiries" ON investment_inquiries FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_inquiries" ON investment_inquiries;
CREATE POLICY "auth_update_inquiries" ON investment_inquiries FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_inquiries" ON investment_inquiries;
CREATE POLICY "auth_delete_inquiries" ON investment_inquiries FOR DELETE
  TO authenticated USING (true);
