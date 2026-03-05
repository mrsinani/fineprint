export interface DocumentCardProps {
  /** Optional unique id for the card (for accessibility). */
  id?: string;
  title: string;
  uploadedAt: string;
  manager?: string;
  team?: string;
  pages?: number;
  createdAt: string;
}

export function DocumentCard({ id: documentId, title, uploadedAt, manager, team, pages, createdAt }: DocumentCardProps) {
  const titleId = documentId ? `doc-title-${documentId}` : undefined;
  return (
    <article
      className="flex min-w-[280px] max-w-[320px] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow dark:border-slate-700 dark:bg-slate-900"
      aria-labelledby={titleId}
    >
      <h3 id={titleId} className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <div>
          <dt className="sr-only">Uploaded</dt>
          <dd>Uploaded: {uploadedAt}</dd>
        </div>
        {manager != null && (
          <div>
            <dt className="sr-only">Manager</dt>
            <dd>Manager: {manager}</dd>
          </div>
        )}
        {team != null && (
          <div>
            <dt className="sr-only">Team</dt>
            <dd>Team: {team}</dd>
          </div>
        )}
        {pages != null && (
          <div>
            <dt className="sr-only">Pages</dt>
            <dd>Pages: {pages}</dd>
          </div>
        )}
        <div>
          <dt className="sr-only">Created</dt>
          <dd>Created: {createdAt}</dd>
        </div>
      </dl>
    </article>
  );
}

