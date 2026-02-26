-- 010_schema_alignment.sql
-- Purpose:
-- 1) Resolve schema drift between historical migrations and application code.
-- 2) Preserve existing data while adding canonical columns expected by runtime queries.
-- 3) Keep legacy compatibility columns so fallback code continues to work.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
alter table if exists public.profiles
  add column if not exists annual_income integer,
  add column if not exists employer_name text,
  add column if not exists credit_score integer,
  add column if not exists credit_score_date timestamptz,
  add column if not exists has_fixed_deposit boolean default false,
  add column if not exists fd_amount integer,
  add column if not exists existing_card_ids uuid[] default array[]::uuid[],
  add column if not exists preferred_spending_categories text[] default array[]::text[],
  add column if not exists financial_goals text[] default array[]::text[],
  add column if not exists is_beginner boolean default true,
  add column if not exists onboarding_completed boolean default false,
  add column if not exists income_range text,
  add column if not exists cibil_score integer,
  add column if not exists existing_cards jsonb default '[]'::jsonb,
  add column if not exists fixed_deposits jsonb default '[]'::jsonb,
  add column if not exists updated_at timestamptz default now();

alter table if exists public.profiles drop constraint if exists profiles_employment_type_check;
alter table if exists public.profiles
  add constraint profiles_employment_type_check
  check (
    employment_type is null
    or employment_type in (
      'salaried',
      'self_employed',
      'business_owner',
      'freelancer',
      'student',
      'retired',
      'homemaker',
      'unemployed',
      'other'
    )
  ) not valid;

-- ---------------------------------------------------------------------------
-- CREDIT CARDS
-- ---------------------------------------------------------------------------
alter table if exists public.credit_cards
  add column if not exists bank_name text,
  add column if not exists card_network text,
  add column if not exists card_variant text,
  add column if not exists image_url text,
  add column if not exists joining_fee integer,
  add column if not exists annual_fee_waiver_spend integer,
  add column if not exists renewal_fee integer,
  add column if not exists min_income_salaried integer,
  add column if not exists min_income_self_employed integer,
  add column if not exists min_income_required integer,
  add column if not exists min_cibil_score integer,
  add column if not exists min_credit_score integer,
  add column if not exists requires_itr boolean default false,
  add column if not exists requires_existing_relationship boolean default false,
  add column if not exists reward_rate_default numeric(10, 4),
  add column if not exists reward_structure jsonb default '{}'::jsonb,
  add column if not exists milestone_benefits jsonb default '{}'::jsonb,
  add column if not exists lounge_access text,
  add column if not exists lounge_visits_per_quarter integer,
  add column if not exists fuel_surcharge_waiver_cap integer,
  add column if not exists movie_benefits text,
  add column if not exists dining_benefits text,
  add column if not exists travel_insurance_cover integer,
  add column if not exists purchase_protection_cover integer,
  add column if not exists golf_access boolean default false,
  add column if not exists concierge_service boolean default false,
  add column if not exists forex_markup numeric(8, 4),
  add column if not exists foreign_markup_fee numeric(8, 4),
  add column if not exists emi_conversion_available boolean default true,
  add column if not exists apply_url text,
  add column if not exists bank text,
  add column if not exists network text,
  add column if not exists first_year_fee integer,
  add column if not exists fee_waiver_condition text,
  add column if not exists min_income integer,
  add column if not exists eligible_employment_types text[] default array[]::text[],
  add column if not exists reward_point_value numeric(10, 4),
  add column if not exists benefits text[] default array[]::text[],
  add column if not exists card_image_url text,
  add column if not exists application_url text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'bank'
  ) then
    execute 'update public.credit_cards set bank_name = coalesce(bank_name, bank) where bank is not null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'network'
  ) then
    execute 'update public.credit_cards set card_network = coalesce(card_network, network) where network is not null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'min_income'
  ) then
    execute '
      update public.credit_cards
      set
        min_income_salaried = coalesce(min_income_salaried, min_income),
        min_income_self_employed = coalesce(min_income_self_employed, min_income),
        min_income_required = coalesce(min_income_required, min_income)
      where min_income is not null
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'min_credit_score'
  ) then
    execute '
      update public.credit_cards
      set min_cibil_score = coalesce(min_cibil_score, min_credit_score)
      where min_credit_score is not null
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'application_url'
  ) then
    execute '
      update public.credit_cards
      set apply_url = coalesce(apply_url, application_url)
      where application_url is not null
    ';
  end if;
end $$;

alter table if exists public.credit_cards drop constraint if exists credit_cards_card_type_check;
alter table if exists public.credit_cards drop constraint if exists credit_cards_network_check;
alter table if exists public.credit_cards drop constraint if exists credit_cards_card_network_check;

alter table if exists public.credit_cards
  add constraint credit_cards_card_type_check
  check (
    card_type is null
    or card_type in (
      'entry_level',
      'premium',
      'super_premium',
      'business',
      'fuel',
      'cashback',
      'rewards',
      'travel',
      'shopping',
      'lifestyle',
      'secured'
    )
  ) not valid;

