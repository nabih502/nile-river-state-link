export type AdminSection =
  | "dashboard" | "news" | "events" | "pages" | "seo"
  | "members" | "messages" | "gallery" | "settings";

export interface NewsRow {
  id: string; title: string; slug: string; excerpt: string; body: string;
  image_url: string; category: string; published: boolean;
  published_at: string | null; created_at: string;
  seo_title: string; seo_description: string; seo_image: string;
}

export interface EventRow {
  id: string; title: string; slug: string; excerpt: string; body: string;
  image_url: string; location: string; event_date: string;
  event_end_date: string | null; published: boolean; created_at: string;
  seo_title: string; seo_description: string; seo_image: string;
}

export interface PageRow {
  id: string; title: string; page_type: string; subtitle: string;
  body: string; image_url: string; icon: string;
  published: boolean; sort_order: number; created_at: string; updated_at: string;
}

export interface SeoRow {
  id: string; page_key: string; meta_title: string; meta_description: string;
  og_image: string; keywords: string; canonical_url: string; updated_at: string;
}

export interface MemberRow {
  id: string; full_name: string; email: string; phone: string;
  national_id: string; gender: string; country: string; state: string;
  city: string; membership_type: string; status: string; created_at: string;
  member_number: string; job_title: string; specialization: string;
}

export interface MessageRow {
  id: string; name: string; email: string; phone: string;
  subject: string; message: string; read: boolean; created_at: string;
}

export interface GalleryRow {
  id: string; title: string; section: string; image_url: string;
  description: string; sort_order: number; published: boolean; created_at: string;
}

export interface Stats {
  news: number; events: number; members: number; pendingMembers: number;
  messages: number; unread: number; gallery: number; pages: number;
}
