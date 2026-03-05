"use client";

import { useState } from "react";
import Link from "next/link";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { MOCK_DOCUMENTS } from "@/components/documents/MockDocuments";

type ViewMode = "grid" | "list";

export function MyDocumentsSection() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const documents = MOCK_DOCUMENTS;

  return (
    <section aria-labelledby="my-documents-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="my-documents-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            My documents
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Start by simply uploading one
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50" role="group" aria-label="View mode">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
            aria-pressed={viewMode === "list"}
            aria-label="List view"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
            aria-pressed={viewMode === "grid"}
            aria-label="Grid view"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div
          className={`flex gap-4 overflow-x-auto pb-2 ${
            viewMode === "grid"
              ? "flex-nowrap"
              : "flex-col overflow-x-visible"
          }`}
          style={viewMode === "grid" ? { scrollbarWidth: "thin" } : undefined}
        >
          {documents.map((doc, i) => (
            <DocumentCard key={i} id={`${i}`} {...doc} />
          ))}
          {/* Placeholder cards */}
          <div
            className="min-w-[280px] max-w-[320px] rounded-xl border border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-600 dark:bg-slate-800/20"
            aria-hidden
          />
          <div
            className="min-w-[280px] max-w-[320px] rounded-xl border border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-600 dark:bg-slate-800/20"
            aria-hidden
          />
        </div>
        <Link
          href="/documents"
          className="shrink-0 rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          aria-label="View all documents"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