alter table if exists public.credit_cards
  add constraint credit_cards_card_network_check
  check (card_network is null or card_network in ('visa', 'mastercard', 'rupay', 'amex', 'diners')) not valid;

-- ---------------------------------------------------------------------------
-- RECOMMENDATIONS
-- ---------------------------------------------------------------------------
alter table if exists public.recommendations
  add column if not exists flow_type text,
  add column if not exists input_data jsonb default '{}'::jsonb,
  add column if not exists ai_analysis text,
  add column if not exists spending_analysis jsonb,
  add column if not exists ai_model_used text,
  add column if not exists updated_at timestamptz default now();

update public.recommendations
set ai_analysis = coalesce(ai_analysis, ai_analysis_text)
where ai_analysis is null and ai_analysis_text is not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'recommendations'
      and column_name = 'application_guide'
      and udt_name <> 'jsonb'
  ) then
    execute $sql$
      alter table public.recommendations
      alter column application_guide type jsonb
      using case
        when application_guide is null then null
        when left(trim(application_guide), 1) in ('{', '[') then application_guide::jsonb
        else to_jsonb(application_guide)
      end
    $sql$;
  end if;
end $$;

alter table if exists public.recommendations drop constraint if exists recommendations_recommendation_type_check;
alter table if exists public.recommendations
  add constraint recommendations_recommendation_type_check
  check (
    recommendation_type is null
    or recommendation_type in ('beginner', 'experienced', 'optimization', 'chat')
  ) not valid;

-- ---------------------------------------------------------------------------
-- SPENDING TRANSACTIONS
-- ---------------------------------------------------------------------------
alter table if exists public.spending_transactions
  add column if not exists merchant text,
  add column if not exists merchant_name text,
  add column if not exists card_used uuid,
  add column if not exists credit_card_id uuid,
  add column if not exists notes text,
  add column if not exists description text,
  add column if not exists updated_at timestamptz default now();

update public.spending_transactions
set merchant_name = coalesce(merchant_name, merchant)
where merchant_name is null and merchant is not null;

update public.spending_transactions
set merchant = coalesce(merchant, merchant_name)
where merchant is null and merchant_name is not null;

alter table if exists public.spending_transactions drop constraint if exists spending_transactions_source_check;
alter table if exists public.spending_transactions drop constraint if exists spending_transactions_category_check;

alter table if exists public.spending_transactions
  add constraint spending_transactions_source_check
  check (source in ('manual', 'bank_statement', 'bank-statement', 'parsed_statement', 'imported')) not valid;

alter table if exists public.spending_transactions
  add constraint spending_transactions_category_check
  check (
    category in (
      'dining',
      'groceries',
      'travel',
      'fuel',
      'shopping',
      'entertainment',
      'utilities',
      'healthcare',
      'education',
      'insurance',
      'rent',
      'emi',
      'investments',
      'bills',
      'other'
    )
  ) not valid;

-- ---------------------------------------------------------------------------
-- UPLOADED DOCUMENTS
-- ---------------------------------------------------------------------------
alter table if exists public.uploaded_documents
  add column if not exists file_size integer,
  add column if not exists file_size_bytes integer,
  add column if not exists parsed_at timestamptz,
  add column if not exists updated_at timestamptz default now();

update public.uploaded_documents
set file_size = coalesce(file_size, file_size_bytes)
where file_size is null and file_size_bytes is not null;

update public.uploaded_documents
set file_size_bytes = coalesce(file_size_bytes, file_size)
where file_size_bytes is null and file_size is not null;

alter table if exists public.uploaded_documents drop constraint if exists uploaded_documents_document_type_check;
alter table if exists public.uploaded_documents
  add constraint uploaded_documents_document_type_check
  check (
    document_type in (
      'bank_statement',
      'bank-statement',
      'credit_report',
      'cibil-report',
      'salary_slip',
      'other'
    )
  ) not valid;

-- ---------------------------------------------------------------------------
-- CREDIT SCORE HISTORY
-- ---------------------------------------------------------------------------
alter table if exists public.credit_score_history
  add column if not exists score integer,
  add column if not exists source text,
  add column if not exists updated_at timestamptz default now();

update public.credit_score_history
set score = coalesce(score, credit_score)
where score is null and credit_score is not null;

update public.credit_score_history
set credit_score = coalesce(credit_score, score)
where credit_score is null and score is not null;

update public.credit_score_history
set source = coalesce(source, score_source)
where source is null and score_source is not null;

update public.credit_score_history
set score_source = coalesce(score_source, source)
where score_source is null and source is not null;

alter table if exists public.credit_score_history drop constraint if exists credit_score_history_credit_score_check;
alter table if exists public.credit_score_history drop constraint if exists credit_score_history_score_check;

alter table if exists public.credit_score_history
  add constraint credit_score_history_credit_score_check
  check (credit_score is null or credit_score between 300 and 900) not valid;

alter table if exists public.credit_score_history
  add constraint credit_score_history_score_check
  check (score is null or score between 300 and 900) not valid;

