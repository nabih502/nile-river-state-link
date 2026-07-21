/*
# إنشاء جداول الموقع الرئيسية

1. الجداول الجديدة
   - `news` - الأخبار: id, title, slug, body, excerpt, image_url, category, published, published_at, created_at
   - `events` - الفعاليات: id, title, slug, body, excerpt, image_url, location, event_date, event_end_date, published, created_at
   - `members` - الأعضاء: id, full_name, national_id, email, phone, gender, birth_date, state, country, photo_url, membership_type, status, created_at
   - `contact_messages` - رسائل التواصل: id, name, email, phone, subject, message, read, created_at
   - `site_settings` - إعدادات الموقع: key, value, updated_at
   - `admin_users` - مستخدمو لوحة التحكم

2. الأمان
   - RLS مفعّل على جميع الجداول
   - الجداول العامة (news, events) متاحة للقراءة لـ anon
   - الكتابة/التعديل/الحذف للـ authenticated فقط
   - contact_messages قابل للإرسال من anon
   - members قابل للإرسال من anon (تسجيل عضوية)
*/

-- =====================
-- NEWS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  body text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'عام',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_select_public" ON news;
CREATE POLICY "news_select_public" ON news FOR SELECT
TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "news_select_admin" ON news;
CREATE POLICY "news_select_admin" ON news FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "news_insert_admin" ON news;
CREATE POLICY "news_insert_admin" ON news FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "news_update_admin" ON news;
CREATE POLICY "news_update_admin" ON news FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "news_delete_admin" ON news;
CREATE POLICY "news_delete_admin" ON news FOR DELETE
TO authenticated USING (true);

-- =====================
-- EVENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  body text NOT NULL DEFAULT '',
  excerpt text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  event_date timestamptz NOT NULL DEFAULT now(),
  event_end_date timestamptz,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_public" ON events;
CREATE POLICY "events_select_public" ON events FOR SELECT
TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "events_select_admin" ON events;
CREATE POLICY "events_select_admin" ON events FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "events_insert_admin" ON events;
CREATE POLICY "events_insert_admin" ON events FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "events_update_admin" ON events;
CREATE POLICY "events_update_admin" ON events FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "events_delete_admin" ON events;
CREATE POLICY "events_delete_admin" ON events FOR DELETE
TO authenticated USING (true);

-- =====================
-- MEMBERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  national_id text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  gender text NOT NULL DEFAULT 'male',
  birth_date date,
  state text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'السودان',
  photo_url text NOT NULL DEFAULT '',
  membership_type text NOT NULL DEFAULT 'basic',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_insert_anon" ON members;
CREATE POLICY "members_insert_anon" ON members FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "members_select_admin" ON members;
CREATE POLICY "members_select_admin" ON members FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "members_update_admin" ON members;
CREATE POLICY "members_update_admin" ON members FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "members_delete_admin" ON members;
CREATE POLICY "members_delete_admin" ON members FOR DELETE
TO authenticated USING (true);

-- =====================
-- CONTACT MESSAGES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_insert_anon" ON contact_messages;
CREATE POLICY "contact_insert_anon" ON contact_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_select_admin" ON contact_messages;
CREATE POLICY "contact_select_admin" ON contact_messages FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "contact_update_admin" ON contact_messages;
CREATE POLICY "contact_update_admin" ON contact_messages FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "contact_delete_admin" ON contact_messages;
CREATE POLICY "contact_delete_admin" ON contact_messages FOR DELETE
TO authenticated USING (true);

-- =====================
-- SITE SETTINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_anon" ON site_settings;
CREATE POLICY "settings_select_anon" ON site_settings FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_insert_admin" ON site_settings;
CREATE POLICY "settings_insert_admin" ON site_settings FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "settings_update_admin" ON site_settings;
CREATE POLICY "settings_update_admin" ON site_settings FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "settings_delete_admin" ON site_settings;
CREATE POLICY "settings_delete_admin" ON site_settings FOR DELETE
TO authenticated USING (true);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'رابطة ولاية نهر النيل الرقمية'),
  ('site_email', 'info@nilenile.org'),
  ('site_phone', '+249 912 345 678'),
  ('site_address', 'ولاية نهر النيل - السودان'),
  ('admin_password', 'admin2024')
ON CONFLICT (key) DO NOTHING;

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(read, created_at DESC);

