/*
# إنشاء جداول الاستثمار

## الوصف
إضافة 6 جداول جديدة لقسم الاستثمار في الموقع، مع بيانات أولية مأخوذة من المحتوى الثابت الموجود.

## الجداول الجديدة

1. `investment_sectors` — القطاعات الاستثمارية (الزراعة، التعدين، الصناعة، إلخ)
2. `investment_opportunities` — الفرص الاستثمارية المتاحة
3. `investment_incentives` — الحوافز والتسهيلات التي تقدمها الولاية
4. `investment_success_stories` — قصص نجاح المستثمرين
5. `investment_partners` — الشركاء والجهات المرتبطة
6. `investment_stats` — إحصاءات قطاع الاستثمار

## الأمان
- RLS مفعّل على جميع الجداول
- القراءة متاحة للجميع (anon + authenticated)
- الكتابة/التعديل/الحذف للمصادقين فقط (لوحة التحكم)
*/

-- =====================
-- INVESTMENT SECTORS
-- =====================
CREATE TABLE IF NOT EXISTS investment_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  highlight text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_sectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sectors_select_public" ON investment_sectors;
CREATE POLICY "sectors_select_public" ON investment_sectors FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "sectors_insert_admin" ON investment_sectors;
CREATE POLICY "sectors_insert_admin" ON investment_sectors FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sectors_update_admin" ON investment_sectors;
CREATE POLICY "sectors_update_admin" ON investment_sectors FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sectors_delete_admin" ON investment_sectors;
CREATE POLICY "sectors_delete_admin" ON investment_sectors FOR DELETE
TO authenticated USING (true);

-- =====================
-- INVESTMENT OPPORTUNITIES
-- =====================
CREATE TABLE IF NOT EXISTS investment_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  sector_id uuid REFERENCES investment_sectors(id) ON DELETE SET NULL,
  description text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  min_investment text NOT NULL DEFAULT '',
  expected_return text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'available',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "opps_select_public" ON investment_opportunities;
CREATE POLICY "opps_select_public" ON investment_opportunities FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "opps_insert_admin" ON investment_opportunities;
CREATE POLICY "opps_insert_admin" ON investment_opportunities FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "opps_update_admin" ON investment_opportunities;
CREATE POLICY "opps_update_admin" ON investment_opportunities FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "opps_delete_admin" ON investment_opportunities;
CREATE POLICY "opps_delete_admin" ON investment_opportunities FOR DELETE
TO authenticated USING (true);

-- =====================
-- INVESTMENT INCENTIVES
-- =====================
CREATE TABLE IF NOT EXISTS investment_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_incentives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "incentives_select_public" ON investment_incentives;
CREATE POLICY "incentives_select_public" ON investment_incentives FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "incentives_insert_admin" ON investment_incentives;
CREATE POLICY "incentives_insert_admin" ON investment_incentives FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "incentives_update_admin" ON investment_incentives;
CREATE POLICY "incentives_update_admin" ON investment_incentives FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "incentives_delete_admin" ON investment_incentives;
CREATE POLICY "incentives_delete_admin" ON investment_incentives FOR DELETE
TO authenticated USING (true);

-- =====================
-- INVESTMENT SUCCESS STORIES
-- =====================
CREATE TABLE IF NOT EXISTS investment_success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  story text NOT NULL DEFAULT '',
  quote text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_success_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stories_select_public" ON investment_success_stories;
CREATE POLICY "stories_select_public" ON investment_success_stories FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "stories_insert_admin" ON investment_success_stories;
CREATE POLICY "stories_insert_admin" ON investment_success_stories FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "stories_update_admin" ON investment_success_stories;
CREATE POLICY "stories_update_admin" ON investment_success_stories FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "stories_delete_admin" ON investment_success_stories;
CREATE POLICY "stories_delete_admin" ON investment_success_stories FOR DELETE
TO authenticated USING (true);

