/*
# Create Culture Section Tables

Creates 7 tables to manage all dynamic content for the cultural page:
culture_events, culture_news, culture_artists, culture_associations,
culture_initiatives, culture_contests, culture_media.

1. New Tables:
   - culture_events: فعاليات وأنشطة ثقافية (image, tag, title, event_date, location)
   - culture_news: أخبار ثقافية (image, title, excerpt, body, published_at)
   - culture_artists: فنانون وكتّاب (image, name, role, bio)
   - culture_associations: جمعيات وروابط ثقافية (title, place, icon)
   - culture_initiatives: مبادرات ومشاريع ثقافية (image, title, text)
   - culture_contests: مسابقات وجوائز (title, deadline)
   - culture_media: وسائط ثقافية - فيديو/بودكاست (image, type, title, media_date, link_url)

2. Security:
   - RLS enabled on all tables.
   - Public SELECT for published=true rows (anon + authenticated).
   - Admin SELECT for all rows (authenticated).
   - Admin INSERT/UPDATE/DELETE (authenticated only).
*/

-- ── culture_events ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS culture_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  image_url   text NOT NULL DEFAULT '',
  tag         text NOT NULL DEFAULT '',
  event_date  text NOT NULL DEFAULT '',
  location    text NOT NULL DEFAULT '',
  published   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE culture_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "culture_events_select_public"  ON culture_events;
DROP POLICY IF EXISTS "culture_events_select_admin"   ON culture_events;
DROP POLICY IF EXISTS "culture_events_insert_admin"   ON culture_events;
DROP POLICY IF EXISTS "culture_events_update_admin"   ON culture_events;
DROP POLICY IF EXISTS "culture_events_delete_admin"   ON culture_events;
CREATE POLICY "culture_events_select_public"  ON culture_events FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "culture_events_select_admin"   ON culture_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "culture_events_insert_admin"   ON culture_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "culture_events_update_admin"   ON culture_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "culture_events_delete_admin"   ON culture_events FOR DELETE TO authenticated USING (true);

