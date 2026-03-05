import Link from "next/link";

export function RiskAnalysisCard() {
  return (
    <Link
      href="/upload"
      className="group block rounded-xl border border-sky-200 bg-sky-50 p-6 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-100/80 dark:border-sky-800/60 dark:bg-sky-950/40 dark:hover:border-sky-700 dark:hover:bg-sky-950/60"
      aria-label="Analyze new contract - go to upload"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sky-200/80 text-sky-700 dark:bg-sky-800/60 dark:text-sky-300" aria-hidden>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              <path d="M12 12v6m-3-3h6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Analyze new contract
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Upload any contract for a quick & reliable summary and risk report.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-sky-200/80 p-2 text-sky-700 transition-transform group-hover:translate-x-0.5 dark:bg-sky-800/60 dark:text-sky-300" aria-hidden>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

