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
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.25 10.5v5.25a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V10.5m9 0V4.875A2.25 2.25 0 0 0 16.875 2.625H13.5m-3 0V2.625A2.25 2.25 0 0 0 7.875 2.625H4.125A2.25 2.25 0 0 0 1.875 4.875v14.25c0 1.24 1.01 2.25 2.25 2.25h14.25c1.24 0 2.25-1.01 2.25-2.25V10.5" />
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

