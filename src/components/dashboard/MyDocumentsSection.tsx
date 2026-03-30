"use client";

import { useState } from "react";
import Link from "next/link";
import { List, LayoutGrid, ArrowRight } from "lucide-react";
import { DocumentCard, type DocumentCardProps } from "@/components/documents/DocumentCard";

type ViewMode = "grid" | "list";

export function MyDocumentsSection({ documents }: { documents: DocumentCardProps[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
            Recently analyzed contracts
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

      {documents.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-navy-700 py-12 text-center">
          <p className="text-sm text-navy-500">No documents yet.</p>
          <Link
            href="/upload"
            className="mt-2 inline-block text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
          >
            Upload your first document &rarr;
          </Link>
        </div>
      ) : (
        <div className="mt-5">
          <ul
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                : "flex flex-col gap-3"
            }
            role="list"
          >
            {documents.map((doc, i) => (
              <li
                key={doc.id ?? i}
                className="opacity-0"
                style={{
                  animation: `fp-fade-in-up 0.5s ease-out ${0.1 + i * 0.08}s forwards`,
                }}
              >
                <DocumentCard {...doc} />
              </li>
            ))}
          </ul>

          <div className="mt-4 text-right">
            <Link
              href="/documents"
              className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
              aria-label="View all documents"
            >
              View all
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
