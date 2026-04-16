"use client";

import { useMemo, useState } from "react";
import { CheckSquare, Circle, Coins, FilePenLine, Gavel, Settings2, Stamp } from "lucide-react";
import type { ActionCategory, AnalysisResult, RiskSeverity } from "@/components/analysis/types";

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

const CATEGORY_ICONS: Record<ActionCategory, typeof FilePenLine> = {
  negotiate: FilePenLine,
  legal: Gavel,
  finance: Coins,
  operations: Settings2,
  signing: Stamp,
};

export function ActionItemsTab({ analysis }: { analysis: AnalysisResult }) {
  const [filter, setFilter] = useState<RiskSeverity | "ALL">("ALL");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const counts = analysis.action_items.reduce<Record<RiskSeverity, number>>(
    (acc, item) => {
      acc[item.severity] += 1;
      return acc;
    },
    { HIGH: 0, MEDIUM: 0, LOW: 0 },
  );

  const filteredItems = useMemo(
    () =>
      filter === "ALL"
        ? analysis.action_items
        : analysis.action_items.filter((item) => item.severity === filter),
    [analysis.action_items, filter],
  );

  const completedCount = filteredItems.filter((item) => completed[item.id]).length;

  return (
    <div className="space-y-8">
      <section
        className="grid gap-4 opacity-0 md:grid-cols-3"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.05s forwards" }}
      >
        {(["HIGH", "MEDIUM", "LOW"] as const).map((severity) => (
          <button
            key={severity}
            type="button"
            onClick={() => setFilter((current) => (current === severity ? "ALL" : severity))}
            className={`rounded-[24px] border p-5 text-left transition-transform hover:-translate-y-0.5 ${CARD_STYLES[severity]} ${
              filter === severity ? "ring-2 ring-navy-200" : ""
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
              {severity} priority
            </p>
            <p className="mt-3 text-3xl font-bold">{counts[severity]}</p>
            <p className="mt-2 text-sm opacity-80">
              {filter === severity ? "Showing only these items" : "Click to filter"}
            </p>
          </button>
        ))}
      </section>

      <section
        className="opacity-0"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.12s forwards" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy-100">
              Before you sign
            </h2>
            <p className="mt-1 text-sm text-navy-500">
              {filter === "ALL"
                ? "Review this short checklist to make sure the most important points are covered."
                : `Filtered to ${filter.toLowerCase()} priority items.`}
            </p>
            <p className="mt-1 text-xs text-navy-500">
              Estimated time: 5–10 minutes ·{" "}
              {completedCount} of {filteredItems.length} items marked as done
            </p>
          </div>

          {filter !== "ALL" ? (
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className="rounded-xl border border-navy-700 px-4 py-2 text-sm font-medium text-navy-300 transition-colors hover:border-gold-500 hover:text-gold-700"
            >
              Clear filter
            </button>
          ) : null}
        </div>

        <div className="mt-5 space-y-4">
          {filteredItems.map((item) => {
            const Icon = CATEGORY_ICONS[item.category];
            const isDone = Boolean(completed[item.id]);

            return (
              <article
                key={item.id}
                className={`flex gap-4 rounded-[24px] border bg-white p-5 shadow-sm ${
                  isDone ? "border-emerald-200 bg-emerald-50/40" : "border-navy-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setCompleted((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-navy-700 bg-navy-900 text-navy-400"
                  aria-label={isDone ? "Mark as not completed" : "Mark as completed"}
                >
                  {isDone ? (
                    <CheckSquare size={18} strokeWidth={1.8} className="text-emerald-400" />
                  ) : (
                    <Circle size={18} strokeWidth={1.8} />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-navy-100">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-navy-300">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                        <Icon size={16} strokeWidth={1.8} />
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${BADGE_STYLES[item.severity]}`}
                      >
                        {item.severity}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

