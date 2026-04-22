import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await getAuthenticatedUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: doc, error } = await supabase
    .from("documents")
    .select(
      "id, title, file_name, file_type, page_count, document_type, overall_risk_score, created_at, updated_at",
    )
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { data: analysis } = await supabase
    .from("analyses")
    .select("summary, clauses, action_items, reputation_report, overall_risk_score")
    .eq("document_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const defaultSummary = { overview: "", parties: [], plain_english: [] };

  return NextResponse.json({
    ...doc,
    analysis: analysis
      ? {
          summary: analysis.summary ?? defaultSummary,
          clauses: analysis.clauses ?? [],
          action_items: analysis.action_items ?? [],
          reputation_report: analysis.reputation_report ?? null,
          overall_risk_score:
            analysis.overall_risk_score ?? doc.overall_risk_score ?? 0,
        }
      : null,
  });
}
