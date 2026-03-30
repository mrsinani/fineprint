import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractText } from "@/lib/extractText";
import { ensureUserExists } from "@/lib/ensureUserExists";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserExists(userId);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const analysisResultRaw = formData.get("analysisResult") as string | null;
  const documentType = formData.get("documentType") as string;
  const pageCount = Number(formData.get("pageCount") ?? 0);
  const title = formData.get("title") as string;

  if (!file || !analysisResultRaw) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const analysisResult = JSON.parse(analysisResultRaw);
  const raw_text = await extractText(file);
  const docId = crypto.randomUUID();
  const filePath = `${userId}/${docId}/${file.name}`;

  const supabase = createAdminClient();

  // Upload file to Supabase Storage
  const fileBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, fileBuffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Insert document row
  const { error: docError } = await supabase.from("documents").insert({
    id: docId,
    user_id: userId,
    title,
    file_name: file.name,
    file_type: file.type,
    file_path: filePath,
    page_count: pageCount,
    document_type: documentType,
    overall_risk_score: analysisResult.overall_risk_score ?? null,
  });

  if (docError) {
    // Compensate: remove uploaded storage object
    await supabase.storage.from("documents").remove([filePath]);
    return NextResponse.json({ error: docError.message }, { status: 500 });
  }

  // Insert analysis row
  const { error: analysisError } = await supabase.from("analyses").insert({
    document_id: docId,
    summary: analysisResult.summary ?? null,
    clauses: analysisResult.clauses ?? null,
    action_items: analysisResult.action_items ?? null,
    overall_risk_score: analysisResult.overall_risk_score ?? null,
    raw_text: raw_text ?? null,
  });

  if (analysisError) {
    // Compensate: remove document row and storage object
    await supabase.from("documents").delete().eq("id", docId);
    await supabase.storage.from("documents").remove([filePath]);
    return NextResponse.json({ error: analysisError.message }, { status: 500 });
  }

  return NextResponse.json({ id: docId });
}
