#!/usr/bin/env bash
set -euo pipefail

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required but not found in PATH."
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required."
  exit 1
fi

echo "Bootstrapping fresh Postgres with minimal Supabase-compatible schemas..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create schema if not exists auth;
create schema if not exists storage;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
end $$;

create table if not exists auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'authenticated')
$$;

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table if not exists storage.objects (
  id bigserial primary key,
  bucket_id text not null,
  name text not null
);

alter table storage.objects enable row level security;

create or replace function storage.foldername(name text)
returns text[]
language sql
immutable
as $$
  select regexp_split_to_array(coalesce(name, ''), '/')
$$;
SQL

mapfile -t migration_files < <(find supabase/migrations -maxdepth 1 -type f -name '[0-9][0-9][0-9]_*.sql' | sort)

if [[ ${#migration_files[@]} -eq 0 ]]; then
  echo "No numbered migrations found in supabase/migrations."
  exit 1
fi

echo "Applying Supabase migrations..."
for file in "${migration_files[@]}"; do
  echo "-> ${file}"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

echo "Supabase migrations applied cleanly."