-- =====================
-- INVESTMENT PARTNERS
-- =====================
CREATE TABLE IF NOT EXISTS investment_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'local',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partners_select_public" ON investment_partners;
CREATE POLICY "partners_select_public" ON investment_partners FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "partners_insert_admin" ON investment_partners;
CREATE POLICY "partners_insert_admin" ON investment_partners FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "partners_update_admin" ON investment_partners;
CREATE POLICY "partners_update_admin" ON investment_partners FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "partners_delete_admin" ON investment_partners;
CREATE POLICY "partners_delete_admin" ON investment_partners FOR DELETE
TO authenticated USING (true);

-- =====================
-- INVESTMENT STATS
-- =====================
CREATE TABLE IF NOT EXISTS investment_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  icon text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investment_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stats_select_public" ON investment_stats;
CREATE POLICY "stats_select_public" ON investment_stats FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "stats_insert_admin" ON investment_stats;
CREATE POLICY "stats_insert_admin" ON investment_stats FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "stats_update_admin" ON investment_stats;
CREATE POLICY "stats_update_admin" ON investment_stats FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "stats_delete_admin" ON investment_stats;
CREATE POLICY "stats_delete_admin" ON investment_stats FOR DELETE
TO authenticated USING (true);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_sectors_slug ON investment_sectors(slug);
CREATE INDEX IF NOT EXISTS idx_sectors_order ON investment_sectors(sort_order);
CREATE INDEX IF NOT EXISTS idx_opps_sector ON investment_opportunities(sector_id);
CREATE INDEX IF NOT EXISTS idx_opps_slug ON investment_opportunities(slug);
CREATE INDEX IF NOT EXISTS idx_opps_status ON investment_opportunities(status, published);
CREATE INDEX IF NOT EXISTS idx_incentives_order ON investment_incentives(sort_order);
CREATE INDEX IF NOT EXISTS idx_partners_order ON investment_partners(sort_order);
CREATE INDEX IF NOT EXISTS idx_stats_order ON investment_stats(sort_order);

