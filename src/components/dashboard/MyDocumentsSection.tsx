"use client";

import { useState } from "react";
import Link from "next/link";
import { List, LayoutGrid, ArrowRight } from "lucide-react";
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
          <h2
            id="my-documents-heading"
            className="font-display text-xl font-bold text-navy-100"
          >
            My documents
          </h2>
          <p className="mt-0.5 text-sm text-navy-500">
            Some copy line here
          </p>
        </div>
        <div
          className="flex items-center gap-0.5 rounded-lg border border-navy-800 p-1"
          role="group"
          aria-label="View mode"
        >
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-1.5 transition-colors duration-150 ${
              viewMode === "grid"
                ? "bg-navy-850 text-navy-200"
                : "text-navy-500 hover:text-navy-300"
            }`}
            aria-pressed={viewMode === "grid"}
            aria-label="Grid view"
          >
            <LayoutGrid size={14} strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`rounded-md p-1.5 transition-colors duration-150 ${
              viewMode === "list"
                ? "bg-navy-850 text-navy-200"
                : "text-navy-500 hover:text-navy-300"
            }`}
            aria-pressed={viewMode === "list"}
            aria-label="List view"
          >
            <List size={14} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div
          className={`flex gap-4 overflow-x-auto pb-2 ${
            viewMode === "grid" ? "flex-nowrap" : "flex-col overflow-x-visible"
          }`}
          style={viewMode === "grid" ? { scrollbarWidth: "thin" } : undefined}
        >
          {documents.map((doc, i) => (
            <div
              key={i}
              className="opacity-0"
              style={{
                animation: `fp-fade-in-up 0.5s ease-out ${0.1 + i * 0.08}s forwards`,
              }}
            >
              <DocumentCard id={`${i}`} {...doc} />
            </div>
          ))}
          <div
            className="min-h-[180px] min-w-[220px] max-w-[240px] rounded-xl border border-dashed border-navy-700"
            aria-hidden
          />
          <div
            className="min-h-[180px] min-w-[220px] max-w-[240px] rounded-xl border border-dashed border-navy-700"
            aria-hidden
          />
        </div>
        <Link
          href="/documents"
          className="shrink-0 text-gold-600 transition-transform duration-200 hover:translate-x-0.5"
          aria-label="View all documents"
        >
          <ArrowRight size={24} strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}
