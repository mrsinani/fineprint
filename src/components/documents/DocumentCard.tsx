import { MoreHorizontal } from "lucide-react";

export interface DocumentCardProps {
  id?: string;
  title: string;
  fileName?: string;
  lastOpened?: string;
  fileType?: string;
  pages?: number;
  createdAt: string;
  uploadedAt?: string;
  manager?: string;
  team?: string;
}

export function DocumentCard({
  id: documentId,
  title,
  fileName,
  lastOpened,
  fileType,
  pages,
  createdAt,
  uploadedAt,
}: DocumentCardProps) {
  const titleId = documentId ? `doc-title-${documentId}` : undefined;
  const displayOpened = lastOpened ?? uploadedAt;

  return (
    <article
      className="flex min-h-[180px] min-w-[220px] max-w-[240px] flex-col justify-between rounded-xl border border-navy-700 bg-white p-4 transition-shadow duration-200 hover:shadow-md"
      aria-labelledby={titleId}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] text-navy-500">
            {displayOpened && <>Last opened: {displayOpened}</>}
          </p>
          <button
            type="button"
            className="shrink-0 rounded-md p-0.5 text-navy-500 transition-colors hover:text-navy-300"
            aria-label="Document options"
          >
            <MoreHorizontal size={16} strokeWidth={2} />
          </button>
        </div>

        <h3
          id={titleId}
          className="mt-2 truncate text-sm font-bold text-navy-100"
        >
          {title}
        </h3>
        {fileName && (
          <p className="mt-0.5 truncate text-[12px] text-navy-500">
            {fileName}
          </p>
        )}
      </div>

      <dl className="mt-4 flex flex-col gap-0.5 text-[11px] text-navy-500">
        {fileType && (
          <div>
            <dt className="sr-only">File type</dt>
            <dd>File type: {fileType}</dd>
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