-- =====================
-- SAMPLE DATA - NEWS
-- =====================
INSERT INTO news (title, slug, body, excerpt, image_url, category, published, published_at) VALUES
(
  'رابطة ولاية نهر النيل تطلق منصتها الرقمية الجديدة',
  'launch-digital-platform',
  '<p>أطلقت رابطة ولاية نهر النيل منصتها الرقمية الجديدة التي تهدف إلى خدمة أبناء الولاية في الداخل والخارج، وذلك في خطوة نحو التحول الرقمي الشامل.</p><p>تتضمن المنصة خدمات متعددة تشمل التعليم والصحة والاستثمار والثقافة، إضافة إلى بوابة للعضوية الرقمية تتيح لأبناء الولاية في جميع أنحاء العالم الانتساب إلى الرابطة.</p>',
  'أطلقت رابطة ولاية نهر النيل منصتها الرقمية الجديدة لخدمة أبناء الولاية في الداخل والخارج.',
  '/assets/home-hero-hq.webp',
  'تقنية',
  true,
  now() - interval '2 days'
),
(
  'اجتماع الهيئة الإدارية للرابطة لمناقشة خطط العام القادم',
  'board-meeting-next-year-plans',
  '<p>عقدت الهيئة الإدارية لرابطة ولاية نهر النيل اجتماعها الدوري لمناقشة خطط وبرامج العام القادم، حيث تناول الاجتماع عدداً من المحاور الأساسية.</p><p>أكد رئيس الرابطة على أهمية تفعيل دور الرابطة في خدمة أبناء الولاية، مشيراً إلى الإنجازات المحققة خلال العام الماضي.</p>',
  'عقدت الهيئة الإدارية اجتماعها الدوري لمناقشة خطط وبرامج العام القادم.',
  '/assets/about-hero-exact.webp',
  'إدارة',
  true,
  now() - interval '5 days'
),
(
  'برنامج المنح الدراسية لأبناء ولاية نهر النيل',
  'scholarships-program',
  '<p>أعلنت رابطة ولاية نهر النيل عن فتح باب التسجيل في برنامج المنح الدراسية السنوي المخصص لأبناء الولاية المتميزين.</p><p>يستهدف البرنامج الطلاب المتميزين من أبناء الولاية الذين يرغبون في مواصلة تعليمهم الجامعي أو الدراسات العليا.</p>',
  'فتح باب التسجيل في برنامج المنح الدراسية السنوي المخصص لأبناء الولاية.',
  '/assets/education-hero-hq.webp',
  'تعليم',
  true,
  now() - interval '7 days'
)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- SAMPLE DATA - EVENTS
-- =====================
INSERT INTO events (title, slug, body, excerpt, image_url, location, event_date, event_end_date, published) VALUES
(
  'ملتقى أبناء ولاية نهر النيل السنوي',
  'annual-nile-gathering',
  '<p>يسعد رابطة ولاية نهر النيل دعوة جميع الأعضاء وأبناء الولاية لحضور الملتقى السنوي الذي سيجمع أبناء الولاية من داخل السودان وخارجه.</p><p>يتضمن الملتقى جلسات حوارية وعروضاً ثقافية وفعاليات ترفيهية، إضافة إلى معرض لمنتجات وإبداعات أبناء الولاية.</p>',
  'الملتقى السنوي الجامع لأبناء ولاية نهر النيل من الداخل والخارج.',
  '/assets/culture-event-1.jpg',
  'قاعة مؤتمرات نادي الخريجين - عطبرة',
  now() + interval '15 days',
  now() + interval '16 days',
  true
),
(
  'ورشة تدريبية في ريادة الأعمال والاستثمار',
  'entrepreneurship-workshop',
  '<p>تنظم رابطة ولاية نهر النيل ورشة تدريبية متخصصة في ريادة الأعمال والاستثمار، بهدف تأهيل الشباب لإطلاق مشاريعهم الخاصة.</p><p>تشمل الورشة تدريباً عملياً على إعداد دراسات الجدوى وخطط الأعمال، بإشراف خبراء ومختصين في مجال الاستثمار.</p>',
  'ورشة تدريبية لتأهيل الشباب في ريادة الأعمال والاستثمار.',
  '/assets/investment-hero-hq.webp',
  'مركز التدريب - الدامر',
  now() + interval '30 days',
  now() + interval '31 days',
  true
),
(
  'حفل تكريم المتميزين من أبناء الولاية',
  'excellence-ceremony',
  '<p>تحتفي رابطة ولاية نهر النيل بأبنائها المتميزين في مختلف المجالات العلمية والثقافية والرياضية، في حفل تكريم سنوي مميز.</p>',
  'حفل تكريم المتميزين من أبناء الولاية في مختلف المجالات.',
  '/assets/culture-event-2.jpg',
  'قاعة الصداقة - الخرطوم',
  now() - interval '3 days',
  null,
  true
)
ON CONFLICT (slug) DO NOTHING;
