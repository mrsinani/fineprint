import type { AnalysisResult, DocumentAnalysisPageData } from "@/components/analysis/types";
import { RiskOverviewTab } from "@/components/analysis/RiskOverviewTab";

function pickPartyLabel(analysis: AnalysisResult, roleHint: RegExp): string | null {
  const match = analysis.parties.find((p) => roleHint.test(p.role.toLowerCase()));
  return match?.name ?? null;
}

export function SummaryTab({
  analysis,
  document,
}: {
  analysis: AnalysisResult;
  document: DocumentAnalysisPageData;
}) {
  const employer =
    pickPartyLabel(analysis, /(employer|company|counterparty)/i) ??
    analysis.parties[0]?.name ??
    null;

  const individual =
    pickPartyLabel(analysis, /(employee|candidate|you|recipient)/i) ?? null;

  const keyTakeaways = analysis.plain_english.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Clause filters + clause list + risk analysis (filters at top of page) */}
      <RiskOverviewTab analysis={analysis} />

      {/* Brief summary / at-a-glance */}
      <section
        className="rounded-[28px] border border-gold-400/60 bg-gold-100/40 p-6 opacity-0 shadow-sm sm:p-7"
        style={{ animation: "fp-fade-in-up 0.5s ease-out 0.28s forwards" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">
          Brief summary
        </p>
        <h2 className="mt-2 text-xl font-semibold text-navy-100 sm:text-2xl">
          {document.title}
        </h2>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-500 sm:text-sm">
          {employer ? <span>Counterparty: {employer}</span> : null}
          {individual ? <span>You: {individual}</span> : null}
          <span>Type: {document.file_type}</span>
          <span>{document.page_count} pages</span>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-navy-300 sm:text-[15px]">
          {analysis.overview}
        </p>

        <div className="mt-5 flex flex-col gap-4 border-t border-gold-200/70 pt-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400">
              At a glance
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-navy-300">
              {keyTakeaways.map((item, idx) => (
                <li key={`${idx}-${item}`} className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-navy-500 shadow-sm sm:px-5 sm:py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400">
              Quick takeaway
            </p>
            <p className="mt-2 text-sm leading-6">
              This section gives you a simple, plain-English view of what this contract means for
              you at a glance.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
