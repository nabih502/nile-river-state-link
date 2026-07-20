# رابطة ولاية نهر النيل الرقمية

منصة رقمية شاملة تربط أبناء ولاية نهر النيل في الداخل والخارج.

## المتطلبات

- Node.js `>=22.13.0`

## التشغيل

```bash
npm install
npm run dev
npm run build
npm test
```

## البنية

- `index.html` — نقطة دخول Vite
- `src/main.tsx` — تهيئة React والتوجيه من جانب العميل
- `src/site.tsx` — مكوّن الموقع الكامل وكل الصفحات
- `src/globals.css` — الأنماط العامة (Tailwind + أنماط مخصصة)
- `public/assets/` — الصور والموارد الثابتة
