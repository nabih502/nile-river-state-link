/*
# إنشاء جداول الخدمات الاجتماعية

1. الجداول الجديدة
   - `social_services`: بطاقات الخدمات الاجتماعية (5 خدمات) — العنوان، النص التعريفي، الأيقونة، 4 نقاط تفصيلية، زر الإجراء
   - `social_initiatives`: بطاقات المبادرات والمشاريع (4 مشاريع) — الصورة، العنوان، الوصف، نسبة الإنجاز، المبلغ المستهدف
   - `social_stats`: أرقام الأثر الاجتماعي (6 إحصائيات) — القيمة، التسمية، الأيقونة
   - `social_values`: بطاقات القيم المؤسسية (5 قيم) — الأيقونة، العنوان، النص

2. الأمان
   - RLS مفعّل على جميع الجداول
   - سياسات قراءة عامة للزوار (anon + authenticated)
   - سياسات كتابة/تعديل/حذف للمديرين (anon + authenticated لأن لوحة التحكم تستخدم مفتاح anon)
*/

-- ─── social_services ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon        text NOT NULL DEFAULT 'HeartHandshake',
  title       text NOT NULL DEFAULT '',
  lead        text NOT NULL DEFAULT '',
  bullet_1    text NOT NULL DEFAULT '',
  bullet_2    text NOT NULL DEFAULT '',
  bullet_3    text NOT NULL DEFAULT '',
  bullet_4    text NOT NULL DEFAULT '',
  action_label text NOT NULL DEFAULT 'تواصل معنا',
  published   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE social_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ss_select" ON social_services;
CREATE POLICY "ss_select" ON social_services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "ss_insert" ON social_services;
CREATE POLICY "ss_insert" ON social_services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ss_update" ON social_services;
CREATE POLICY "ss_update" ON social_services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ss_delete" ON social_services;
CREATE POLICY "ss_delete" ON social_services FOR DELETE TO anon, authenticated USING (true);

-- ─── social_initiatives ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_initiatives (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url    text NOT NULL DEFAULT '',
  title        text NOT NULL DEFAULT '',
  text         text NOT NULL DEFAULT '',
  progress     integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  amount       text NOT NULL DEFAULT '',
  icon         text NOT NULL DEFAULT '♡',
  action_label text NOT NULL DEFAULT 'ساهم الآن',
  published    boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE social_initiatives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "si_select" ON social_initiatives;
CREATE POLICY "si_select" ON social_initiatives FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "si_insert" ON social_initiatives;
CREATE POLICY "si_insert" ON social_initiatives FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "si_update" ON social_initiatives;
CREATE POLICY "si_update" ON social_initiatives FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "si_delete" ON social_initiatives;
CREATE POLICY "si_delete" ON social_initiatives FOR DELETE TO anon, authenticated USING (true);

-- ─── social_stats ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_stats (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value      text NOT NULL DEFAULT '',
  label      text NOT NULL DEFAULT '',
  icon       text NOT NULL DEFAULT 'UsersRound',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE social_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sst_select" ON social_stats;
CREATE POLICY "sst_select" ON social_stats FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sst_insert" ON social_stats;
CREATE POLICY "sst_insert" ON social_stats FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sst_update" ON social_stats;
CREATE POLICY "sst_update" ON social_stats FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sst_delete" ON social_stats;
CREATE POLICY "sst_delete" ON social_stats FOR DELETE TO anon, authenticated USING (true);

-- ─── social_values ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_values (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon       text NOT NULL DEFAULT 'HandHeart',
  title      text NOT NULL DEFAULT '',
  text       text NOT NULL DEFAULT '',
  published  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE social_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sv_select" ON social_values;
CREATE POLICY "sv_select" ON social_values FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sv_insert" ON social_values;
CREATE POLICY "sv_insert" ON social_values FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sv_update" ON social_values;
CREATE POLICY "sv_update" ON social_values FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sv_delete" ON social_values;
CREATE POLICY "sv_delete" ON social_values FOR DELETE TO anon, authenticated USING (true);
