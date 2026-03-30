-- Clerk-synced users table
create table if not exists public.users (
  id text primary key,
  email text,
  first_name text,
  last_name text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users disable row level security;

-- Backfill: seed placeholder rows for any user_ids already in documents
insert into public.users (id)
select distinct user_id from public.documents
on conflict (id) do nothing;

-- FK: documents.user_id -> users.id
alter table public.documents
  add constraint documents_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;
