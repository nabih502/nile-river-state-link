/*
# إضافة حقول صفحة التفصيل للمبادرات الاجتماعية

## الملخص
تضيف هذه الهجرة حقلين إلى جدول `social_initiatives` لدعم صفحات التفاصيل الكاملة:

1. التعديلات
   - `social_initiatives`: 
     - `slug` (text) — معرّف URL فريد لصفحة التفصيل
     - `full_description` (text) — وصف تفصيلي كامل يظهر في صفحة المبادرة

2. ملاحظات
   - الحقول اختيارية (DEFAULT فارغ) لعدم تأثيرها على البيانات الحالية
   - يُولَّد الـ slug تلقائياً من العنوان في لوحة التحكم إذا تُرك فارغاً
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='social_initiatives' AND column_name='slug'
  ) THEN
    ALTER TABLE social_initiatives ADD COLUMN slug text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='social_initiatives' AND column_name='full_description'
  ) THEN
    ALTER TABLE social_initiatives ADD COLUMN full_description text NOT NULL DEFAULT '';
  END IF;
END $$;

UPDATE social_initiatives SET slug = CASE
  WHEN title = 'صندوق العلاج'              THEN 'sandooq-elaj'
  WHEN title = 'مشروع ترميم المنازل'       THEN 'tarmeem-manazil'
  WHEN title = 'دعم التعليم'               THEN 'daem-taleem'
  WHEN title = 'سلة الخير الرمضانية'       THEN 'salat-khair'
  ELSE 'initiative-' || substr(id::text, 1, 8)
END
WHERE slug = '';
