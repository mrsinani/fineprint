-- Profile fields for Clerk-synced users (server-updated via service role)
alter table public.users add column if not exists display_name text;
alter table public.users add column if not exists avatar_storage_path text;
alter table public.users add column if not exists notify_contract_ready boolean not null default true;
alter table public.users add column if not exists notify_product_updates boolean not null default true;

-- Public bucket for profile avatars (read); uploads go through API with service role
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
