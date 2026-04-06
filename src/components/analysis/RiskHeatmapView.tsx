"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LiveClauseViewer } from "@/components/analysis/LiveClauseViewer";
import type { AnalysisResult, RiskClause } from "@/components/analysis/types";

const BAR_STYLES = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-emerald-500",
} as const;

const BADGE_STYLES = {
  HIGH: "bg-red-50 text-red-600 ring-red-200",
  MEDIUM: "bg-amber-50 text-amber-600 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-600 ring-emerald-200",
} as const;

function getClauseSummary(clause: RiskClause) {
  return `${clause.title} (${clause.severity.toLowerCase()})`;
}

export function RiskHeatmapView({ analysis }: { analysis: AnalysisResult }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedClause = analysis.clauses[selectedIndex];
  const totalClauses = analysis.clauses.length;
  const selectedLabel = useMemo(
    () => getClauseSummary(selectedClause),
    [selectedClause],
  );

  return (
    <div className="space-y-6">
      <section
        className="rounded-[28px] border border-navy-700 bg-white p-5 opacity-0 shadow-sm"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.05s forwards" }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400">
              Clause heatmap
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-navy-100">
              Scan the document by risk level
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIndex((index) => Math.max(0, index - 1))}
              disabled={selectedIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-700 bg-navy-900 text-navy-300 transition-colors hover:border-gold-500 hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous clause"
            >
              <ChevronLeft size={18} strokeWidth={1.9} />
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((index) => Math.min(totalClauses - 1, index + 1))
              }
              disabled={selectedIndex === totalClauses - 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-700 bg-navy-900 text-navy-300 transition-colors hover:border-gold-500 hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next clause"
            >
              <ChevronRight size={18} strokeWidth={1.9} />
            </button>
            <div className="ml-2 rounded-xl bg-navy-900 px-3 py-2 text-xs font-medium text-navy-300">
              {selectedIndex + 1} / {totalClauses}
            </div>
          </div>
        </div>

        <div className="mt-5 flex overflow-hidden rounded-full border border-navy-700 bg-navy-850">
          {analysis.clauses.map((clause, index) => (
            <button
              key={clause.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative h-5 flex-1 transition-all ${
                selectedIndex === index ? "ring-2 ring-inset ring-white" : ""
              } ${BAR_STYLES[clause.severity]}`}
              aria-label={`Select ${getClauseSummary(clause)}`}
              title={getClauseSummary(clause)}
            >
              <span className="sr-only">{getClauseSummary(clause)}</span>
            </button>
          ))}
        </div>

        <p className="mt-3 text-sm text-navy-500">
          Selected: <span className="font-medium text-navy-200">{selectedLabel}</span>
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div
          className="opacity-0"
          style={{ animation: "fp-fade-in-up 0.45s ease-out 0.12s forwards" }}
        >
          <LiveClauseViewer
            clause={selectedClause}
            documentText={analysis.document_text}
            pdfUrl={analysis.pdf_url}
          />
        </div>

        <aside
          className="rounded-[28px] border border-navy-700 bg-white p-5 opacity-0 shadow-sm"
          style={{ animation: "fp-fade-in-up 0.45s ease-out 0.18s forwards" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400">
                Clause details
              </p>
              <h3 className="mt-1 text-xl font-semibold text-navy-100">
                {selectedClause.title}
              </h3>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${BADGE_STYLES[selectedClause.severity]}`}
            >
              {selectedClause.severity}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-navy-900 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
                Description
              </p>
              <p className="mt-2 text-sm leading-6 text-navy-300">
                {selectedClause.description}
              </p>
            </div>

            <div className="rounded-2xl bg-gold-100/40 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-700">
                Recommendation
              </p>
              <p className="mt-2 text-sm leading-6 text-navy-300">
                {selectedClause.recommendation}
              </p>
            </div>

            <div className="rounded-2xl border border-navy-700 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400">
                Exact quote
              </p>
              <blockquote className="mt-2 border-l-2 border-gold-500 pl-4 text-sm leading-6 text-navy-300">
                {selectedClause.quote}
              </blockquote>
              <p className="mt-3 text-xs text-navy-500">
                Character range: {selectedClause.char_start}-{selectedClause.char_end}
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
