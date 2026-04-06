-- User sensitivity preferences for personalized risk scoring (onboarding)
alter table public.users
  add column if not exists sensitivity_preferences jsonb not null default '{}'::jsonb;

alter table public.users
  add column if not exists onboarding_completed boolean not null default false;

-- Backfill existing users as onboarded with empty prefs (they get default MEDIUM)
update public.users
  set onboarding_completed = true
  where onboarding_completed = false
    and created_at < now() - interval '1 minute';
