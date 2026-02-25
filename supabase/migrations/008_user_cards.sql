-- Add user_cards table for storing cards owned by users

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

create index if not exists idx_user_cards_user_added
  on public.user_cards (user_id, added_at desc);

create index if not exists idx_user_cards_active
  on public.user_cards (user_id, is_active);

create unique index if not exists idx_user_cards_unique_active
  on public.user_cards (user_id, lower(card_name), lower(bank_name))
  where is_active = true;

alter table public.user_cards enable row level security;

drop policy if exists "Users can view own cards" on public.user_cards;
create policy "Users can view own cards"
  on public.user_cards
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own cards" on public.user_cards;
create policy "Users can insert own cards"
  on public.user_cards
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own cards" on public.user_cards;
create policy "Users can update own cards"
  on public.user_cards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own cards" on public.user_cards;
create policy "Users can delete own cards"
  on public.user_cards
  for delete
  using (auth.uid() = user_id);

grant all on public.user_cards to authenticated;

comment on table public.user_cards is 'Cards currently or previously owned by a user';
