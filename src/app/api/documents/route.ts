import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractTextFromBuffer } from "@/lib/extractText";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { userId } = await getAuthenticatedUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 20, 100);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);

  const supabase = createAdminClient();

  const { data: rows, error } = await supabase
    .from("documents")
    .select(
      "id, title, file_name, file_type, page_count, document_type, overall_risk_score, created_at, updated_at",
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rows ?? []);
}

export async function POST(req: Request) {
  const { userId } = await getAuthenticatedUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserExists(userId);

  const body = await req.json();
  const {
    storagePath,
    docId,
    fileName,
    fileType,
    analysisResult,
    documentType,
    pageCount,
    title,
    rawText,
  } = body;

  if (!storagePath || !analysisResult || !docId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Extract raw text from the file already in storage
  let raw_text: string | null = null;
  if (typeof rawText === "string" && rawText.trim().length > 0) {
    raw_text = rawText;
  } else {
    try {
      const { data: fileData, error: dlError } = await supabase.storage
        .from("documents")
        .download(storagePath);
      if (!dlError && fileData) {
        const buffer = Buffer.from(await fileData.arrayBuffer());
        raw_text = await extractTextFromBuffer(buffer, fileType ?? "application/pdf");
      }
    } catch {
      // Non-fatal: raw_text is a nice-to-have
    }
  }

  // Insert document row
  const { error: docError } = await supabase.from("documents").insert({
    id: docId,
    user_id: userId,
    title: title ?? fileName ?? "Untitled",
    file_name: fileName,
    file_type: fileType,
    file_path: storagePath,
    page_count: pageCount ?? 0,
    document_type: documentType,
    overall_risk_score: analysisResult.overall_risk_score ?? null,
  });

  if (docError) {
    await supabase.storage.from("documents").remove([storagePath]);
    return NextResponse.json({ error: docError.message }, { status: 500 });
  }

  // Insert analysis row
  const { error: analysisError } = await supabase.from("analyses").insert({
    document_id: docId,
    summary: analysisResult.summary ?? null,
    clauses: analysisResult.clauses ?? null,
    action_items: analysisResult.action_items ?? null,
    overall_risk_score: analysisResult.overall_risk_score ?? null,
    raw_text,
  });

  if (analysisError) {
    await supabase.from("documents").delete().eq("id", docId);
    await supabase.storage.from("documents").remove([storagePath]);
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }

  return NextResponse.json({ id: docId });
}
