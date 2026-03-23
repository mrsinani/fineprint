"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Calendar, DollarSign, FileText, Users, Shield, Clock,
  AlertTriangle, AlertCircle, CheckCircle, ChevronLeft, ChevronRight,
  PenSquare, Wallet, ClipboardList, Map,
} from "lucide-react";

const LiveClauseViewer = dynamic(
  () => import("@/components/documents/LiveClauseViewer").then((m) => m.LiveClauseViewer),
  { ssr: false },
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Party { role: string; name: string; }
interface KeyTerm { title: string; description: string; icon: string; }
interface Summary {
  overview: string;
  parties: Party[];
  key_terms: KeyTerm[];
  plain_english: string[];
}
interface RiskClause {
  title: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  quote: string;
  description: string;
  recommendation: string;
  section: string;
}
interface ActionItem {
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
}
interface StoredDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  summary: Summary;
  risk_analysis: { clauses: RiskClause[] };
  action_items: ActionItem[];
  overall_risk_score: number;
}

type Tab = "summary" | "risk" | "actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "2-digit", day: "2-digit", year: "numeric",
  });
}

function getFileTypeLabel(ft: string) {
  if (ft === "application/pdf") return "PDF";
  if (ft.includes("wordprocessingml")) return "DOCX";
  if (ft === "text/plain") return "TXT";
  return ft.split("/").pop()?.toUpperCase() ?? "Document";
}

function riskLabel(score: number) {
  if (score >= 76) return "High Risk";
  if (score >= 51) return "Medium Risk";
  if (score >= 26) return "Low-Medium Risk";
  return "Low Risk";
}

function riskScoreColor(score: number) {
  if (score >= 76) return "text-red-500";
  if (score >= 51) return "text-amber-500";
  return "text-green-600";
}

// ─── Icon helpers ──────────────────────────────────────────────────────────────

function TermIcon({ icon }: { icon: string }) {
  const cls = "text-navy-400";
  switch (icon) {
    case "calendar": return <Calendar   size={18} className={cls} />;
    case "dollar":   return <DollarSign size={18} className={cls} />;
    case "users":    return <Users      size={18} className={cls} />;
    case "shield":   return <Shield     size={18} className={cls} />;
    case "clock":    return <Clock      size={18} className={cls} />;
    default:         return <FileText   size={18} className={cls} />;
  }
}

function CategoryIcon({ category }: { category: string }) {
  const cat = category.toLowerCase();
  if (cat.includes("sign"))                              return <PenSquare    size={13} />;
  if (cat.includes("insur") || cat.includes("shield"))   return <Shield       size={13} />;
  if (cat.includes("financ") || cat.includes("payment")) return <Wallet       size={13} />;
  if (cat.includes("team"))                              return <Users        size={13} />;
  if (cat.includes("meet") || cat.includes("admin") || cat.includes("calendar"))
    return <Calendar size={13} />;
  if (cat.includes("legal") || cat.includes("negot"))    return <FileText     size={13} />;
  return <ClipboardList size={13} />;
}

function SeverityIcon({ severity }: { severity: "HIGH" | "MEDIUM" | "LOW" }) {
  if (severity === "HIGH")   return <AlertTriangle size={17} className="text-red-500   flex-shrink-0" />;
  if (severity === "MEDIUM") return <AlertCircle   size={17} className="text-amber-500 flex-shrink-0" />;
  return                            <CheckCircle   size={17} className="text-green-500 flex-shrink-0" />;
}

