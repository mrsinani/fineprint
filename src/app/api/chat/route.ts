import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { getAuthenticatedUser } from "@/lib/auth";

type ChatInputMessage = {
  role: "user" | "assistant";
  content: string;
};

type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const MAX_DOCUMENT_TEXT_CHARS = 80000;

function truncateDocumentText(text: string) {
  if (text.length <= MAX_DOCUMENT_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_DOCUMENT_TEXT_CHARS)}\n\n[Document text truncated for length.]`;
}

function getRiskProfileSummary(record: Record<string, unknown> | null) {
  if (!record) return null;

  const candidates = [
    "risk_profile",
    "risk_sensitivity",
    "risk_tolerance",
    "risk_preference",
    "risk_appetite",
  ];

  for (const key of candidates) {
    const value = record[key];
    if (!value) continue;

    if (typeof value === "string") {
      return `${key}: ${value}`;
    }

    if (typeof value === "object") {
      return `${key}: ${JSON.stringify(value)}`;
    }
  }

  return null;
}

async function askOpenAI(messages: ChatInputMessage[], systemPrompt: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("AI returned an empty response.");
  }

  return reply;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  try {
    const { userId } = await getAuthenticatedUser(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserExists(userId);

    const body = (await req.json()) as {
      documentId?: unknown;
      messages?: unknown;
    };

    const documentId =
      typeof body.documentId === "string" ? body.documentId.trim() : "";
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];

    const messages = rawMessages.flatMap((message): ChatInputMessage[] => {
      if (!message || typeof message !== "object") return [];

      const role = message.role;
      const content = message.content;

      if (
        (role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.trim().length > 0
      ) {
        return [{ role, content: content.trim() }];
      }

      return [];
    });

    if (!documentId || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing documentId or messages." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, title, file_name, document_type")
      .eq("id", documentId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (documentError) {
      throw new Error(documentError.message);
    }

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("raw_text, clauses, summary")
      .eq("document_id", documentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (analysisError) {
      throw new Error(analysisError.message);
    }

    if (!analysis) {
      return NextResponse.json(
        { error: "No analysis found for this document." },
        { status: 404 },
      );
    }

    const { data: userRecord } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const riskProfileSummary = getRiskProfileSummary(
      userRecord && typeof userRecord === "object"
        ? (userRecord as Record<string, unknown>)
        : null,
    );

    const systemPrompt = [
      "You are a contract analysis assistant reviewing a specific document.",
      `Document metadata: ${JSON.stringify({
        id: document.id,
        title: document.title,
        file_name: document.file_name,
        document_type: document.document_type,
      })}`,
      `Structured analysis JSON: ${JSON.stringify({
        summary: analysis.summary ?? null,
        clauses: analysis.clauses ?? [],
      })}`,
      `Raw document text: ${truncateDocumentText(
        typeof analysis.raw_text === "string" ? analysis.raw_text : "",
      )}`,
      `User risk sensitivity profile: ${riskProfileSummary ?? "Not provided."}`,
      "Answer only questions about this specific document.",
      "If the answer is not supported by the document text or structured analysis, say that clearly.",
      "Keep answers practical, concise, and grounded in the contract language.",
      "Do not answer unrelated general questions as if they are about this document.",
    ].join("\n\n");

    const reply = await askOpenAI(messages, systemPrompt, apiKey);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
