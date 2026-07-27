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
