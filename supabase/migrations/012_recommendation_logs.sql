-- Store explainability metadata for each recommended card.
-- Captures evaluated rules, rule scores, and final decision reasoning.

create extension if not exists "pgcrypto";

create table if not exists public.recommendation_logs (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  card_name text not null,
  rank integer not null check (rank > 0),
  rules_evaluated jsonb not null default '[]'::jsonb,
  rule_scores jsonb not null default '{}'::jsonb,
  final_decision_reason text not null,
  explanation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_recommendation_logs_unique_card
  on public.recommendation_logs (recommendation_id, card_id);

create index if not exists idx_recommendation_logs_user_created
  on public.recommendation_logs (user_id, created_at desc);

create index if not exists idx_recommendation_logs_recommendation
  on public.recommendation_logs (recommendation_id, created_at desc);

alter table public.recommendation_logs enable row level security;

drop policy if exists "Users can view own recommendation logs" on public.recommendation_logs;
create policy "Users can view own recommendation logs"
  on public.recommendation_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own recommendation logs" on public.recommendation_logs;
create policy "Users can insert own recommendation logs"
  on public.recommendation_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Service role can manage recommendation logs" on public.recommendation_logs;
create policy "Service role can manage recommendation logs"
  on public.recommendation_logs
  for all
  to service_role
  using (true)
  with check (true);

revoke all on public.recommendation_logs from anon;
grant select, insert on public.recommendation_logs to authenticated;

comment on table public.recommendation_logs is 'Per-card explainability logs for generated recommendations.';
comment on column public.recommendation_logs.rules_evaluated is 'Ordered list of scoring/eligibility rules evaluated for this card.';
comment on column public.recommendation_logs.rule_scores is 'Numeric rule scores and weighted totals used to rank this card.';
comment on column public.recommendation_logs.final_decision_reason is 'Human-readable final reason for why the card was selected.';
