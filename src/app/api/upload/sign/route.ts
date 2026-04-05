import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType } = await req.json();
    if (!fileName) {
      return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
    }

    const safeFileName = sanitizeFileName(String(fileName));
    if (!safeFileName) {
      return NextResponse.json({ error: "Invalid fileName" }, { status: 400 });
    }

    const docId = crypto.randomUUID();
    const storagePath = `${userId}/${docId}/${safeFileName}`;

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUploadUrl(storagePath);

    if (error) {
      return NextResponse.json(
        { error: `Failed to create signed upload URL: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      storagePath,
      docId,
      fileType: fileType ?? null,
    });
  } catch (error) {
    console.error("Upload sign route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create signed upload URL.",
      },
      { status: 500 },
    );
  }
}
