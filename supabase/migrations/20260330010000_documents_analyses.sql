-- Enforce not-null constraints on documents (created by earlier migration with nullable columns)
alter table public.documents alter column title set not null;
alter table public.documents alter column file_name set not null;

-- Add indexes if they don't exist
create index if not exists idx_documents_user_id on public.documents (user_id);
create index if not exists idx_documents_deleted_at on public.documents (deleted_at);

-- Add index on analyses.document_id if it doesn't exist
create index if not exists idx_analyses_document_id on public.analyses (document_id);
