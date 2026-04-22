"use client";

import {
  AlertTriangle,
  CalendarDays,
  FileText,
  Scale,
  Shield,
  Users,
} from "lucide-react";
import { CounterpartyReputationCard } from "@/components/analysis/CounterpartyReputationCard";
import type { AnalysisResult } from "@/components/analysis/types";

const TERM_ICONS = {
  calendar: CalendarDays,
  scale: Scale,
  shield: Shield,
  "file-text": FileText,
  "alert-triangle": AlertTriangle,
  users: Users,
} as const;

export function SummaryTab({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="space-y-8">
      <section
        className="rounded-[28px] border border-gold-400/70 bg-gold-100/40 p-6 opacity-0 shadow-sm"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.05s forwards" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">
          Contract overview
        </p>
        <p className="mt-3 max-w-4xl text-[15px] leading-7 text-navy-200">
          {analysis.overview}
        </p>
      </section>

      <section
        className="opacity-0"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.12s forwards" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-navy-100">
            Who&apos;s involved
          </h2>
          <span className="text-sm text-navy-500">{analysis.parties.length} entries</span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {analysis.parties.map((party) => (
            <div
              key={`${party.role}-${party.name}`}
              className="rounded-2xl border border-navy-700 bg-white p-5 shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400">
                {party.role}
              </p>
              <p className="mt-2 text-base font-medium text-navy-100">{party.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="opacity-0"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.2s forwards" }}
      >
        <h2 className="font-display text-2xl font-semibold text-navy-100">
          Key terms explained
        </h2>

        <div className="mt-4 space-y-4">
          {analysis.key_terms.map((term) => {
            const Icon = TERM_ICONS[term.icon];

            return (
              <div
                key={term.id}
                className="flex gap-4 rounded-2xl border border-navy-700 bg-white p-5 shadow-sm"
              >
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-850 text-gold-700">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-navy-100">{term.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-navy-300">
                    {term.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className="rounded-[28px] border border-navy-700 bg-white p-6 opacity-0 shadow-sm"
        style={{ animation: "fp-fade-in-up 0.45s ease-out 0.28s forwards" }}
      >
        <h2 className="font-display text-2xl font-semibold text-navy-100">
          What this means for you
        </h2>
        <ul className="mt-4 space-y-3">
          {analysis.plain_english.map((item, index) => (
            <li key={`${index}-${item}`} className="flex gap-3 text-sm leading-6 text-navy-300">
              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold-500" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {analysis.reputation ? (
        <section
          className="opacity-0"
          style={{ animation: "fp-fade-in-up 0.45s ease-out 0.36s forwards" }}
        >
          <CounterpartyReputationCard reputation={analysis.reputation} />
        </section>
      ) : null}
    </div>
  );
}