function SeverityBadge({ severity }: { severity: "HIGH" | "MEDIUM" | "LOW" }) {
  const styles = {
    HIGH:   "bg-red-50   text-red-600   border-red-200",
    MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
    LOW:    "bg-green-50 text-green-600 border-green-200",
  };
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-bold tracking-wide flex-shrink-0 ${styles[severity]}`}>
      {severity}
    </span>
  );
}

// ─── Donut chart ───────────────────────────────────────────────────────────────

function DonutChart({ clauses }: { clauses: RiskClause[] }) {
  const total  = Math.max(clauses.length, 1);
  const high   = clauses.filter(c => c.severity === "HIGH").length;
  const medium = clauses.filter(c => c.severity === "MEDIUM").length;
  const low    = clauses.filter(c => c.severity === "LOW").length;

  const r    = 38;
  const circ = 2 * Math.PI * r;
  const cx   = 50;
  const cy   = 50;

  const segs: { color: string; angle: number; start: number; label: string; dot: string }[] = [];
  let acc = -90;
  if (high   > 0) { const a = (high/total)*360;   segs.push({ color:"#ef4444", angle:a, start:acc, label:`High Risk: ${Math.round((high/total)*100)}%`,   dot:"bg-red-500"   }); acc+=a; }
  if (medium > 0) { const a = (medium/total)*360; segs.push({ color:"#f59e0b", angle:a, start:acc, label:`Medium Risk: ${Math.round((medium/total)*100)}%`, dot:"bg-amber-500" }); acc+=a; }
  if (low    > 0) { const a = (low/total)*360;    segs.push({ color:"#22c55e", angle:a, start:acc, label:`Low Risk: ${Math.round((low/total)*100)}%`,       dot:"bg-green-500" }); acc+=a; }

  return (
    <div className="flex items-center gap-6">
      <svg width="90" height="90" viewBox="0 0 100 100" className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef0f3" strokeWidth="15" />
        {segs.map((s, i) => {
          const dash = (s.angle / 360) * circ;
          return (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={s.color} strokeWidth="15"
              strokeDasharray={`${dash} ${circ - dash}`}
              transform={`rotate(${s.start}, ${cx}, ${cy})`}
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${s.dot}`} />
            <span className="text-navy-400">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Heatmap bar ───────────────────────────────────────────────────────────────

const SEV_COLOR = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#22c55e" } as const;

