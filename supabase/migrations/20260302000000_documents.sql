-- Create documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text,
  file_name text,
  file_type text,
  file_path text,
  page_count int,
  document_type text,
  overall_risk_score int,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents disable row level security;

-- Create analyses table
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  summary jsonb,
  clauses jsonb,
  action_items jsonb,
  raw_text text,
  overall_risk_score int,
  created_at timestamptz not null default now()
);

alter table public.analyses disable row level security;

-- Create Supabase Storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