-- =====================
-- SEED DATA — SECTORS
-- =====================
INSERT INTO investment_sectors (name, slug, description, image_url, icon, highlight, sort_order) VALUES
(
  'الزراعة والثروة الحيوانية',
  'agriculture',
  'تمتلك ولاية نهر النيل أراضي زراعية خصبة على ضفاف نهر النيل تمتد لمئات الكيلومترات، مع توافر المياه العذبة على مدار العام. تُعدّ الولاية من أهم المناطق الزراعية في السودان وتنتج مجموعة واسعة من المحاصيل الاستراتيجية.',
  '/assets/invest-livestock-hq.webp',
  'Wheat',
  'أكثر من 500,000 فدان صالح للزراعة',
  1
),
(
  'التعدين والموارد الطبيعية',
  'mining',
  'تزخر ولاية نهر النيل بثروات معدنية هائلة تشمل الذهب والرخام والجرانيت والأحجار الكريمة، مما يجعلها وجهة مثالية للاستثمار في قطاع التعدين. تمتلك الولاية بنية تحتية داعمة وموارد بشرية متخصصة.',
  '/assets/invest-mining-hq.webp',
  'Mountain',
  'احتياطيات ذهبية موثّقة تزيد عن 300 طن',
  2
),
(
  'الصناعة والتصنيع',
  'industry',
  'توفر ولاية نهر النيل بيئة صناعية متكاملة مع وجود مناطق صناعية مجهزة وبنية تحتية داعمة. تتوفر المواد الخام المحلية والعمالة الماهرة والأسواق الإقليمية، مما يجعلها خياراً استثمارياً متميزاً.',
  '/assets/invest-industry-hq.webp',
  'Factory',
  'مناطق صناعية مخصصة بمساحة 2000 فدان',
  3
),
(
  'السياحة والتراث',
  'tourism',
  'تحتضن ولاية نهر النيل إرثاً حضارياً فريداً يمتد لآلاف السنين، مع مواقع أثرية نوبية ومروية لا مثيل لها. المناخ المعتدل والطبيعة الخلابة تجعلها وجهة سياحية استثنائية.',
  '/assets/invest-tourism-hq.webp',
  'Landmark',
  'أكثر من 200 موقع أثري مسجّل',
  4
),
(
  'الطاقة المتجددة',
  'energy',
  'تتمتع ولاية نهر النيل بإمكانات ضخمة في مجال الطاقة الشمسية بفضل معدلات الإشعاع الشمسي المرتفعة، إضافة إلى إمكانات الطاقة المائية على نهر النيل. قطاع واعد للاستثمار المستدام.',
  '/assets/investment-solar-hq.webp',
  'Sun',
  'معدل إشعاع شمسي يتجاوز 2,500 ساعة سنوياً',
  5
)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- SEED DATA — OPPORTUNITIES
-- =====================
INSERT INTO investment_opportunities (title, slug, description, image_url, min_investment, expected_return, duration, location, status) VALUES
(
  'مشروع زراعة وإنتاج التمور',
  'dates-farming',
  'فرصة استثمارية متميزة في زراعة وإنتاج وتصدير التمور باستخدام أصناف عالية الجودة مناسبة لمنطقة وادي النيل.',
  '/assets/investment-orange-orchard.jpg',
  '50,000 دولار',
  '25-30%',
  '3-5 سنوات',
  'بربر — ولاية نهر النيل',
  'available'
),
(
  'استخراج وتصنيع الذهب',
  'gold-mining',
  'استثمار في استخراج الذهب من المواقع الموثّقة ضمن نطاق الامتيازات المعتمدة، مع إمكانية تصنيع المجوهرات للتصدير.',
  '/assets/invest-mining-hq.webp',
  '500,000 دولار',
  '35-45%',
  '5-7 سنوات',
  'أبو حمد — ولاية نهر النيل',
  'available'
),
(
  'منتجع سياحي على ضفة النيل',
  'nile-resort',
  'إنشاء منتجع سياحي متكامل على ضفاف نهر النيل بالقرب من المواقع الأثرية النوبية، يستهدف السياحة الأثرية والطبيعية.',
  '/assets/invest-tourism-hq.webp',
  '1,000,000 دولار',
  '20-28%',
  '5-8 سنوات',
  'الدامر — ولاية نهر النيل',
  'available'
),
(
  'مزرعة ألبان متكاملة',
  'dairy-farm',
  'إنشاء مزرعة ألبان حديثة بتقنيات عالمية لإنتاج الحليب ومشتقاته وتوريدها لمصانع الألبان المحلية والإقليمية.',
  '/assets/investment-poultry.jpg',
  '200,000 دولار',
  '20-25%',
  '3-4 سنوات',
  'شندي — ولاية نهر النيل',
  'available'
),
(
  'محطة طاقة شمسية',
  'solar-plant',
  'إنشاء محطة طاقة شمسية بقدرة 10 ميجاواط لتوليد الكهرباء وبيعها للشبكة الوطنية ضمن عقود موثّقة مع الحكومة.',
  '/assets/investment-solar-hq.webp',
  '2,000,000 دولار',
  '15-20%',
  '20-25 سنة',
  'ولاية نهر النيل',
  'available'
)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- SEED DATA — INCENTIVES
-- =====================
INSERT INTO investment_incentives (title, description, icon, category, sort_order) VALUES
('إعفاء ضريبي لمدة 10 سنوات', 'المشاريع الجديدة في القطاعات ذات الأولوية تحظى بإعفاء كامل من ضريبة الأرباح لمدة عشر سنوات من بدء التشغيل.', 'BadgePercent', 'tax', 1),
('تخصيص أراضٍ بأسعار تفضيلية', 'تخصيص أراضٍ للمشاريع الاستثمارية بأسعار تفضيلية مدعومة مع تسهيل إجراءات التسجيل والترخيص.', 'MapPin', 'land', 2),
('دعم البنية التحتية', 'تتكفل الحكومة بمد الطرق والكهرباء والمياه حتى بوابة المشروع لتخفيض تكاليف الإنشاء الأولية.', 'Zap', 'infrastructure', 3),
('نافذة واحدة للتراخيص', 'خدمة النافذة الواحدة تُنهي جميع الإجراءات الحكومية للمستثمر في مكان واحد خلال 30 يوماً.', 'FileCheck', 'admin', 4),
('ضمانات حكومية للتمويل', 'توفير ضمانات حكومية للمستثمرين لتسهيل الحصول على التمويل من البنوك والمؤسسات المالية.', 'Shield', 'finance', 5),
('حرية تحويل الأرباح', 'ضمان حق المستثمر الأجنبي في تحويل أرباحه ورأس ماله بحرية تامة دون قيود.', 'ArrowLeftRight', 'finance', 6)
ON CONFLICT DO NOTHING;

