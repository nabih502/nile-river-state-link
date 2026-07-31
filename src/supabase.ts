import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/* ── Session identity ────────────────────────────────────────────────────────
   This app does not use Supabase Auth, so the database cannot tell an
   administrator or a signed-in member from an anonymous visitor unless we send
   the session token with every request. The tokens below are opaque, issued and
   validated server-side (admin_sessions / member_sessions) and used by the
   database policies through is_admin() / current_member_id(). A forged or
   expired token simply resolves to "nobody".                                */

export const ADMIN_SESSION_KEY  = "admin_session_v2";
export const MEMBER_TOKEN_KEY   = "portal_member_token";
export const VISITOR_TOKEN_KEY  = "visitor_chat_token";

function safeGet(store: "session" | "local", k: string): string | null {
  try { return (store === "session" ? sessionStorage : localStorage).getItem(k); }
  catch { return null; }
}

function adminToken(): string | null {
  const raw = safeGet("session", ADMIN_SESSION_KEY);
  if (!raw) return null;
  try { return (JSON.parse(raw) as { token?: string }).token ?? null; } catch { return null; }
}

/** Stable per-browser token that scopes a website visitor to their own chat. */
export function visitorToken(): string {
  let t = safeGet("local", VISITOR_TOKEN_KEY);
  if (!t) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    t = Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
    try { localStorage.setItem(VISITOR_TOKEN_KEY, t); } catch { /* ignore */ }
  }
  return t;
}

const identityFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers ?? {});
  const at = adminToken();
  if (at) headers.set("x-admin-token", at);
  const mt = safeGet("session", MEMBER_TOKEN_KEY);
  if (mt) headers.set("x-member-token", mt);
  const vt = safeGet("local", VISITOR_TOKEN_KEY);
  if (vt) headers.set("x-visitor-token", vt);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(url, key, { global: { fetch: identityFetch } });

/* Chat attachments live in a private bucket, so they are reached through a
   short-lived signed link that the database only issues to the conversation's
   own member or to staff. Older rows stored a full public URL; the path is
   recovered from it so those keep working. */
export function chatAttachmentPath(stored: string): string {
  const m = stored.match(/chat-attachments\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : stored;
}

export async function signedChatAttachmentUrl(stored: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from("chat-attachments")
    .createSignedUrl(chatAttachmentPath(stored), 3600);
  return data?.signedUrl ?? null;
}

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  image_url: string;
  category: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  image_url: string;
  location: string;
  event_date: string;
  event_end_date: string | null;
  published: boolean;
  created_at: string;
};

export type Member = {
  id: string;
  full_name: string;
  national_id: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string | null;
  state: string;
  country: string;
  photo_url: string;
  membership_type: string;
  status: string;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type InvestmentSector = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  icon: string;
  highlight: string;
  highlight2: string;
  highlight3: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type InvestmentOpportunity = {
  id: string;
  title: string;
  slug: string;
  sector_id: string | null;
  description: string;
  details: string;
  image_url: string;
  min_investment: string;
  expected_return: string;
  duration: string;
  location: string;
  status: string;
  show_specs: boolean;
  published: boolean;
  created_at: string;
};

export type InvestmentIncentive = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type InvestmentSuccessStory = {
  id: string;
  name: string;
  title: string;
  story: string;
  quote: string;
  image_url: string;
  sector: string;
  location: string;
  published: boolean;
  created_at: string;
};

export type InvestmentPartner = {
  id: string;
  name: string;
  logo_url: string;
  website: string;
  description: string;
  category: string;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type InvestmentStat = {
  id: string;
  label: string;
  value: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type InvestmentInquiry = {
  id: string;
  type: string;
  reference_slug: string;
  reference_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
};

export type CultureEvent = {
  id: string;
  title: string;
  image_url: string;
  tag: string;
  event_date: string;
  location: string;
  description: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type CultureNews = {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  excerpt: string;
  body: string;
  published_at: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type CultureArtist = {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  role: string;
  bio: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type CultureAssociation = {
  id: string;
  slug: string;
  title: string;
  place: string;
  icon: string;
  description: string;
  founded_year: string;
  email: string;
  phone: string;
  members_count: string;
  image_url: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type CultureInitiative = {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  text: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type CultureContest = {
  id: string;
  title: string;
  deadline: string;
  prize: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type CultureMedia = {
  id: string;
  title: string;
  image_url: string;
  type: string;
  media_date: string;
  link_url: string;
  description: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type SocialService = {
  id: string;
  icon: string;
  title: string;
  lead: string;
  bullet_1: string;
  bullet_2: string;
  bullet_3: string;
  bullet_4: string;
  action_label: string;
  slug: string;
  full_description: string;
  image_url: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type SocialInitiative = {
  id: string;
  image_url: string;
  title: string;
  text: string;
  progress: number;
  amount: string;
  icon: string;
  action_label: string;
  slug: string;
  full_description: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type SocialStat = {
  id: string;
  value: string;
  label: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type SocialValue = {
  id: string;
  icon: string;
  title: string;
  text: string;
  published: boolean;
  sort_order: number;
  created_at: string;
};
