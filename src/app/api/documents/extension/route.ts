import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { userId } = await getAuthenticatedUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserExists(userId);

  const body = await req.json();
  const { title, sourceUrl, rawText, analysisResult, documentType } = body;

  if (!title || !sourceUrl || !analysisResult) {
    return NextResponse.json(
      { error: "Missing required fields: title, sourceUrl, analysisResult" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const docId = crypto.randomUUID();

  const { error: docError } = await supabase.from("documents").insert({
    id: docId,
    user_id: userId,
    title,
    file_name: new URL(sourceUrl).hostname,
    file_type: "webpage",
    file_path: null,
    page_count: 1,
    document_type: documentType ?? "terms_of_service",
    overall_risk_score: analysisResult.overall_risk_score ?? null,
    source_url: sourceUrl,
  });

  if (docError) {
    return NextResponse.json({ error: docError.message }, { status: 500 });
  }

  const { error: analysisError } = await supabase.from("analyses").insert({
    document_id: docId,
    summary: analysisResult.summary ?? null,
    clauses: analysisResult.clauses ?? null,
    action_items: analysisResult.action_items ?? null,
    overall_risk_score: analysisResult.overall_risk_score ?? null,
    raw_text: rawText ?? null,
  });

  if (analysisError) {
    await supabase.from("documents").delete().eq("id", docId);
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }

  return NextResponse.json({ id: docId });
}
