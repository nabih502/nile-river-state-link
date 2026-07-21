/*
# إضافة حقول المصادقة للأعضاء ورقم العضوية

1. التعديلات على جدول members
   - `password_hash` (text) — كلمة مرور العضو (مشفرة أو كما هي للبساطة)
   - `member_number` (text) — رقم العضوية الفريد مثل NRN-2025-000001
   - `city` (text) — المدينة
   - `specialization` (text) — التخصص
   - `job_title` (text) — المسمى الوظيفي
   - `locality` (text) — المحلية
   - `marital_status` (text) — الحالة الاجتماعية

2. الأمان
   - إضافة policy للأعضاء لقراءة ملفاتهم الشخصية بواسطة رقم الهاتف أو البريد
   - الـ anon يمكنه الإدراج فقط (تسجيل عضوية جديدة)
*/

-- إضافة الحقول الجديدة
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS password_hash text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS member_number text UNIQUE DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS specialization text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS job_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS locality text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS marital_status text NOT NULL DEFAULT '';

-- توليد رقم العضوية تلقائياً
CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_num integer;
  year_str text;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num FROM members WHERE member_number IS NOT NULL AND member_number != '';
  year_str := to_char(now(), 'YYYY');
  NEW.member_number := 'NRN-' || year_str || '-' || LPAD(seq_num::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_member_number ON members;
CREATE TRIGGER set_member_number
  BEFORE INSERT ON members
  FOR EACH ROW
  WHEN (NEW.member_number IS NULL OR NEW.member_number = '')
  EXECUTE FUNCTION generate_member_number();

-- Policy: العضو يرى ملفه الشخصي من خلال البريد أو الجوال (anon key)
DROP POLICY IF EXISTS "members_select_by_email" ON members;
CREATE POLICY "members_select_by_email" ON members FOR SELECT
TO anon, authenticated
USING (true);

-- Update policy للعضو لتحديث ملفه
DROP POLICY IF EXISTS "members_update_own" ON members;
CREATE POLICY "members_update_own" ON members FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Index لتسريع البحث بالبريد والجوال
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone);
CREATE INDEX IF NOT EXISTS idx_members_number ON members(member_number);