function HeatmapBar({
  clauses, selectedIdx, onSelect,
}: {
  clauses: RiskClause[];
  selectedIdx: number | null;
  onSelect: (i: number) => void;
}) {
  const total = clauses.length;
  const canPrev = selectedIdx !== null && selectedIdx > 0;
  const canNext = selectedIdx !== null ? selectedIdx < total - 1 : total > 0;

  const goNext = () => {
    if (selectedIdx === null) onSelect(0);
    else if (selectedIdx < total - 1) onSelect(selectedIdx + 1);
  };
  const goPrev = () => {
    if (selectedIdx !== null && selectedIdx > 0) onSelect(selectedIdx - 1);
  };

  // pointer position as % of bar width (centre of selected segment)
  const pointerPct =
    selectedIdx !== null ? ((selectedIdx + 0.5) / total) * 100 : null;

  return (
    <div>
      <div className="flex items-center gap-2">
        {/* Prev arrow */}
        <button
          onClick={goPrev}
          disabled={!canPrev}
          title="Previous risk"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-navy-800 text-navy-400 transition-colors hover:bg-navy-850 hover:text-navy-200 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Segments */}
        <div className="relative flex flex-1 gap-1">
          <div className="flex h-7 w-full gap-1 overflow-hidden rounded-lg">
            {clauses.map((c, i) => (
              <div
                key={i}
                title={c.title}
                onClick={() => onSelect(i === selectedIdx ? selectedIdx : i)}
                className="flex-1 cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: SEV_COLOR[c.severity],
                  opacity: selectedIdx === null || selectedIdx === i ? 1 : 0.35,
                  outline: selectedIdx === i ? "2px solid #1a2030" : "none",
                  outlineOffset: "-2px",
                }}
              />
            ))}
          </div>

          {/* Pointer triangle */}
          {pointerPct !== null && (
            <div
              className="pointer-events-none absolute -bottom-2 translate-x-[-50%]"
              style={{ left: `${pointerPct}%` }}
            >
              <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-navy-300" />
            </div>
          )}
        </div>

        {/* Next arrow */}
        <button
          onClick={goNext}
          disabled={!canNext}
          title="Next risk"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-navy-800 text-navy-400 transition-colors hover:bg-navy-850 hover:text-navy-200 disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Spacing for pointer */}
      <div className="h-3" />
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "summary", label: "SUMMARY" },
  { id: "risk",    label: "RISK ANALYSIS" },
  { id: "actions", label: "ACTION ITEMS" },
];

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [doc, setDoc]             = useState<StoredDocument | null>(null);
  const [pdfData, setPdfData]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [riskView, setRiskView]   = useState<"overview" | "heatmap">("overview");
  const [selectedClauseIdx, setSelectedClauseIdx] = useState<number | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");

  useEffect(() => {
    const raw = localStorage.getItem(`fp_doc_${id}`);
    if (!raw) { router.replace("/documents"); return; }
    setDoc(JSON.parse(raw));
    const pdf = localStorage.getItem(`fp_pdf_${id}`);
    if (pdf) setPdfData(pdf);
  }, [id, router]);

  if (!doc) return null;

  const score   = doc.overall_risk_score ?? 0;
  const clauses = doc.risk_analysis?.clauses ?? [];
  const items   = Array.isArray(doc.action_items) ? doc.action_items : [];

  const highItems = items.filter(i => i.priority === "HIGH");
  const medItems  = items.filter(i => i.priority === "MEDIUM");
  const lowItems  = items.filter(i => i.priority === "LOW");
  const filteredItems =
    priorityFilter === "ALL"    ? items      :
    priorityFilter === "HIGH"   ? highItems  :
    priorityFilter === "MEDIUM" ? medItems   : lowItems;

  const selectedClause = selectedClauseIdx !== null ? clauses[selectedClauseIdx] : null;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── File header ── */}
      <div className="px-10 pt-8 pb-5 border-b border-navy-800">
        <h1 className="text-xl font-bold text-navy-100">{doc.fileName}</h1>
        <p className="mt-0.5 text-sm text-navy-400">File type: {getFileTypeLabel(doc.fileType)}</p>
        <p className="text-sm text-navy-400">Uploaded {formatDate(doc.uploadedAt)}</p>
      </div>

      {/* ── Tab bar ── */}
      <div className="px-10 border-b border-navy-800">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setRiskView("overview");
                setSelectedClauseIdx(null);
              }}
              className={`px-4 py-3 text-xs font-semibold tracking-widest transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-gold-600 text-gold-600"
                  : "border-transparent text-navy-400 hover:text-navy-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-10 py-8">

        {/* ══════════════════ SUMMARY ══════════════════ */}
        {activeTab === "summary" && (
          <div className="max-w-2xl space-y-6">

            {/* Contract Overview */}
            {doc.summary?.overview && (
              <div className="rounded-lg border border-gold-300 bg-gold-100/30 p-5">
                <h3 className="mb-2 font-semibold text-gold-700">Contract Overview</h3>
                <p className="text-sm leading-relaxed text-gold-700">{doc.summary.overview}</p>
              </div>
            )}

            {/* Who's Involved */}
            {doc.summary?.parties?.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold text-navy-100">Who&apos;s Involved</h3>
                <div className="grid grid-cols-2 gap-3">
                  {doc.summary.parties.map((party, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-navy-800 bg-navy-850 p-4">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold-100">
                        <Users size={16} className="text-gold-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-navy-400 truncate">{party.role}</p>
                        <p className="text-sm font-semibold text-navy-100 truncate">{party.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Terms */}
            {doc.summary?.key_terms?.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold text-navy-100">Key Terms Explained</h3>
                <div className="divide-y divide-navy-800 rounded-lg border border-navy-800 overflow-hidden">
                  {doc.summary.key_terms.map((term, i) => (
                    <div key={i} className="flex gap-4 bg-white p-4">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-850">
                        <TermIcon icon={term.icon} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-100">{term.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-navy-400">{term.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plain English */}
            {doc.summary?.plain_english?.length > 0 && (
              <div className="rounded-lg border border-gold-300 bg-gold-100/30 p-5">
                <h3 className="mb-3 font-semibold text-gold-700">What This Means for You (Plain English)</h3>
                <ul className="space-y-2">
                  {doc.summary.plain_english.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-gold-700">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ RISK ANALYSIS ══════════════════ */}
        {activeTab === "risk" && (
          <div>
            {/* View toggle */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex gap-1 rounded-lg border border-navy-800 p-1">
                {(["overview", "heatmap"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => { setRiskView(v); setSelectedClauseIdx(null); }}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      riskView === v
                        ? "bg-navy-100 text-white"
                        : "text-navy-400 hover:text-navy-300"
                    }`}
                  >
                    {v === "heatmap" && <Map size={12} />}
                    {v === "overview" ? "Overview" : "Heatmap"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Overview ── */}
            {riskView === "overview" && (
              <div className="max-w-2xl space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-navy-400">Risk Distribution</h3>
                    <DonutChart clauses={clauses} />
                  </div>
                  <div>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-navy-400">Overall Risk Score</h3>
                    <span className={`text-5xl font-bold ${riskScoreColor(score)}`}>{score}</span>
                    <p className="mt-1 text-sm font-medium text-navy-300">{riskLabel(score)}</p>
                    <p className="text-xs text-navy-400">
                      {score >= 76 ? "Above average risk level" : score >= 51 ? "Moderate risk level" : "Below average risk level"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-navy-400">Clause Risk Analysis</h3>
                  {clauses.length > 0 ? (
                    <div className="space-y-3">
                      {clauses.map((clause, i) => (
                        <div key={i} className={`rounded-lg border p-4 ${
                          clause.severity === "HIGH"   ? "border-red-200   bg-red-50/40"   :
                          clause.severity === "MEDIUM" ? "border-amber-200 bg-amber-50/30" :
                          "border-green-200 bg-green-50/30"
                        }`}>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <SeverityIcon severity={clause.severity} />
                              <span className="text-sm font-semibold text-navy-100">{clause.title}</span>
                            </div>
                            <SeverityBadge severity={clause.severity} />
                          </div>
                          <p className="mb-3 text-sm leading-relaxed text-navy-300">{clause.description}</p>
                          {clause.recommendation && (
                            <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                              <span className="font-semibold">Recommendation: </span>
                              {clause.recommendation}
                            </div>
                          )}
                          {clause.section && (
                            <p className="mt-2 text-xs text-navy-500">↑ {clause.section}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-navy-400">No significant risks detected.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Heatmap ── */}
            {riskView === "heatmap" && (
              <div>
                <h2 className="text-2xl font-bold text-navy-100">Risk Analysis</h2>
                <p className="mt-1 mb-5 text-sm text-navy-400">
                  Click on a highlighted segment in the heatmap bar below to view detailed explanations for specific risks.
                </p>

                {clauses.length > 0 ? (
                  <>
                    <HeatmapBar
                      clauses={clauses}
                      selectedIdx={selectedClauseIdx}
                      onSelect={(i) => setSelectedClauseIdx(i === selectedClauseIdx ? null : i)}
                    />

                    <div className="mt-5 flex gap-4" style={{ minHeight: 520 }}>
                      {/* Left: live PDF viewer or text fallback */}
                      <div className="w-[52%] flex-shrink-0 rounded-lg border border-navy-800 bg-white overflow-hidden flex flex-col">
                        {pdfData ? (
                          <LiveClauseViewer
                            pdfBase64={pdfData}
                            highlightQuote={selectedClause?.quote ?? selectedClause?.description ?? null}
                            severity={selectedClause?.severity ?? null}
                          />
                        ) : selectedClause ? (
                          /* Text fallback when no PDF stored */
                          <div className="flex-1 overflow-y-auto p-6">
                            {selectedClause.section && (
                              <p className="mb-4 border-b border-navy-800 pb-3 text-center text-xs text-navy-400">
                                {selectedClause.section}
                              </p>
                            )}
                            <p className="mb-2 text-xs italic text-navy-500">…</p>
                            <div className={`rounded p-3 text-sm leading-relaxed ${
                              selectedClause.severity === "HIGH"   ? "border-l-2 border-red-400   bg-red-100/60"   :
                              selectedClause.severity === "MEDIUM" ? "border-l-2 border-amber-400 bg-amber-100/60" :
                              "border-l-2 border-green-400 bg-green-100/60"
                            }`}>
                              {selectedClause.quote || selectedClause.description}
                            </div>
                            <p className="mt-2 text-xs italic text-navy-500">…</p>
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center justify-center p-8 text-center">
                            <div>
                              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy-850">
                                <Map size={20} className="text-navy-400" />
                              </div>
                              <p className="text-sm text-navy-400">Click a segment or use arrows to navigate risks</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: detail panel */}
                      <div className="flex-1 overflow-y-auto">
                        {selectedClause ? (
                          <div>
                            <button
                              onClick={() => setSelectedClauseIdx(null)}
                              className="mb-4 flex items-center gap-1 text-xs font-medium text-navy-400 hover:text-navy-200 transition-colors"
                            >
                              <ChevronLeft size={14} /> All risks
                            </button>
                            <div className="mb-4 flex items-start justify-between gap-2">
                              <h3 className="text-lg font-bold text-navy-100">{selectedClause.title}</h3>
                              <SeverityBadge severity={selectedClause.severity} />
                            </div>
                            <div className={`mb-4 rounded-lg border p-4 ${
                              selectedClause.severity === "HIGH"   ? "border-red-100   bg-red-50"   :
                              selectedClause.severity === "MEDIUM" ? "border-amber-100 bg-amber-50" :
                              "border-green-100 bg-green-50"
                            }`}>
                              <div className="mb-2 flex items-center gap-2">
                                <SeverityIcon severity={selectedClause.severity} />
                                <span className="text-sm font-semibold text-navy-100">Why this is risky</span>
                              </div>
                              <p className="text-sm leading-relaxed text-navy-300">{selectedClause.description}</p>
                            </div>
                            {selectedClause.recommendation && (
                              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                                <p className="mb-1 text-sm font-semibold text-blue-700">Recommendation</p>
                                <p className="text-sm leading-relaxed text-blue-600">{selectedClause.recommendation}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {(["HIGH", "MEDIUM", "LOW"] as const).map((sev) => {
                              const group = clauses.filter(c => c.severity === sev);
                              if (group.length === 0) return null;
                              const label = sev === "HIGH" ? "All High Risks 🔺" : sev === "MEDIUM" ? "Medium Risks 🔶" : "Low Risks ✅";
                              return (
                                <div key={sev}>
                                  <h4 className="mb-2 text-sm font-bold text-navy-100">{label}</h4>
                                  <div className="space-y-2">
                                    {group.map((c) => {
                                      const globalIdx = clauses.indexOf(c);
                                      return (
                                        <button
                                          key={globalIdx}
                                          onClick={() => setSelectedClauseIdx(globalIdx)}
                                          className="w-full rounded-lg border border-navy-800 bg-navy-850 p-3 text-left transition-colors hover:bg-navy-800"
                                        >
                                          <p className="mb-1 text-xs font-semibold text-navy-200">{c.title}</p>
                                          <p className="line-clamp-2 text-xs leading-relaxed text-navy-400">{c.description}</p>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-navy-400">No clauses to display.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ ACTION ITEMS ══════════════════ */}
        {activeTab === "actions" && (
          <div className="max-w-2xl">

            {/* Priority summary cards */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {([
                { label: "High Priority",   count: highItems.length, filter: "HIGH"   as const, icon: <AlertTriangle size={17} className="text-red-500" />,   active: "border-red-300   bg-red-50"   },
                { label: "Medium Priority", count: medItems.length,  filter: "MEDIUM" as const, icon: <AlertCircle   size={17} className="text-amber-500" />, active: "border-amber-300 bg-amber-50" },
                { label: "Low Priority",    count: lowItems.length,  filter: "LOW"    as const, icon: <CheckCircle   size={17} className="text-green-500" />, active: "border-green-300 bg-green-50" },
              ]).map(({ label, count, filter, icon, active }) => (
                <button
                  key={filter}
                  onClick={() => setPriorityFilter(priorityFilter === filter ? "ALL" : filter)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    priorityFilter === filter
                      ? `${active} border-dashed`
                      : "border-navy-800 bg-white hover:bg-navy-850"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-1.5">
                    {icon}
                    <span className="text-xs font-medium text-navy-300">{label}</span>
                  </div>
                  <span className={`text-2xl font-bold ${
                    filter === "HIGH" ? "text-red-500" : filter === "MEDIUM" ? "text-amber-500" : "text-green-600"
                  }`}>{count}</span>
                </button>
              ))}
            </div>

            {/* Items list */}
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy-400">
              {priorityFilter === "ALL" ? "All Action Items" : `${priorityFilter.charAt(0) + priorityFilter.slice(1).toLowerCase()} Priority Items`}
            </h3>

            {filteredItems.length > 0 ? (
              <div className="space-y-2">
                {filteredItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-navy-800 bg-white p-4">
                    <div className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-2 border-navy-700 transition-colors hover:border-navy-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-navy-100">{item.title}</p>
                        <SeverityBadge severity={item.priority} />
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed text-navy-400">{item.description}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-navy-500">
                        <CategoryIcon category={item.category} />
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy-400">No action items found.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
