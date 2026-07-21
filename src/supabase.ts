import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

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
