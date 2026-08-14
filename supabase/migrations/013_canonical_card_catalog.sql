-- Make public.credit_cards the single governed source for every card detail.
-- The application must read this table; local catalogs are migration-only inputs.

alter table public.credit_cards
  add column if not exists card_slug text,
  add column if not exists data_source text not null default 'catalog_import',
  add column if not exists data_last_verified_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Backfill stable, human-readable identifiers for rows created by older migrations.
update public.credit_cards
set card_slug = trim(both '-' from regexp_replace(
  lower(concat(coalesce(bank_name, bank, 'card'), '-', coalesce(card_name, ''))),
  '[^a-z0-9]+', '-', 'g'
))
where card_slug is null or btrim(card_slug) = '';

-- Keep the slug unique even if two legacy rows have the same bank/name pair.
with duplicate_slugs as (
  select id, card_slug,
    row_number() over (partition by card_slug order by created_at nulls first, id) as slug_rank
  from public.credit_cards
  where card_slug is not null
)
update public.credit_cards cards
set card_slug = cards.card_slug || '-' || left(cards.id::text, 8)
from duplicate_slugs duplicates
where cards.id = duplicates.id
  and duplicates.slug_rank > 1;

alter table public.credit_cards
  alter column card_slug set not null;

create unique index if not exists credit_cards_card_slug_key
  on public.credit_cards (card_slug);

create index if not exists credit_cards_active_popularity_idx
  on public.credit_cards (is_active, popularity_score desc);

create index if not exists credit_cards_search_idx
  on public.credit_cards using gin (
    to_tsvector(
      'simple'::regconfig,
      coalesce(bank_name, '') || ' ' || coalesce(card_name, '') || ' ' || coalesce(description, '')
    )
  );

comment on table public.credit_cards is
  'Canonical CardSense card catalog. Runtime card details must come from this table only.';
comment on column public.credit_cards.card_slug is
  'Stable catalog identifier used by URLs, imports, and recommendation references.';
comment on column public.credit_cards.data_source is
  'Origin of the current record, for example catalog_import, manual, or partner.';
comment on column public.credit_cards.data_last_verified_at is
  'When the current card details were last verified.';
