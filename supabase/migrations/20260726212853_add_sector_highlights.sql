ALTER TABLE investment_sectors
  ADD COLUMN IF NOT EXISTS highlight2 text NOT NULL DEFAULT 'ولاية نهر النيل — السودان',
  ADD COLUMN IF NOT EXISTS highlight3 text NOT NULL DEFAULT 'بيئة استثمارية آمنة';