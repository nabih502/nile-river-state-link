import { useEffect } from "react";
import { supabase } from "./supabase";

export type SeoData = {
  page_slug: string;
  page_label: string;
  page_url: string;
  is_dynamic: boolean;
  title: string;
  description: string;
  keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: string;
  canonical_url: string;
  robots: string;
  twitter_card: string;
  schema_type: string;
};

// Module-level cache so each slug is fetched only once per session
const cache = new Map<string, SeoData>();

function setMeta(nameAttr: string, content: string, attr = "name") {
  if (!content) return;
  let el = document.querySelector(
    `meta[${attr}="${nameAttr}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, nameAttr);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector(
    `link[rel="${rel}"]`
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  (el as HTMLLinkElement).href = href;
}

function applyToHead(data: SeoData) {
  const title = data.title || "رابطة ولاية نهر النيل";
  const description = data.description || "";
  const ogTitle = data.og_title || title;
  const ogDesc = data.og_description || description;
  const ogImage = data.og_image || "/og.png";
  const canonical =
    data.canonical_url ||
    (typeof window !== "undefined"
      ? window.location.origin + window.location.pathname
      : "");

  document.title = title;

  // Standard
  setMeta("description", description);
  setMeta("keywords", data.keywords);
  setMeta("robots", data.robots || "index, follow");

  // Open Graph
  setMeta("og:title", ogTitle, "property");
  setMeta("og:description", ogDesc, "property");
  setMeta("og:image", ogImage, "property");
  setMeta("og:type", data.og_type || "website", "property");
  setMeta("og:url", canonical, "property");
  setMeta("og:locale", "ar_SA", "property");
  setMeta("og:site_name", "رابطة ولاية نهر النيل", "property");

  // Twitter / X
  setMeta("twitter:card", data.twitter_card || "summary_large_image");
  setMeta("twitter:title", ogTitle);
  setMeta("twitter:description", ogDesc);
  setMeta("twitter:image", ogImage);

  // Canonical
  setLink("canonical", canonical);
}

export function useSeo(slug: string) {
  useEffect(() => {
    const cached = cache.get(slug);
    if (cached) {
      applyToHead(cached);
      return;
    }
    supabase
      .from("page_seo")
      .select("*")
      .eq("page_slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          cache.set(slug, data as SeoData);
          applyToHead(data as SeoData);
        }
      });
  }, [slug]);
}

// Called after admin saves to invalidate cache
export function invalidateSeoCache(slug: string) {
  cache.delete(slug);
}
