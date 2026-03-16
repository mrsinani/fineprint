"use client";

export interface PendingFileRowProps {
  name: string;
  size: string;
  status: "pending" | "uploading" | "done" | "error";
  onRemove?: () => void;
}

export function PendingFileRow({ name, size, status, onRemove }: PendingFileRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400" aria-hidden>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {size}
            {status === "uploading" && (
              <span className="ml-1.5 text-sky-600 dark:text-sky-400">• Uploading...</span>
            )}
            {status === "done" && (
              <span className="ml-1.5 text-emerald-600 dark:text-emerald-400">• Ready</span>
            )}
            {status === "error" && (
              <span className="ml-1.5 text-red-600 dark:text-red-400">• Failed</span>
            )}
          </p>
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          aria-label={`Remove ${name}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

