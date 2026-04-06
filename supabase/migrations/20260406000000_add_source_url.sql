-- Add source_url to documents for extension-sourced analyses
alter table public.documents
  add column if not exists source_url text;
