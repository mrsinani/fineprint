"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, FileText, ListChecks, ShieldAlert } from "lucide-react";
import { getLocalDocumentAnalysisById } from "@/components/analysis/data";
import { ActionItemsTab } from "@/components/analysis/ActionItemsTab";
import { RiskOverviewTab } from "@/components/analysis/RiskOverviewTab";
import { SummaryTab } from "@/components/analysis/SummaryTab";
import { formatConcerningClauseSummary, formatRiskSummaryCounts, getClauseSeverityCounts } from "@/lib/scoring";
import type { DocumentAnalysisPageData } from "@/components/analysis/types";

const RiskHeatmapView = dynamic(
  () => import("@/components/analysis/RiskHeatmapView").then((m) => m.RiskHeatmapView),
  { ssr: false, loading: () => <div className="py-12 text-center text-sm text-navy-400">Loading heatmap...</div> },
);

type MainTab = "summary" | "risk" | "actions";
type RiskView = "overview" | "heatmap";

const MAIN_TABS: Array<{
  id: MainTab;
  label: string;
  icon: typeof FileText;
}> = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "risk", label: "Risk Analysis", icon: ShieldAlert },
  { id: "actions", label: "Action Items", icon: ListChecks },
];

export function DocumentAnalysisShell({
  initialDocument,
}: {
  initialDocument: DocumentAnalysisPageData;
}) {
  const [localDocument, setLocalDocument] = useState<DocumentAnalysisPageData | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>("summary");
  const [riskView, setRiskView] = useState<RiskView>("overview");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextDocument = getLocalDocumentAnalysisById(initialDocument.id);
      if (nextDocument) {
        setLocalDocument(nextDocument);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialDocument.id]);

  const document = localDocument ?? initialDocument;
  const clauseCounts = getClauseSeverityCounts(document.analysis.clauses);

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <div
        className="opacity-0"
        style={{ animation: "fp-fade-in-up 0.55s ease-out 0.05s forwards" }}
      >
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 text-sm font-medium text-navy-400 transition-colors hover:text-gold-700"
        >
          <ChevronLeft size={16} strokeWidth={1.9} />
          Back to documents
        </Link>

        <div className="mt-5 flex flex-col gap-6 rounded-[32px] border border-navy-700 bg-[linear-gradient(135deg,rgba(204,251,241,0.45),rgba(255,255,255,0.95))] p-7 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400">
              Analysis result
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold tracking-tight text-navy-100">
              {document.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy-400">
              <span>{document.file_name}</span>
              <span>{document.file_type}</span>
              <span>{document.page_count} pages</span>
              <span>Created {document.created_at}</span>
              <span className="capitalize">Source: {document.source}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/80 px-5 py-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400">
              Risk summary
            </p>
            <p className="mt-2 text-3xl font-bold text-navy-100">
              {formatConcerningClauseSummary(clauseCounts)}
            </p>
            <p className="mt-2 text-sm text-navy-500">
              {formatRiskSummaryCounts(clauseCounts)}
            </p>
          </div>
        </div>
      </div>

      <div
        className="mt-8 flex flex-wrap gap-2 rounded-2xl bg-navy-850 p-2 opacity-0"
        style={{ animation: "fp-fade-in-up 0.55s ease-out 0.12s forwards" }}
      >
        {MAIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-white text-navy-100 shadow-sm"
                  : "text-navy-400 hover:text-navy-200"
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "risk" ? (
        <div
          className="mt-6 flex gap-2 opacity-0"
          style={{ animation: "fp-fade-in-up 0.55s ease-out 0.18s forwards" }}
        >
          {(["overview", "heatmap"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setRiskView(view)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                riskView === view
                  ? "bg-gold-600 text-white"
                  : "border border-navy-700 bg-white text-navy-300 hover:border-gold-500 hover:text-gold-700"
              }`}
            >
              {view === "overview" ? "Overview view" : "Heatmap view"}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        {activeTab === "summary" ? <SummaryTab analysis={document.analysis} /> : null}
        {activeTab === "risk" && riskView === "overview" ? (
          <RiskOverviewTab analysis={document.analysis} />
        ) : null}
        {activeTab === "risk" && riskView === "heatmap" ? (
          <RiskHeatmapView analysis={document.analysis} />
        ) : null}
        {activeTab === "actions" ? <ActionItemsTab analysis={document.analysis} /> : null}
      </div>
    </div>
  );
}
