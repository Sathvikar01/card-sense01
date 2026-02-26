-- Canonical CardSense schema.
-- This file reflects the column contract expected by application code and src/types/database.ts.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  city text,
  annual_income integer check (annual_income >= 0),
  employment_type text,
  employer_name text,
  primary_bank text,
  has_fixed_deposit boolean default false,
  fd_amount integer check (fd_amount >= 0),
  credit_score integer check (credit_score between 300 and 900),
  credit_score_date timestamptz,
  existing_card_ids uuid[] default array[]::uuid[],
  preferred_spending_categories text[] default array[]::text[],
  financial_goals text[] default array[]::text[],
  is_beginner boolean default true,
  onboarding_completed boolean default false,
  income_range text,
  cibil_score integer,
  existing_cards jsonb default '[]'::jsonb,
  fixed_deposits jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  card_name text not null,
  card_network text not null,
  card_type text not null,
  card_variant text,
  image_url text,
  joining_fee integer not null default 0 check (joining_fee >= 0),
  annual_fee integer not null default 0 check (annual_fee >= 0),
  annual_fee_waiver_spend integer check (annual_fee_waiver_spend >= 0),
  renewal_fee integer check (renewal_fee >= 0),
  min_income_salaried integer check (min_income_salaried >= 0),
  min_income_self_employed integer check (min_income_self_employed >= 0),
  min_income_required integer check (min_income_required >= 0),
  min_cibil_score integer check (min_cibil_score between 300 and 900),
  min_credit_score integer check (min_credit_score between 300 and 900),
  min_age integer check (min_age >= 18),
  max_age integer check (max_age >= min_age),
  requires_itr boolean default false,
  requires_existing_relationship boolean default false,
  reward_rate_default numeric(10, 4),
  reward_rate_categories jsonb default '{}'::jsonb,
  reward_structure jsonb default '{}'::jsonb,
  welcome_benefits jsonb default '{}'::jsonb,
  milestone_benefits jsonb default '{}'::jsonb,
  lounge_access text,
  lounge_access_details text,
  lounge_visits_per_quarter integer,
  fuel_surcharge_waiver boolean default false,
  fuel_surcharge_waiver_cap integer,
  movie_benefits text,
  dining_benefits text,
  travel_insurance_cover integer,
  purchase_protection_cover integer,
  golf_access boolean default false,
  concierge_service boolean default false,
  forex_markup numeric(8, 4),
  foreign_markup_fee numeric(8, 4),
  emi_conversion_available boolean default true,
  description text,
  pros text[] default array[]::text[],
  cons text[] default array[]::text[],
  best_for text[] default array[]::text[],
  apply_url text,
  application_url text,
  is_active boolean not null default true,
  popularity_score integer default 0 check (popularity_score between 0 and 100),
  bank text,
  network text,
  first_year_fee integer,
  fee_waiver_condition text,
  min_income integer,
  eligible_employment_types text[] default array[]::text[],
  reward_point_value numeric(10, 4),
  benefits text[] default array[]::text[],
  card_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recommendation_type text,
  flow_type text,
  input_snapshot jsonb default '{}'::jsonb,
  input_data jsonb default '{}'::jsonb,
  recommended_cards jsonb not null default '[]'::jsonb,
  ai_analysis_text text,
  ai_analysis text,
  application_guide jsonb,
  portfolio_strategy text,
  spending_analysis jsonb,
  spending_optimization_tips jsonb default '[]'::jsonb,
  model_used text,
  ai_model_used text,
  processing_time_ms integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_name text not null,
  bank_name text not null,
  card_type text not null default 'credit',
  last_four_digits text,
  notes text,
  is_active boolean not null default true,
  added_at timestamptz not null default now(),
  removed_at timestamptz
);

create table if not exists public.user_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  page text,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  session_id text,
  occurred_at timestamptz not null default now()
);

create table if not exists public.spending_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  category text not null,
  merchant text,
  merchant_name text,
  card_used uuid references public.credit_cards(id) on delete set null,
  credit_card_id uuid references public.credit_cards(id) on delete set null,
  transaction_date date not null default current_date,
  source text not null default 'manual',
  notes text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create table if not exists public.uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  file_path text not null,
  file_size integer check (file_size >= 0),
  file_size_bytes integer check (file_size_bytes >= 0),
  mime_type text,
  parsed_data jsonb default '{}'::jsonb,
  parsing_status text not null default 'pending',
  parsing_error text,
  parsed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create table if not exists public.credit_score_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  credit_score integer check (credit_score between 300 and 900),
  score integer check (score between 300 and 900),
  score_date date not null,
  score_source text,
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now(),
  unique (user_id, score_date)
);

create table if not exists public.education_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  summary text,
  content text not null,
  category text not null,
  difficulty text not null default 'beginner',
  read_time_minutes integer default 1 check (read_time_minutes > 0),
  reading_time_minutes integer check (reading_time_minutes > 0),
  featured boolean default false,
  tags text[] default array[]::text[],
  author text default 'CardSense Team',
  is_published boolean default true,
  view_count integer default 0 check (view_count >= 0),
  published_at timestamptz,
  featured_image_url text,
  meta_description text,
  meta_keywords text[] default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_city on public.profiles(city);
create index if not exists idx_profiles_credit_score on public.profiles(credit_score);
create index if not exists idx_profiles_created_at on public.profiles(created_at);

create index if not exists idx_credit_cards_active_popularity on public.credit_cards(is_active, popularity_score desc);
create index if not exists idx_credit_cards_active_filters on public.credit_cards(is_active, bank_name, card_type, annual_fee);
create index if not exists idx_credit_cards_search_trgm
  on public.credit_cards
  using gin ((coalesce(card_name, '') || ' ' || coalesce(bank_name, '') || ' ' || coalesce(description, '')) gin_trgm_ops);

create index if not exists idx_recommendations_user_created on public.recommendations(user_id, created_at desc);
create index if not exists idx_user_cards_user_added on public.user_cards(user_id, added_at desc);
create index if not exists idx_user_cards_active on public.user_cards(user_id, is_active);
create unique index if not exists idx_user_cards_unique_active
  on public.user_cards(user_id, lower(card_name), lower(bank_name))
  where is_active = true;

create index if not exists idx_user_interactions_user_occurred on public.user_interactions(user_id, occurred_at desc);
create index if not exists idx_user_interactions_event_occurred on public.user_interactions(event_type, occurred_at desc);
create index if not exists idx_spending_transactions_user_date on public.spending_transactions(user_id, transaction_date desc);
create index if not exists idx_spending_category on public.spending_transactions(category);
create index if not exists idx_documents_user on public.uploaded_documents(user_id);
create index if not exists idx_score_history_user on public.credit_score_history(user_id, score_date desc);
create index if not exists idx_education_articles_publish_category_views
  on public.education_articles(is_published, category, view_count desc);
create index if not exists idx_education_articles_slug on public.education_articles(slug);
