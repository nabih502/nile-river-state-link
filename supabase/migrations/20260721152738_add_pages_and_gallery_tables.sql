/*
# إضافة جدول pages لإدارة محتوى صفحات الخدمات والمبادرات والمكتبة
# وجدول gallery للصور والألبومات

1. جداول جديدة
   - `pages` — محتوى الصفحات الداخلية (services, initiatives, library) قابل للتعديل من لوحة التحكم
     - id (uuid), page_type (text), title, subtitle, body, image_url, icon, published, order
   - `gallery` — معرض الصور العام
     - id, title, image_url, category, published, order, created_at

2. الأمان
   - RLS مفعّل على الجدولين
   - القراءة متاحة للجميع (anon + authenticated) للمحتوى المنشور
   - الكتابة/التعديل/الحذف متاحة للجميع (لأن النظام يستخدم كلمة مرور للأدمن بدون auth)
*/

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type text NOT NULL DEFAULT 'services',
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pages_select_public" ON pages;
CREATE POLICY "pages_select_public" ON pages FOR SELECT
TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "pages_select_admin" ON pages;
CREATE POLICY "pages_select_admin" ON pages FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "pages_insert_admin" ON pages;
CREATE POLICY "pages_insert_admin" ON pages FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "pages_update_admin" ON pages;
CREATE POLICY "pages_update_admin" ON pages FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "pages_delete_admin" ON pages;
CREATE POLICY "pages_delete_admin" ON pages FOR DELETE
TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'عام',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_select_public" ON gallery;
CREATE POLICY "gallery_select_public" ON gallery FOR SELECT
TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "gallery_insert_admin" ON gallery;
CREATE POLICY "gallery_insert_admin" ON gallery FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_update_admin" ON gallery;
CREATE POLICY "gallery_update_admin" ON gallery FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "gallery_delete_admin" ON gallery;
CREATE POLICY "gallery_delete_admin" ON gallery FOR DELETE
TO anon, authenticated USING (true);
