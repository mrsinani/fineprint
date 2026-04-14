"use client";

import { ShieldCheck } from "lucide-react";
import { DonutChart } from "@/components/analysis/DonutChart";
import { RiskScoreBadge } from "@/components/analysis/RiskScoreBadge";
import type { AnalysisResult, RiskSeverity } from "@/components/analysis/types";

const SEVERITY_BADGES: Record<RiskSeverity, string> = {
  HIGH:   "bg-red-50 text-red-600 ring-red-200",
  MEDIUM: "bg-amber-50 text-amber-600 ring-amber-200",
  LOW:    "bg-emerald-50 text-emerald-600 ring-emerald-200",
};

export function RiskOverviewTab({ analysis }: { analysis: AnalysisResult }) {
  const counts = analysis.clauses.reduce<Record<RiskSeverity, number>>(
    (acc, clause) => {
      acc[clause.severity] += 1;
      return acc;
    },
    { HIGH: 0, MEDIUM: 0, LOW: 0 },
  );

  return (
    <div className="space-y-8">
      {/* Top grid: pie chart card + score card */}
      <section
        className="grid gap-6 opacity-0 xl:grid-cols-[minmax(0,1fr)_320px]"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.05s forwards" }}
      >
        {/* Risk Distribution */}
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

        {/* Overall Risk Score */}
        <RiskScoreBadge score={analysis.risk_score} />
      </section>

      {/* Clauses to review */}
      <section
        className="opacity-0"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.14s forwards" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-850 text-navy-300">
            <ShieldCheck size={18} strokeWidth={1.85} />
          </div>
          <h2 className="font-display text-2xl font-semibold text-navy-100">
            Clause Risk Analysis
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          {analysis.clauses.map((clause) => (
            <article
              key={clause.id}
              className="rounded-[24px] border border-navy-700 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-navy-100">{clause.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-navy-300">
                    {clause.quote}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ring-1 ring-inset ${SEVERITY_BADGES[clause.severity]}`}
                >
                  {clause.severity}
                </span>
              </div>

              <div
                className={
                  clause.description.trim().length > 0
                    ? "mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                    : "mt-4"
                }
              >
                {clause.description.trim().length > 0 ? (
                  <div className="rounded-2xl bg-navy-900 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
                      Why it matters
                    </p>
                    <p className="mt-2 text-sm leading-6 text-navy-300">{clause.description}</p>
                  </div>
                ) : null}
                <div className="rounded-2xl bg-gold-100/40 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-700">
                    Recommendation
                  </p>
                  <p className="mt-2 text-sm leading-6 text-navy-300">{clause.recommendation}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
