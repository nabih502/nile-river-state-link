/*
# إضافة حقول صفحة التفصيل للخدمات الاجتماعية

1. التعديلات على جدول social_services
   - slug: رابط URL فريد لصفحة الخدمة
   - full_description: وصف تفصيلي كامل للخدمة
   - image_url: صورة الخدمة

2. تحديث السجلات الحالية بـ slugs مناسبة
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_services' AND column_name='slug') THEN
    ALTER TABLE social_services ADD COLUMN slug text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_services' AND column_name='full_description') THEN
    ALTER TABLE social_services ADD COLUMN full_description text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_services' AND column_name='image_url') THEN
    ALTER TABLE social_services ADD COLUMN image_url text NOT NULL DEFAULT '';
  END IF;
END $$;

UPDATE social_services SET slug = CASE
  WHEN title = 'دعم المحتاجين'       THEN 'daem-mohtajeen'
  WHEN title = 'برامج ومبادرات'      THEN 'baramij-mubadarat'
  WHEN title = 'استشارة اجتماعية'    THEN 'istishara-ijtimaia'
  WHEN title = 'حالات إنسانية'       THEN 'halat-insania'
  WHEN title = 'تواصل مباشر'         THEN 'tawasl-mubashir'
  ELSE 'service-' || substr(id::text, 1, 8)
END
WHERE slug = '';