-- =====================
-- SEED DATA — SUCCESS STORIES
-- =====================
INSERT INTO investment_success_stories (name, title, story, quote, image_url, sector, location) VALUES
(
  'المهندس أحمد محمد علي',
  'رائد في صناعة الرخام',
  'بدأ المهندس أحمد مشروعه في استخراج وتصنيع الرخام عام 2018 بولاية نهر النيل، واليوم يصدر منتجاته إلى دول الخليج وأوروبا ويوظف أكثر من 120 شخصاً من أبناء الولاية.',
  'وجدت في ولاية نهر النيل كل ما يحتاجه المستثمر: الموارد الطبيعية والدعم الحكومي والأيدي العاملة المخلصة.',
  '/assets/culture-ahmed.jpg',
  'التعدين والصناعة',
  'أبو حمد'
),
(
  'الدكتورة فاطمة عثمان',
  'نموذج في الاستثمار الزراعي',
  'أسست الدكتورة فاطمة مزرعة نخيل متكاملة على مساحة 500 فدان، وطورت سلسلة إنتاج كاملة من الزراعة وحتى التعبئة والتصدير، محققة عوائد استثنائية وخلق فرص عمل للمجتمع المحلي.',
  'الاستثمار في الزراعة بولاية نهر النيل ليس فقط مربحاً، بل هو مساهمة حقيقية في تنمية الوطن.',
  '/assets/culture-event-1.jpg',
  'الزراعة',
  'بربر'
)
ON CONFLICT DO NOTHING;

-- =====================
-- SEED DATA — PARTNERS
-- =====================
INSERT INTO investment_partners (name, logo_url, description, category, sort_order) VALUES
('هيئة الاستثمار السودانية', '', 'الجهة الحكومية المنوط بها تنظيم وتشجيع الاستثمار في السودان.', 'government', 1),
('بنك السودان المركزي', '', 'يوفر التسهيلات المصرفية والضمانات المالية للمشاريع الاستثمارية.', 'financial', 2),
('غرفة تجارة ولاية نهر النيل', '', 'تمثل مصالح القطاع الخاص وتيسر إجراءات ممارسة الأعمال بالولاية.', 'local', 3),
('برنامج الأمم المتحدة الإنمائي', '', 'شريك في دعم مشاريع التنمية المستدامة وتمويل المشاريع الصغيرة.', 'international', 4)
ON CONFLICT DO NOTHING;

-- =====================
-- SEED DATA — STATS
-- =====================
INSERT INTO investment_stats (label, value, icon, sort_order) VALUES
('مشاريع مسجّلة', '+350', 'Briefcase', 1),
('إجمالي الاستثمارات', '+500M$', 'TrendingUp', 2),
('فرص عمل', '+12,000', 'Users', 3),
('قطاعات استثمارية', '5', 'LayoutGrid', 4)
ON CONFLICT DO NOTHING;
