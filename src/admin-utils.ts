export function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

export function slugify(text: string) {
  return text.trim().replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "").toLowerCase() || Date.now().toString();
}

export function charCount(s: string) { return s.length; }

export const NEWS_CATS = ["عام", "تعليم", "صحة", "اجتماعي", "استثمار", "ثقافة", "فعالية", "إعلان"];

export const GALLERY_SECTIONS = ["عام", "فعاليات", "ثقافة", "تعليم", "صحة", "استثمار", "اجتماعي", "رئيسية"];

export const PAGE_TYPES = [
  { key: "home", label: "الرئيسية" }, { key: "about", label: "عن الرابطة" },
  { key: "education", label: "التعليم" }, { key: "health", label: "الصحة" },
  { key: "investment", label: "الاستثمار" }, { key: "culture", label: "الثقافة" },
  { key: "social", label: "الخدمات الاجتماعية" }, { key: "membership", label: "العضوية" },
  { key: "contact", label: "تواصل معنا" }, { key: "custom", label: "مخصصة" },
];

export const SEO_PAGES = [
  "home", "about", "education", "health", "investment",
  "culture", "social", "membership", "contact",
];
