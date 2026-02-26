-- Add append-only audit logs table.
-- Write path is intended for trusted server-side code.

create extension if not exists "pgcrypto";

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  ip inet,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_user_created
  on public.audit_logs (user_id, created_at desc);

create index if not exists idx_audit_logs_action_created
  on public.audit_logs (action, created_at desc);

create or replace function public.prevent_audit_logs_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only: % is not allowed', tg_op
    using errcode = '55000';
end;
$$;

drop trigger if exists trg_prevent_audit_logs_mutation on public.audit_logs;
create trigger trg_prevent_audit_logs_mutation
before update or delete on public.audit_logs
for each row
execute function public.prevent_audit_logs_mutation();

alter table public.audit_logs enable row level security;

drop policy if exists "Users can insert own audit logs" on public.audit_logs;
create policy "Users can insert own audit logs"
  on public.audit_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Service role can insert audit logs" on public.audit_logs;
create policy "Service role can insert audit logs"
  on public.audit_logs
  for insert
  to service_role
  with check (true);

revoke all on public.audit_logs from anon;
grant insert on public.audit_logs to authenticated;

comment on table public.audit_logs is 'Append-only audit trail. Preferred write path: trusted server-side code.';
