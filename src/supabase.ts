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

export type InvestmentSector = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  icon: string;
  highlight: string;
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
