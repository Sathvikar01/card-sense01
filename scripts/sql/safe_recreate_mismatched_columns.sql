-- Safe column recreation playbook for known drift columns.
-- Non-destructive by default:
-- 1) Preserve legacy columns by renaming to *_legacy.
-- 2) Recreate canonical columns where missing.
-- 3) Backfill canonical values from legacy.
--
-- Run manually in Supabase SQL editor when you want to actively normalize legacy names.

begin;

-- ---------------------------------------------------------------------------
-- credit_cards: bank/network -> bank_name/card_network
-- ---------------------------------------------------------------------------
do $$
declare
  has_bank boolean;
  has_bank_name boolean;
  has_network boolean;
  has_card_network boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'bank'
  ) into has_bank;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'bank_name'
  ) into has_bank_name;

  if has_bank and not has_bank_name then
    execute 'alter table public.credit_cards rename column bank to bank_name';
    has_bank := false;
    has_bank_name := true;
  elsif has_bank and has_bank_name then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'bank_legacy'
    ) then
      execute 'alter table public.credit_cards rename column bank to bank_legacy';
      execute 'update public.credit_cards set bank_name = coalesce(bank_name, bank_legacy) where bank_legacy is not null';
    end if;
  end if;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'network'
  ) into has_network;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'card_network'
  ) into has_card_network;

  if has_network and not has_card_network then
    execute 'alter table public.credit_cards rename column network to card_network';
  elsif has_network and has_card_network then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'network_legacy'
    ) then
      execute 'alter table public.credit_cards rename column network to network_legacy';
      execute 'update public.credit_cards set card_network = coalesce(card_network, network_legacy) where network_legacy is not null';
    end if;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'bank_name'
  ) then
    execute 'alter table public.credit_cards add column bank_name text';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'credit_cards' and column_name = 'card_network'
  ) then
    execute 'alter table public.credit_cards add column card_network text';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- education_articles: excerpt/reading_time_minutes -> summary/read_time_minutes
-- ---------------------------------------------------------------------------
do $$
declare
  has_excerpt boolean;
  has_summary boolean;
  has_reading_time boolean;
  has_read_time boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'education_articles' and column_name = 'excerpt'
  ) into has_excerpt;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'education_articles' and column_name = 'summary'
  ) into has_summary;

  if has_excerpt and not has_summary then
    execute 'alter table public.education_articles rename column excerpt to summary';
    has_excerpt := false;
    has_summary := true;
  elsif has_excerpt and has_summary then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'education_articles' and column_name = 'excerpt_legacy'
    ) then
      execute 'alter table public.education_articles rename column excerpt to excerpt_legacy';
      execute 'update public.education_articles set summary = coalesce(summary, excerpt_legacy) where excerpt_legacy is not null';
    end if;
  end if;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'education_articles' and column_name = 'reading_time_minutes'
  ) into has_reading_time;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'education_articles' and column_name = 'read_time_minutes'
  ) into has_read_time;

  if has_reading_time and not has_read_time then
    execute 'alter table public.education_articles rename column reading_time_minutes to read_time_minutes';
    has_reading_time := false;
    has_read_time := true;
  elsif has_reading_time and has_read_time then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'education_articles' and column_name = 'reading_time_minutes_legacy'
    ) then
      execute 'alter table public.education_articles rename column reading_time_minutes to reading_time_minutes_legacy';
      execute 'update public.education_articles set read_time_minutes = coalesce(read_time_minutes, reading_time_minutes_legacy) where reading_time_minutes_legacy is not null';
    end if;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'education_articles' and column_name = 'summary'
  ) then
    execute 'alter table public.education_articles add column summary text';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'education_articles' and column_name = 'read_time_minutes'
  ) then
    execute 'alter table public.education_articles add column read_time_minutes integer';
  end if;
end $$;

commit;

-- Optional cleanup after validation window:
-- alter table public.credit_cards drop column if exists bank_legacy;
-- alter table public.credit_cards drop column if exists network_legacy;
-- alter table public.education_articles drop column if exists excerpt_legacy;
-- alter table public.education_articles drop column if exists reading_time_minutes_legacy;
