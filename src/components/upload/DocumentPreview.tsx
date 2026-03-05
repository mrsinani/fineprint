"use client";

export interface DocumentPreviewProps {
  fileName: string;
  /** When true, show a placeholder; when we have a URL, we could show an iframe or image. */
  placeholder?: boolean;
}

export function DocumentPreview({ fileName, placeholder = true }: DocumentPreviewProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100/50 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="border-b border-slate-200 px-4 py-2 dark:border-slate-700">
        <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
          {fileName}
        </p>
      </div>
      <div className="flex min-h-[240px] items-center justify-center p-8">
        {placeholder ? (
          <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500" aria-hidden>
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.25 10.5v5.25a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V10.5m9 0V4.875A2.25 2.25 0 0 0 16.875 2.625H13.5m-3 0V2.625A2.25 2.25 0 0 0 7.875 2.625H4.125A2.25 2.25 0 0 0 1.875 4.875v14.25c0 1.24 1.01 2.25 2.25 2.25h14.25c1.24 0 2.25-1.01 2.25-2.25V10.5" />
            </svg>
            <span className="text-xs">Document preview</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

