import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractTextFromBuffer } from "@/lib/extractText";
import { ensureUserExists } from "@/lib/ensureUserExists";

export async function POST(req: Request) {
  const { userId } = await auth();
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
  } = body;

  if (!storagePath || !analysisResult || !docId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Extract raw text from the file already in storage
  let raw_text: string | null = null;
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
