import { useEffect } from "react";
import { supabase } from "./supabase";

export type SeoData = {
  page_slug: string; page_label: string; page_url: string; is_dynamic: boolean;
  title: string; description: string; keywords: string; og_title: string;
  og_description: string; og_image: string; og_type: string; canonical_url: string;
  robots: string; twitter_card: string; schema_type: string;
};

const siteOrigin = "https://nahrelnile.com";
const siteName = "منصة ابناء نهر النيل حول العالم الرقمية";
const siteDescription = "المنصة الرقمية لأبناء ولاية نهر النيل في السودان والمهجر. قدّم طلب العضوية وتابع حالته، وتعرّف على خدمات التعليم والصحة والمبادرات والفرص الاستثمارية.";
const defaultImage = siteOrigin + "/og-v2.png";
const defaultImageAlt = "شعار منصة أبناء نهر النيل على خلفية من الولاية";
const siteHosts = new Set(["nahrelnile.com", "www.nahrelnile.com", "nabih502-nile-river-dsa2.bolt.host"]);
const utilityPages = new Set(["photo", "payment", "success", "membership-status"]);
const pageDefaults: Record<string, [string, string]> = {
  about: ["عن الرابطة", "تعرّف على رابطة أبناء ولاية نهر النيل ورؤيتها ورسالتها وأهدافها في السودان والمهجر."],
  services: ["خدمات المنصة", "استكشف خدمات أبناء ولاية نهر النيل في التعليم والصحة والدعم الاجتماعي والثقافة والاستثمار."],
  social: ["الخدمات الاجتماعية", "تعرّف على برامج الدعم الاجتماعي والتكافل والمبادرات الإنسانية المقدمة لأبناء ولاية نهر النيل."],
  education: ["التعليم والتدريب", "استكشف مدرسة نهر النيل الإلكترونية والدورات التدريبية والمنح والمصادر التعليمية لأبناء الولاية."],
  health: ["الخدمات الصحية", "تعرّف على خدمات الصحة والاستشارات والمبادرات الصحية لأبناء ولاية نهر النيل."],
  investment: ["الاستثمار في ولاية نهر النيل", "استكشف القطاعات والفرص الاستثمارية في ولاية نهر النيل وتعرّف على خدمات دعم المستثمرين."],
  culture: ["الثقافة والتراث", "اكتشف التراث والفنون والفعاليات الثقافية والشخصيات المبدعة في ولاية نهر النيل."],
  initiatives: ["المبادرات", "تعرّف على المبادرات التنموية والمجتمعية التي تخدم أبناء ولاية نهر النيل في الداخل والخارج."],
  library: ["المكتبة الرقمية", "تصفّح الكتب والدراسات والمقالات ومصادر التعلّم في المكتبة الرقمية لمنصة نهر النيل."],
  news: ["أخبار نهر النيل", "تابع أخبار منصة أبناء ولاية نهر النيل والمبادرات والخدمات وأخبار المجتمع."],
  events: ["فعاليات نهر النيل", "تعرّف على فعاليات أبناء ولاية نهر النيل ومواعيد اللقاءات والندوات والأنشطة المجتمعية."],
  contact: ["تواصل معنا", "تواصل مع فريق منصة أبناء ولاية نهر النيل للاستفسار عن العضوية والخدمات والمبادرات."],
  membership: ["عضوية المنصة", "تعرّف على عضوية منصة أبناء ولاية نهر النيل ومزاياها وكيفية تقديم طلب الانضمام."],
  register: ["طلب العضوية", "قدّم طلب عضوية منصة أبناء ولاية نهر النيل وتعرّف على خطوات التسجيل والمتطلبات."],
  "membership-status": ["استعلام عن العضوية", "تابع حالة طلب عضويتك في منصة أبناء ولاية نهر النيل."],
};

const cache = new Map<string, SeoData>();
let itemSeoPath: string | null = null;

function setMeta(key: string, value: string, attr = "name") {
  let element = document.head.querySelector<HTMLMetaElement>('meta[' + attr + '="' + key + '"]');
  if (!value) { element?.remove(); return; }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.append(element);
  }
  element.content = value;
}

function canonicalUrl(configured?: string) {
  let path = window.location.pathname;
  if (configured?.trim()) {
    try {
      const candidate = new URL(configured, siteOrigin);
      if (siteHosts.has(candidate.hostname)) path = candidate.pathname;
    } catch { /* Use the page URL if the saved value is invalid. */ }
  }
  path = path.replace(/\/+$|\/index\.html$/g, "") || "/";
  return siteOrigin + (path === "/home" ? "/" : path);
}