-- ── culture_news ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS culture_news (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  image_url    text NOT NULL DEFAULT '',
  excerpt      text NOT NULL DEFAULT '',
  body         text NOT NULL DEFAULT '',
  published_at timestamptz DEFAULT now(),
  published    boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE culture_news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "culture_news_select_public"  ON culture_news;
DROP POLICY IF EXISTS "culture_news_select_admin"   ON culture_news;
DROP POLICY IF EXISTS "culture_news_insert_admin"   ON culture_news;
DROP POLICY IF EXISTS "culture_news_update_admin"   ON culture_news;
DROP POLICY IF EXISTS "culture_news_delete_admin"   ON culture_news;
CREATE POLICY "culture_news_select_public"  ON culture_news FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "culture_news_select_admin"   ON culture_news FOR SELECT TO authenticated USING (true);
CREATE POLICY "culture_news_insert_admin"   ON culture_news FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "culture_news_update_admin"   ON culture_news FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "culture_news_delete_admin"   ON culture_news FOR DELETE TO authenticated USING (true);

-- ── culture_artists ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS culture_artists (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  image_url  text NOT NULL DEFAULT '',
  role       text NOT NULL DEFAULT '',
  bio        text NOT NULL DEFAULT '',
  published  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE culture_artists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "culture_artists_select_public"  ON culture_artists;
DROP POLICY IF EXISTS "culture_artists_select_admin"   ON culture_artists;
DROP POLICY IF EXISTS "culture_artists_insert_admin"   ON culture_artists;
DROP POLICY IF EXISTS "culture_artists_update_admin"   ON culture_artists;
DROP POLICY IF EXISTS "culture_artists_delete_admin"   ON culture_artists;
CREATE POLICY "culture_artists_select_public"  ON culture_artists FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "culture_artists_select_admin"   ON culture_artists FOR SELECT TO authenticated USING (true);
CREATE POLICY "culture_artists_insert_admin"   ON culture_artists FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "culture_artists_update_admin"   ON culture_artists FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "culture_artists_delete_admin"   ON culture_artists FOR DELETE TO authenticated USING (true);

-- ── culture_associations ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS culture_associations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  place      text NOT NULL DEFAULT '',
  icon       text NOT NULL DEFAULT 'Users',
  published  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE culture_associations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "culture_assoc_select_public"  ON culture_associations;
DROP POLICY IF EXISTS "culture_assoc_select_admin"   ON culture_associations;
DROP POLICY IF EXISTS "culture_assoc_insert_admin"   ON culture_associations;
DROP POLICY IF EXISTS "culture_assoc_update_admin"   ON culture_associations;
DROP POLICY IF EXISTS "culture_assoc_delete_admin"   ON culture_associations;
CREATE POLICY "culture_assoc_select_public"  ON culture_associations FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "culture_assoc_select_admin"   ON culture_associations FOR SELECT TO authenticated USING (true);
CREATE POLICY "culture_assoc_insert_admin"   ON culture_associations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "culture_assoc_update_admin"   ON culture_associations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "culture_assoc_delete_admin"   ON culture_associations FOR DELETE TO authenticated USING (true);

-- ── culture_initiatives ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS culture_initiatives (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  image_url  text NOT NULL DEFAULT '',
  text       text NOT NULL DEFAULT '',
  published  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE culture_initiatives ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "culture_init_select_public"  ON culture_initiatives;
DROP POLICY IF EXISTS "culture_init_select_admin"   ON culture_initiatives;
DROP POLICY IF EXISTS "culture_init_insert_admin"   ON culture_initiatives;
DROP POLICY IF EXISTS "culture_init_update_admin"   ON culture_initiatives;
DROP POLICY IF EXISTS "culture_init_delete_admin"   ON culture_initiatives;
CREATE POLICY "culture_init_select_public"  ON culture_initiatives FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "culture_init_select_admin"   ON culture_initiatives FOR SELECT TO authenticated USING (true);
CREATE POLICY "culture_init_insert_admin"   ON culture_initiatives FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "culture_init_update_admin"   ON culture_initiatives FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "culture_init_delete_admin"   ON culture_initiatives FOR DELETE TO authenticated USING (true);

-- ── culture_contests ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS culture_contests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  deadline   text NOT NULL DEFAULT '',
  prize      text NOT NULL DEFAULT '',
  published  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE culture_contests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "culture_contests_select_public"  ON culture_contests;
DROP POLICY IF EXISTS "culture_contests_select_admin"   ON culture_contests;
DROP POLICY IF EXISTS "culture_contests_insert_admin"   ON culture_contests;
DROP POLICY IF EXISTS "culture_contests_update_admin"   ON culture_contests;
DROP POLICY IF EXISTS "culture_contests_delete_admin"   ON culture_contests;
CREATE POLICY "culture_contests_select_public"  ON culture_contests FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "culture_contests_select_admin"   ON culture_contests FOR SELECT TO authenticated USING (true);
CREATE POLICY "culture_contests_insert_admin"   ON culture_contests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "culture_contests_update_admin"   ON culture_contests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "culture_contests_delete_admin"   ON culture_contests FOR DELETE TO authenticated USING (true);

-- ── culture_media ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS culture_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  image_url   text NOT NULL DEFAULT '',
  type        text NOT NULL DEFAULT 'فيديو',
  media_date  text NOT NULL DEFAULT '',
  link_url    text NOT NULL DEFAULT '',
  published   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE culture_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "culture_media_select_public"  ON culture_media;
DROP POLICY IF EXISTS "culture_media_select_admin"   ON culture_media;
DROP POLICY IF EXISTS "culture_media_insert_admin"   ON culture_media;
DROP POLICY IF EXISTS "culture_media_update_admin"   ON culture_media;
DROP POLICY IF EXISTS "culture_media_delete_admin"   ON culture_media;
CREATE POLICY "culture_media_select_public"  ON culture_media FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "culture_media_select_admin"   ON culture_media FOR SELECT TO authenticated USING (true);
CREATE POLICY "culture_media_insert_admin"   ON culture_media FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "culture_media_update_admin"   ON culture_media FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "culture_media_delete_admin"   ON culture_media FOR DELETE TO authenticated USING (true);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_culture_events_order      ON culture_events(sort_order);
CREATE INDEX IF NOT EXISTS idx_culture_news_order        ON culture_news(sort_order);
CREATE INDEX IF NOT EXISTS idx_culture_artists_order     ON culture_artists(sort_order);
CREATE INDEX IF NOT EXISTS idx_culture_assoc_order       ON culture_associations(sort_order);
CREATE INDEX IF NOT EXISTS idx_culture_init_order        ON culture_initiatives(sort_order);
CREATE INDEX IF NOT EXISTS idx_culture_contests_order    ON culture_contests(sort_order);
CREATE INDEX IF NOT EXISTS idx_culture_media_order       ON culture_media(sort_order);

-- ── Seed Data ─────────────────────────────────────────────────────────────────
INSERT INTO culture_events (title, image_url, tag, event_date, location, sort_order) VALUES
  ('مهرجان التراث النيلي', '/assets/culture-event-1.jpg', 'مهرجان تراثي', '18 مايو 2025', 'المدينة القديمة - عطبرة', 0),
  ('ندوة الأدب السوداني المعاصر', '/assets/culture-event-2.jpg', 'ندوة ثقافية', '25 مايو 2025', 'مركز الثقافة - شندي', 1),
  ('معرض الفن التشكيلي السنوي', '/assets/culture-event-3.jpg', 'معرض فني', '10 يونيو 2025', 'قاعة المعارض - عطبرة', 2)
ON CONFLICT DO NOTHING;

INSERT INTO culture_news (title, image_url, excerpt, published_at, sort_order) VALUES
  ('انطلاق المهرجان الثقافي السنوي بعطبرة', '/assets/culture-hero-hq.webp', 'انطلقت فعاليات المهرجان الثقافي السنوي بمشاركة واسعة من أبناء الولاية', now() - interval '5 days', 0),
  ('تكريم شعراء ولاية نهر النيل في الملتقى الأدبي', '/assets/culture-poetry-hq.webp', 'نظّم النادي الأدبي ملتقى شعرياً حافلاً جمع نخبة من شعراء الولاية', now() - interval '10 days', 1),
  ('اكتشاف موروثات شعبية نادرة في منطقة المتمة', '/assets/culture-folk-hq.webp', 'رصد باحثون ثقافيون عدداً من الموروثات الشعبية النادرة في منطقة المتمة', now() - interval '15 days', 2),
  ('افتتاح المركز الثقافي الجديد بشندي', '/assets/culture-seminar-hq.webp', 'تم افتتاح المركز الثقافي الجديد بمدينة شندي بحضور جمهور غفير', now() - interval '20 days', 3)
ON CONFLICT DO NOTHING;

INSERT INTO culture_artists (name, image_url, role, sort_order) VALUES
  ('الشاعر محمد المهدي المجذوب', '/assets/culture-tayeb.jpg', 'شاعر وأديب سوداني', 0),
  ('الفنان محمد وردي', '/assets/culture-wardi.gif', 'موسيقار وفنان كبير', 1),
  ('الروائي الطيب صالح', '/assets/culture-taj.jpg', 'روائي سوداني عالمي', 2),
  ('الفنان أحمد المصطفى', '/assets/culture-ahmed.jpg', 'فنان تشكيلي', 3)
ON CONFLICT DO NOTHING;

INSERT INTO culture_associations (title, place, icon, sort_order) VALUES
  ('رابطة الأدباء والكتّاب', 'عطبرة', 'BookOpen', 0),
  ('الجمعية الثقافية النيلية', 'شندي', 'Landmark', 1),
  ('نادي الفنون التشكيلية', 'عطبرة', 'Palette', 2),
  ('جمعية حماية التراث', 'بربر', 'Building', 3),
  ('رابطة الفنانين والموسيقيين', 'عطبرة', 'Music', 4)
ON CONFLICT DO NOTHING;

INSERT INTO culture_initiatives (title, image_url, text, sort_order) VALUES
  ('مشروع توثيق الموروث الشعبي', '/assets/culture-folk-hq.webp', 'مبادرة لجمع وتوثيق الأمثال والحكايات الشعبية من مناطق الولاية', 0),
  ('مهرجان الفنون السنوي', '/assets/culture-gallery-hq.webp', 'مهرجان يُقام سنوياً للاحتفاء بالفنون البصرية والأدائية', 1),
  ('برنامج دعم الكتّاب الشباب', '/assets/culture-seminar-hq.webp', 'برنامج لدعم ورعاية المواهب الأدبية الشابة في الولاية', 2)
ON CONFLICT DO NOTHING;

INSERT INTO culture_contests (title, deadline, prize, sort_order) VALUES
  ('مسابقة القصيدة النيلية', 'آخر موعد: 30 مايو 2025', 'جائزة مالية + ميدالية تقدير', 0),
  ('جائزة الرواية السودانية', 'آخر موعد: 15 يونيو 2025', 'جائزة الرواية الذهبية', 1),
  ('مسابقة الفن التشكيلي', 'آخر موعد: 1 يوليو 2025', 'عرض الأعمال في معرض رسمي', 2)
ON CONFLICT DO NOTHING;

INSERT INTO culture_media (title, image_url, type, media_date, sort_order) VALUES
  ('وثائقي عن تراث نهر النيل', '/assets/culture-hero-hq.webp', 'فيديو', '10 مايو 2025', 0),
  ('حلقة: الأدب السوداني المعاصر', '/assets/culture-seminar-hq.webp', 'بودكاست', '05 مايو 2025', 1),
  ('جلسة حوارية مع فناني الولاية', '/assets/culture-gallery-hq.webp', 'فيديو', '01 مايو 2025', 2)
ON CONFLICT DO NOTHING;