create or replace function public.sync_credit_score_to_profile()
returns trigger as $$
begin
  update public.profiles
  set
    credit_score = coalesce(new.credit_score, new.score, credit_score),
    cibil_score = coalesce(new.credit_score, new.score, cibil_score),
    credit_score_date = coalesce(new.score_date::timestamptz, credit_score_date),
    updated_at = now()
  where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------------------
-- EDUCATION ARTICLES
-- ---------------------------------------------------------------------------
alter table if exists public.education_articles
  add column if not exists summary text,
  add column if not exists read_time_minutes integer,
  add column if not exists excerpt text,
  add column if not exists reading_time_minutes integer,
  add column if not exists featured boolean default false,
  add column if not exists featured_image_url text,
  add column if not exists meta_description text,
  add column if not exists meta_keywords text[] default array[]::text[],
  add column if not exists published_at timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'education_articles' and column_name = 'excerpt'
  ) then
    execute '
      update public.education_articles
      set summary = coalesce(summary, excerpt)
      where summary is null and excerpt is not null
    ';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'education_articles' and column_name = 'reading_time_minutes'
  ) then
    execute '
      update public.education_articles
      set read_time_minutes = coalesce(read_time_minutes, reading_time_minutes)
      where read_time_minutes is null and reading_time_minutes is not null
    ';
  end if;
end $$;

update public.education_articles
set excerpt = coalesce(excerpt, summary)
where excerpt is null and summary is not null;

update public.education_articles
set reading_time_minutes = coalesce(reading_time_minutes, read_time_minutes)
where reading_time_minutes is null and read_time_minutes is not null;

alter table if exists public.education_articles drop constraint if exists education_articles_category_check;
alter table if exists public.education_articles drop constraint if exists education_articles_difficulty_check;

alter table if exists public.education_articles
  add constraint education_articles_category_check
  check (category in ('basics', 'cibil', 'CIBIL', 'rewards', 'fees', 'security', 'tips', 'advanced')) not valid;

alter table if exists public.education_articles
  add constraint education_articles_difficulty_check
  check (difficulty in ('beginner', 'intermediate', 'advanced', 'beginner_to_intermediate', 'intermediate_to_advanced')) not valid;

-- ---------------------------------------------------------------------------
-- USER CARDS / USER INTERACTIONS
-- ---------------------------------------------------------------------------
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

alter table if exists public.user_cards enable row level security;
alter table if exists public.user_interactions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_cards' and policyname = 'Users can view own cards'
  ) then
    execute $policy$create policy "Users can view own cards" on public.user_cards for select using (auth.uid() = user_id)$policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_cards' and policyname = 'Users can insert own cards'
  ) then
    execute $policy$create policy "Users can insert own cards" on public.user_cards for insert with check (auth.uid() = user_id)$policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_cards' and policyname = 'Users can update own cards'
  ) then
    execute $policy$create policy "Users can update own cards" on public.user_cards for update using (auth.uid() = user_id) with check (auth.uid() = user_id)$policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_cards' and policyname = 'Users can delete own cards'
  ) then
    execute $policy$create policy "Users can delete own cards" on public.user_cards for delete using (auth.uid() = user_id)$policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_interactions' and policyname = 'Users can view own interactions'
  ) then
    execute $policy$create policy "Users can view own interactions" on public.user_interactions for select using (auth.uid() = user_id)$policy$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_interactions' and policyname = 'Users can insert own interactions'
  ) then
    execute $policy$create policy "Users can insert own interactions" on public.user_interactions for insert with check (auth.uid() = user_id)$policy$;
  end if;
end $$;

grant all on public.user_cards to authenticated;
grant select, insert on public.user_interactions to authenticated;

-- ---------------------------------------------------------------------------
-- INDEXES (idempotent)
-- ---------------------------------------------------------------------------
create index if not exists idx_credit_cards_active_popularity on public.credit_cards(is_active, popularity_score desc);
create index if not exists idx_credit_cards_active_filters on public.credit_cards(is_active, bank_name, card_type, annual_fee);
create index if not exists idx_credit_cards_search_trgm
  on public.credit_cards
  using gin ((coalesce(card_name, '') || ' ' || coalesce(bank_name, '') || ' ' || coalesce(description, '')) gin_trgm_ops);

create index if not exists idx_spending_transactions_user_date on public.spending_transactions(user_id, transaction_date desc);
create index if not exists idx_recommendations_user_created on public.recommendations(user_id, created_at desc);
create index if not exists idx_education_articles_publish_category_views on public.education_articles(is_published, category, view_count desc);
create index if not exists idx_user_cards_user_added on public.user_cards(user_id, added_at desc);
create index if not exists idx_user_cards_active on public.user_cards(user_id, is_active);
create unique index if not exists idx_user_cards_unique_active
  on public.user_cards(user_id, lower(card_name), lower(bank_name))
  where is_active = true;
create index if not exists idx_user_interactions_user_occurred on public.user_interactions(user_id, occurred_at desc);
create index if not exists idx_user_interactions_event_occurred on public.user_interactions(event_type, occurred_at desc);