function shareImage(value?: string) {
  if (!value?.trim()) return defaultImage;
  try {
    const image = new URL(value, siteOrigin);
    if (siteHosts.has(image.hostname)) {
      if (image.pathname === "/og.png" || image.pathname === "/og-v2.png") return defaultImage;
      return siteOrigin + image.pathname + image.search;
    }
    return image.protocol === "https:" ? image.href : defaultImage;
  } catch { return defaultImage; }
}

function applyHead(values: {
  title: string; description: string; canonical: string; image: string;
  ogTitle?: string; ogDescription?: string; ogType?: string; robots?: string; twitterCard?: string;
}) {
  const socialTitle = values.ogTitle || values.title;
  const socialDescription = values.ogDescription || values.description;
  const usesDefaultImage = values.image === defaultImage;
  document.title = values.title;
  setMeta("description", values.description);
  setMeta("robots", values.robots || "index, follow");
  for (const [key, value] of Object.entries({
    title: socialTitle, description: socialDescription, url: values.canonical,
    type: values.ogType || "website", site_name: siteName, locale: "ar_SD", image: values.image,
    "image:type": usesDefaultImage ? "image/png" : "",
    "image:width": usesDefaultImage ? "1200" : "",
    "image:height": usesDefaultImage ? "630" : "",
    "image:alt": usesDefaultImage ? defaultImageAlt : "",
  })) setMeta("og:" + key, value, "property");
  for (const [key, value] of Object.entries({
    card: values.twitterCard || "summary_large_image", title: socialTitle,
    description: socialDescription, image: values.image,
    "image:alt": usesDefaultImage ? defaultImageAlt : "",
  })) setMeta("twitter:" + key, value);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = values.canonical;

  let identity = document.head.querySelector<HTMLScriptElement>("#nile-website-schema");
  if (window.location.pathname === "/") {
    if (!identity) {
      identity = document.createElement("script");
      identity.type = "application/ld+json";
      identity.id = "nile-website-schema";
      document.head.append(identity);
    }
    identity.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "WebSite", url: siteOrigin + "/",
      name: siteName, alternateName: "منصة أبناء نهر النيل", inLanguage: "ar",
    });
  } else { identity?.remove(); }
}

function applyPageSeo(slug: string, data?: SeoData) {
  const defaults = pageDefaults[slug];
  const fallbackTitle = defaults ? defaults[0] + " | منصة أبناء نهر النيل" : siteName;
  const fallbackDesc = defaults?.[1] || siteDescription;
  const oldDescription = "منصة رقمية شاملة تربط أبناء ولاية نهر النيل في الداخل والخارج";
  const freshCopy = (value?: string) => {
    const text = value?.trim();
    return slug === "home" && text?.replace(/\.$/, "") === oldDescription ? "" : text;
  };
  const title = slug === "home" ? siteName : data?.title?.trim() || fallbackTitle;
  const description = freshCopy(data?.description) || fallbackDesc;
  applyHead({
    title, description, canonical: canonicalUrl(slug === "home" ? undefined : data?.canonical_url),
    image: shareImage(data?.og_image), ogType: data?.og_type,
    ogTitle: slug === "home" ? siteName : data?.og_title?.trim(),
    ogDescription: freshCopy(data?.og_description), twitterCard: data?.twitter_card,
    robots: utilityPages.has(slug) ? "noindex, follow" : data?.robots,
  });
}

export function useSeo(slug: string) {
  const pathname = window.location.pathname;
  useEffect(() => {
    let current = true;
    const saved = cache.get(slug);
    if (itemSeoPath !== pathname) applyPageSeo(slug, saved);
    if (!saved) {
      supabase.from("page_seo").select("*").eq("page_slug", slug).maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          const seo = data as SeoData;
          cache.set(slug, seo);
          if (current && window.location.pathname === pathname && itemSeoPath !== pathname) {
            applyPageSeo(slug, seo);
          }
        });
    }
    return () => {
      current = false;
      if (window.location.pathname !== pathname && itemSeoPath === pathname) itemSeoPath = null;
    };
  }, [slug, pathname]);
}

export function invalidateSeoCache(slug: string) { cache.delete(slug); }

export function applyItemSeo(opts: {
  title: string; fallbackTitle?: string; description: string; fallbackDescription?: string;
  image: string; fallbackImage?: string; canonical?: string;
}) {
  itemSeoPath = window.location.pathname;
  applyHead({
    title: opts.title || opts.fallbackTitle || siteName,
    description: opts.description || opts.fallbackDescription || siteDescription,
    image: shareImage(opts.image || opts.fallbackImage),
    canonical: canonicalUrl(opts.canonical), ogType: "article",
  });
}
