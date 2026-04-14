import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractTextFromBuffer } from "@/lib/extractText";
import { anonymizeDocument } from "@/app/utils/anonymize";

export async function POST(req: Request) {
  const { userId } = await getAuthenticatedUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const storagePath =
      typeof body.storagePath === "string" ? body.storagePath : "";
    const fileType =
      typeof body.fileType === "string" ? body.fileType : "application/pdf";

    if (!storagePath) {
      return NextResponse.json(
        { error: "No storagePath provided." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(storagePath);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: `Failed to download file: ${downloadError?.message}` },
        { status: 500 },
      );
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const text = await extractTextFromBuffer(buffer, fileType);
    const { scrubbedText } = anonymizeDocument(text);

    return NextResponse.json({ text: scrubbedText });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to extract text.",
      },
      { status: 500 },
    );
  }
}
