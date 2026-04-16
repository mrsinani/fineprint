"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { DonutChart } from "@/components/analysis/DonutChart";
import { RiskScoreBadge } from "@/components/analysis/RiskScoreBadge";
import type { AnalysisResult, RiskSeverity } from "@/components/analysis/types";

const SEVERITY_ORDER: Record<RiskSeverity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const CARD_STYLES: Record<RiskSeverity, string> = {
  HIGH: "border-red-200 bg-red-50 text-red-600",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-600",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-600",
};

const BADGE_STYLES: Record<RiskSeverity, string> = {
  HIGH: "bg-red-50 text-red-600 ring-red-200",
  MEDIUM: "bg-amber-50 text-amber-600 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-600 ring-emerald-200",
};

export function RiskOverviewTab({ analysis }: { analysis: AnalysisResult }) {
  const [filter, setFilter] = useState<RiskSeverity | "ALL">("ALL");

  const counts = analysis.clauses.reduce<Record<RiskSeverity, number>>(
    (acc, clause) => {
      acc[clause.severity] += 1;
      return acc;
    },
    { HIGH: 0, MEDIUM: 0, LOW: 0 },
  );

  const sortedAndFiltered = useMemo(() => {
    const list =
      filter === "ALL"
        ? analysis.clauses
        : analysis.clauses.filter((c) => c.severity === filter);
    return [...list].sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    );
  }, [analysis.clauses, filter]);

  return (
    <div className="space-y-8">
      {/* Top grid: pie chart card + score card */}
      <section
        className="grid gap-6 opacity-0 xl:grid-cols-[minmax(0,1fr)_320px]"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.05s forwards" }}
      >
        <div className="rounded-[28px] border border-navy-700 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-500">
            Risk Analysis
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-navy-100">
            Risk Distribution
          </h2>
          <div className="mt-6 flex justify-center">
            <DonutChart counts={counts} />
          </div>
        </div>

        <RiskScoreBadge score={analysis.risk_score} />
      </section>

      {/* Severity filter cards */}
      <section
        className="grid gap-4 opacity-0 md:grid-cols-3"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.10s forwards" }}
      >
        {(["HIGH", "MEDIUM", "LOW"] as const).map((severity) => (
          <button
            key={severity}
            type="button"
            onClick={() => setFilter((cur) => (cur === severity ? "ALL" : severity))}
            className={`rounded-[24px] border p-5 text-left transition-transform hover:-translate-y-0.5 ${CARD_STYLES[severity]} ${
              filter === severity ? "ring-2 ring-navy-200" : ""
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
              {severity} risk
            </p>
            <p className="mt-3 text-3xl font-bold">{counts[severity]}</p>
            <p className="mt-2 text-sm opacity-80">
              {filter === severity ? "Showing only these clauses" : "Click to filter"}
            </p>
          </button>
        ))}
      </section>

      {/* Clause list */}
      <section
        className="opacity-0"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.18s forwards" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy-100">
              Clause Risk Analysis
            </h2>
            <p className="mt-1 text-sm text-navy-500">
              {filter === "ALL"
                ? "All flagged clauses, ranked by severity."
                : `Filtered to ${filter.toLowerCase()} risk clauses.`}
            </p>
          </div>

          {filter !== "ALL" && (
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className="rounded-xl border border-navy-700 px-4 py-2 text-sm font-medium text-navy-300 transition-colors hover:border-gold-500 hover:text-gold-700"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="mt-5 space-y-4">
          {sortedAndFiltered.map((clause) => (
            <article
              key={clause.id}
              className="flex gap-4 rounded-[24px] border border-navy-700 bg-white p-5 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-navy-700 bg-navy-900 text-navy-400">
                <ShieldCheck size={18} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-navy-100">{clause.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-navy-300">{clause.description}</p>
                  </div>
                  <span
                    className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${BADGE_STYLES[clause.severity]}`}
                  >
                    {clause.severity}
                  </span>
                </div>

                {clause.recommendation.trim().length > 0 && (
                  <div className="mt-4 rounded-2xl bg-gold-100/40 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-700">
                      Recommendation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-navy-300">
                      {clause.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
