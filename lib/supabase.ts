import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Company = {
  id: string;
  name: string;
  country: string;
  founded_year: number;
  description: string;
  website: string;
  logo_url: string;
  created_at: string;
};

export type Model = {
  id: string;
  name: string;
  company_id: string;
  company?: Company;
  description: string;
  use_cases: string[];
  pricing_type: string;
  pricing_detail: string;
  context_window: string;
  benchmark_score: number;
  official_url: string;
  launched_at: string;
  created_at: string;
  is_featured: boolean;
};

export type News = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  published_at: string;
  created_at: string;
  is_featured: boolean;
};

export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  example: string;
  category: string;
};

export type Rating = {
  id: string;
  model_id: string;
  user_id: string;
  rating: number;
  has_used: boolean;
  created_at: string;
};
