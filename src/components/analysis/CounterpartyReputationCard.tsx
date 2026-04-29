"use client";

import {
  AlertTriangle,
  Building2,
  ExternalLink,
  Home,
  ShieldAlert,
} from "lucide-react";
import type { ReputationReport, RiskSeverity } from "@/components/analysis/types";

const BADGE_STYLES: Record<RiskSeverity, string> = {
  HIGH: "bg-red-50 text-red-700 ring-red-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function formatWhen(value: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CounterpartyReputationCard({
  reputation,
}: {
  reputation: ReputationReport;
}) {
  const EntityIcon = reputation.entity_type === "landlord" ? Home : Building2;
  const searchedAt = formatWhen(reputation.searched_at);

  return (
    <section className="rounded-[28px] border border-navy-700 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-500">
            Counterparty reputation
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-850 text-gold-600">
              <EntityIcon size={20} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl font-semibold text-navy-100">
                {reputation.entity_name}
              </h2>
              <p className="text-sm text-navy-500">
                {reputation.entity_type === "landlord"
                  ? "Landlord signals"
                  : "Company signals"}
                {searchedAt ? ` - checked ${searchedAt}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${BADGE_STYLES[reputation.risk_level]}`}
          >
            {reputation.risk_level} risk
          </span>
          <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-navy-300">
            {reputation.confidence} confidence
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-navy-300">{reputation.summary}</p>

      {reputation.status === "available" ? (
        <>
          {(reputation.top_complaints.length > 0 ||
            reputation.red_flags.length > 0) && (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-navy-950 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
                  Top complaints
                </p>
                <ul className="mt-3 space-y-2">
                  {reputation.top_complaints.map((item) => (
                    <li key={item} className="text-sm text-navy-200">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={16} strokeWidth={1.8} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                    Red flags
                  </p>
                </div>
                <ul className="mt-3 space-y-2">
                  {reputation.red_flags.length > 0 ? (
                    reputation.red_flags.map((item) => (
                      <li key={item} className="text-sm text-red-700">
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-red-700/80">
                      No high-signal red-flag keywords found.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {reputation.sources.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
                Public sources
              </p>
              <div className="mt-3 space-y-3">
                {reputation.sources.slice(0, 3).map((source) => (
                  <a
                    key={`${source.url}-${source.title}`}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-navy-700 p-4 transition-colors hover:border-gold-500"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy-100">
                          {source.title || source.url}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-navy-500">
                          {source.reference_type
                            ? `${source.provider} - ${source.reference_type}`
                            : source.provider}
                        </p>
                      </div>
                      <ExternalLink size={16} className="shrink-0 text-navy-400" />
                    </div>
                    {source.snippet ? (
                      <p className="mt-2 text-sm leading-6 text-navy-300">
                        {source.snippet}
                      </p>
                    ) : null}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-navy-700 bg-navy-950/40 p-4 text-sm text-navy-400">
          {reputation.summary}
        </div>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-gold-100/50 p-4 text-sm text-navy-300">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-gold-700" />
        <p>{reputation.disclaimer}</p>
      </div>
    </section>
  );
}
