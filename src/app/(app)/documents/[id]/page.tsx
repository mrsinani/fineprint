"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface SummarySection {
  title: string;
  points: string[];
}

interface RiskyClause {
  0: string;
  1: number;
}

interface StoredDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  summary_sections: SummarySection[];
  risk_score: number;
  overall_risk_score: number;
  risky_clauses: [string, number][];
  action_items: SummarySection[];
}

type Tab = "summary" | "risk" | "actions";

const TABS: { id: Tab; label: string }[] = [
  { id: "summary", label: "SUMMARY" },
  { id: "risk", label: "RISK ANALYSIS" },
  { id: "actions", label: "ACTION ITEMS" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function getFileTypeLabel(fileType: string) {
  if (fileType === "application/pdf") return "PDF";
  if (fileType.includes("wordprocessingml")) return "DOCX";
  if (fileType === "text/plain") return "TXT";
  return fileType.split("/").pop()?.toUpperCase() ?? "Document";
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<StoredDocument | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("summary");

  useEffect(() => {
    const raw = localStorage.getItem(`fp_doc_${id}`);
    if (!raw) {
      router.replace("/documents");
      return;
    }
    setDoc(JSON.parse(raw));
  }, [id, router]);

  if (!doc) return null;

  const riskScore = doc.overall_risk_score ?? doc.risk_score ?? 1;
  const riskColor =
    riskScore > 7
      ? "bg-red-100 text-red-700"
      : riskScore > 4
        ? "bg-orange-100 text-orange-700"
        : "bg-emerald-100 text-emerald-700";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* File header */}
      <div className="px-10 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-navy-100">{doc.fileName}</h1>
        <p className="mt-1 text-sm text-navy-400">
          File type: {getFileTypeLabel(doc.fileType)}
        </p>
        <p className="text-sm text-navy-400">
          Uploaded {formatDate(doc.uploadedAt)}
        </p>
      </div>

      {/* Tab bar */}
      <div className="px-10 border-b border-navy-700">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-semibold tracking-widest transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-gold-600 text-gold-600"
                  : "border-transparent text-navy-400 hover:text-navy-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        {activeTab === "summary" && (
          <div>
            <h2 className="text-2xl font-bold text-navy-100 mb-6">Summary</h2>
            {Array.isArray(doc.summary_sections) && doc.summary_sections.length > 0 ? (
              <div className="space-y-6">
                {doc.summary_sections.map((section, i) => (
                  <div key={i}>
                    <h3 className="text-base font-bold text-navy-100 mb-2">
                      {section.title}
                    </h3>
                    <ul className="space-y-1.5 list-disc list-outside pl-5">
                      {section.points.map((point, j) => (
                        <li key={j} className="text-sm text-navy-300 leading-relaxed">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy-400">No summary available.</p>
            )}
          </div>
        )}

        {activeTab === "risk" && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-navy-100">Risk Analysis</h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${riskColor}`}
              >
                Risk Score: {riskScore}/10
              </span>
            </div>

            {Array.isArray(doc.risky_clauses) && doc.risky_clauses.length > 0 ? (
              <div className="space-y-3">
                {doc.risky_clauses.map((clause, i) => {
                  const level = clause[1];
                  let badgeClass = "bg-emerald-50 text-emerald-700 ring-emerald-200";
                  let levelText = "Standard";
                  if (level === 4) { badgeClass = "bg-red-50 text-red-700 ring-red-200"; levelText = "Critical"; }
                  else if (level === 3) { badgeClass = "bg-orange-50 text-orange-700 ring-orange-200"; levelText = "High Risk"; }
                  else if (level === 2) { badgeClass = "bg-amber-50 text-amber-700 ring-amber-200"; levelText = "Moderate"; }

                  return (
                    <div
                      key={i}
                      className="flex flex-col gap-2 sm:flex-row sm:gap-4 rounded-lg border border-navy-700 bg-navy-850 p-4"
                    >
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass}`}
                        >
                          Lvl {level}: {levelText}
                        </span>
                      </div>
                      <p className="text-sm text-navy-200 leading-relaxed">{clause[0]}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-navy-400">No significant risks detected.</p>
            )}
          </div>
        )}

        {activeTab === "actions" && (
          <div>
            <h2 className="text-2xl font-bold text-navy-100 mb-6">Action Items</h2>
            {Array.isArray(doc.action_items) && doc.action_items.length > 0 ? (
              <div className="space-y-6">
                {doc.action_items.map((section, i) => (
                  <div key={i}>
                    <h3 className="text-base font-bold text-navy-100 mb-2">
                      {section.title}
                    </h3>
                    <ul className="space-y-1.5 list-disc list-outside pl-5">
                      {section.points.map((point, j) => (
                        <li key={j} className="text-sm text-navy-300 leading-relaxed">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy-400">No action items available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
