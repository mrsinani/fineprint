import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) notFound();
  await ensureUserExists(userId);

  const supabase = createAdminClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (!doc) notFound();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("document_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const riskScore = analysis?.overall_risk_score ?? doc.overall_risk_score;
  const summary = analysis?.summary as
    | { overview?: string; plain_english?: string[] }
    | null;
  const clauses = analysis?.clauses as any[] | null;
  const actionItems = analysis?.action_items as any[] | null;

  const createdAt = new Date(doc.created_at as string).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <div className="mx-auto max-w-3xl px-8 py-12 pb-32">
      {/* Back link */}
      <div
        className="opacity-0"
        style={{ animation: "fp-fade-in-up 0.5s ease-out 0s forwards" }}
      >
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-sm text-navy-400 transition-colors hover:text-navy-200"
        >
          <ArrowLeft size={16} />
          Back to documents
        </Link>
      </div>

      {/* Document header */}
      <div
        className="mt-6 flex flex-col gap-4 border-b border-navy-700 pb-6 opacity-0"
        style={{ animation: "fp-fade-in-up 0.5s ease-out 0.1s forwards" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-100 sm:text-3xl">
              {doc.title ?? doc.file_name ?? "Untitled"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-400">
              {doc.document_type && <span>{doc.document_type}</span>}
              {doc.page_count != null && (
                <span>{doc.page_count} pages</span>
              )}
              <span>{createdAt}</span>
            </div>
          </div>

          {riskScore != null && (
            <div className="flex shrink-0 flex-col items-center gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-navy-400">
                Risk
              </span>
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg ${
                  Number(riskScore) > 66
                    ? "bg-red-500"
                    : Number(riskScore) > 33
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                }`}
              >
                {riskScore}
              </span>
            </div>
          )}
        </div>
      </div>

      {!analysis ? (
        <div
          className="mt-12 rounded-xl border border-dashed border-navy-700 py-16 text-center opacity-0"
          style={{ animation: "fp-fade-in-up 0.5s ease-out 0.2s forwards" }}
        >
          <p className="text-sm text-navy-400">
            No analysis found for this document.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {/* Summary */}
          {summary?.overview && (
            <div
              className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm opacity-0"
              style={{
                animation: "fp-fade-in-up 0.5s ease-out 0.2s forwards",
              }}
            >
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-400">
                Plain Language Summary
              </h3>
              <p className="leading-relaxed text-navy-100">
                {summary.overview}
              </p>
            </div>
          )}

          {/* Key Points */}
          {Array.isArray(summary?.plain_english) &&
            summary.plain_english.length > 0 && (
              <div
                className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm opacity-0"
                style={{
                  animation: "fp-fade-in-up 0.5s ease-out 0.3s forwards",
                }}
              >
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-400">
                  Key Points
                </h3>
                <ul className="list-inside list-disc space-y-2 text-navy-100">
                  {summary.plain_english.map(
                    (bullet: string, i: number) => (
                      <li key={i}>{bullet}</li>
                    ),
                  )}
                </ul>
              </div>
            )}

          {/* Clauses */}
          <div
            className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm opacity-0"
            style={{
              animation: "fp-fade-in-up 0.5s ease-out 0.4s forwards",
            }}
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-400">
              Risky Clauses Detected
            </h3>
            <div className="space-y-4">
              {Array.isArray(clauses) && clauses.length > 0 ? (
                clauses.map((clause: any, i: number) => {
                  const sev = clause.severity;
                  const badgeColors =
                    sev === "HIGH"
                      ? "bg-red-500/10 text-red-400 ring-red-500/20"
                      : sev === "MEDIUM"
                        ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20";

                  return (
                    <div
                      key={clause.id ?? i}
                      className="flex flex-col gap-3 rounded-lg border border-navy-800 bg-navy-900 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeColors}`}
                        >
                          {sev}
                        </span>
                        {clause.section && (
                          <span className="text-xs text-navy-500">
                            &sect; {clause.section}
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-navy-200">
                        {clause.explanation}
                      </p>
                      {clause.quote && (
                        <p className="border-l-2 border-navy-700 pl-3 text-xs italic text-navy-400">
                          &ldquo;{clause.quote}&rdquo;
                        </p>
                      )}
                      {clause.recommendation && (
                        <p className="text-xs font-medium text-navy-300">
                          {clause.recommendation}
                        </p>
                      )}
                      {Array.isArray(clause.triggered_features) &&
                        clause.triggered_features.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {clause.triggered_features.map(
                              (feat: string, fi: number) => (
                                <span
                                  key={fi}
                                  className="inline-flex items-center rounded-full bg-navy-800 px-2 py-0.5 text-[11px] text-navy-400 ring-1 ring-navy-700"
                                >
                                  {feat}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-navy-400">
                  No significant risks detected in this document.
                </p>
              )}
            </div>
          </div>

          {/* Action Items */}
          {Array.isArray(actionItems) && actionItems.length > 0 && (
            <div
              className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm opacity-0"
              style={{
                animation: "fp-fade-in-up 0.5s ease-out 0.5s forwards",
              }}
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-400">
                Action Items
              </h3>
              <div className="space-y-4">
                {actionItems.map((item: any, i: number) => {
                  const prio = item.priority;
                  const prioBadge =
                    prio === "HIGH"
                      ? "bg-red-500/10 text-red-400 ring-red-500/20"
                      : prio === "MEDIUM"
                        ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20";

                  return (
                    <div
                      key={i}
                      className="flex flex-col gap-2 rounded-lg border border-navy-800 bg-navy-900 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${prioBadge}`}
                        >
                          {prio}
                        </span>
                        <span className="text-sm font-semibold text-navy-100">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-navy-300">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
