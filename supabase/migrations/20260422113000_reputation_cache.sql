alter table public.analyses
  add column if not exists reputation_report jsonb;

create table if not exists public.reputation_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  entity_name text not null,
  entity_type text not null,
  contract_type text,
  provider text not null,
  payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reputation_cache_expires_at
  on public.reputation_cache (expires_at);

alter table public.reputation_cache disable row level security;
