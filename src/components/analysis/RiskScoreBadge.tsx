"use client";

import { getClauseSeverityCounts } from "@/lib/scoring";
import type { AnalysisResult } from "./types";

function getSummaryStyles(counts: {
  high: number;
  medium: number;
  low: number;
}) {
  if (counts.high > 0) {
    return {
      text: "text-red-500",
      label: "High risk present",
      subtitle: `Risk profile includes ${counts.high} high and ${counts.medium} medium clauses`,
    };
  }

  if (counts.medium > 0) {
    return {
      text: "text-amber-500",
      label: "Moderate risk present",
      subtitle: `Risk profile includes ${counts.medium} medium clauses`,
    };
  }

  return {
    text: "text-emerald-500",
    label: "Low risk profile",
    subtitle: "Only low risk clauses were flagged",
  };
}

export function RiskScoreBadge({ analysis }: { analysis: AnalysisResult }) {
  const counts = getClauseSeverityCounts(analysis.clauses);
  const styles = getSummaryStyles(counts);
  const summaryText =
    counts.total === 0
      ? "No clauses flagged"
      : `${counts.high} high risk, ${counts.medium} medium, ${counts.low} low`;

  return (
    <div className="flex flex-col justify-center gap-3 rounded-[28px] border border-navy-700 bg-white p-8 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-500">
        Risk summary
      </p>
      <p className={`font-display text-4xl font-bold leading-none ${styles.text}`}>
        {summaryText}
      </p>
      <p className={`text-lg font-semibold ${styles.text}`}>{styles.label}</p>
      <p className="max-w-[220px] text-sm leading-relaxed text-navy-500">{styles.subtitle}</p>
    </div>
  );
}
