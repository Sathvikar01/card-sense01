-- Add user_interactions table to capture meaningful product events

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

create index if not exists idx_user_interactions_user_occurred
  on public.user_interactions (user_id, occurred_at desc);

create index if not exists idx_user_interactions_event_occurred
  on public.user_interactions (event_type, occurred_at desc);

alter table public.user_interactions enable row level security;

drop policy if exists "Users can view own interactions" on public.user_interactions;
create policy "Users can view own interactions"
  on public.user_interactions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own interactions" on public.user_interactions;
create policy "Users can insert own interactions"
  on public.user_interactions
  for insert
  with check (auth.uid() = user_id);

grant select, insert on public.user_interactions to authenticated;

comment on table public.user_interactions is 'Meaningful product events captured for each authenticated user';
