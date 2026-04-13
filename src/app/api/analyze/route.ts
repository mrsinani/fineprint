import { NextRequest, NextResponse } from "next/server";
import { anonymizeDocument } from "@/app/utils/anonymize";
import { deanonymizeText } from "@/app/utils/anonymize";
import { TAXONOMY } from "@/lib/taxonomy";
import { computeClauseSeverity, computeDocumentScore } from "@/lib/scoring";
import { extractText } from "@/lib/extractText";
import { extractTextFromBuffer } from "@/lib/extractText";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";
import type { UserSensitivityPreferences } from "@/lib/sensitivity";

// --- OpenAI Fetch Helper ---
async function askOpenAI(
  systemPrompt: string,
  userText: string,
  apiKey: string,
  retries = 2,
): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        max_tokens: 16384,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here is the document text to analyze:\n\n${userText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 413) {
        throw new Error("This file is too large to process. Please upload a smaller document.");
      }
      throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;
    try {
      return JSON.parse(raw);
    } catch {
      console.error(
        `Failed to parse OpenAI response (attempt ${attempt + 1}). finish_reason:`,
        data.choices[0].finish_reason,
        "raw:",
        raw?.slice(0, 500),
      );
      if (attempt < retries) continue;
      throw new Error("AI returned an incomplete response. Please try again.");
    }
  }
  throw new Error("AI returned an incomplete response. Please try again.");
}

export async function POST(req: NextRequest) {
  const { userId } = await getAuthenticatedUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let documentType = "";
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let rawDocumentText: string;

    if (contentType.includes("application/json")) {
      const body = await req.json();

      if (body.storagePath) {
        // File already in Supabase Storage -- download and extract text
        documentType = body.documentType ?? "";
        const supabase = createAdminClient();
        const { data: fileData, error: dlError } = await supabase.storage
          .from("documents")
          .download(body.storagePath);
        if (dlError || !fileData) {
          return NextResponse.json(
            { error: `Failed to download file: ${dlError?.message}` },
            { status: 500 },
          );
        }
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const mimeType = body.fileType ?? "application/pdf";
        rawDocumentText = await extractTextFromBuffer(buffer, mimeType);
      } else if (body.text) {
        // Plain text paste mode
        if (typeof body.text !== "string" || body.text.trim().length === 0) {
          return NextResponse.json(
            { error: "No text provided." },
            { status: 400 },
          );
        }
        rawDocumentText = body.text;
      } else {
        return NextResponse.json(
          { error: "No text or storagePath provided." },
          { status: 400 },
        );
      }
    } else {
      // Legacy: FormData file upload (still works for local dev / small files)
      const formData = await req.formData();
      documentType = formData.get("type") as string;

      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No file provided." },
          { status: 400 },
        );
      }
      rawDocumentText = await extractText(file);
    }

    // --- 1. SCRUB THE DATA ---
    const { scrubbedText, vault } = anonymizeDocument(rawDocumentText);

    // --- 2. GATEKEEPER CHECK (Using Scrubbed Text) ---
    const typeHint = documentType ? ` The user labeled it as "${documentType}" but accept` : " Accept";
    const gatekeeperPrompt = `You are a lenient document classifier. Determine if the provided text is a legal or contractual document (e.g. lease, contract, agreement, terms of service, policy, NDA, etc.).${typeHint} any legal/contractual document regardless of the specific type. Only reject text that is clearly NOT a legal document (e.g. a recipe, a novel, random notes). Reply EXACTLY in this JSON format: { "is_legal": boolean, "reason": "brief explanation" }`;
    const verification = await askOpenAI(
      gatekeeperPrompt,
      scrubbedText.substring(0, 3000),
      apiKey,
    );

    if (!verification.is_legal) {
      return NextResponse.json(
        {
          error: `This doesn't look like a legal document. ${verification.reason}  Either select more pages, choose a different document, or change the document type to \"Other\"`,
        },
        { status: 400 },
      );
    }

    // Truncate to ~300k chars to stay within context limits
    const truncatedText = scrubbedText.slice(0, 300000);

    // --- 3. BUILD TAXONOMY-AWARE STRUCTURED PROMPT ---
    const taxonomyJson = JSON.stringify(
      TAXONOMY.map((t) => ({ id: t.id, name: t.name, description: t.description, baseSeverity: t.baseSeverity }))
    );

    const docLabel = documentType || "legal document";
    const analysisPrompt = `You are an expert legal analyst extracting structured data from a ${docLabel}.

You have the following taxonomy of clause categories. Map each risky clause to one or more category ids from this list:
${taxonomyJson}

Return a single JSON object with EXACTLY this shape (no extra keys):
{
  "summary": {
    "overview": "string — plain-language overview of what this document does and who it binds",
    "parties": [{ "role": "string", "name": "string" }],
    "plain_english": ["string (5–10 concise bullets describing the key points of the document)"]
  },
  "clauses": [
    {
      "id": "",
      "category": ["taxonomy_id_1"],
      "severity": "HIGH",
      "quote": "verbatim 1–3 sentence excerpt copied character-for-character from the document",
      "char_start": 0,
      "char_end": 0,
      "triggered_features": [],
      "explanation": "Plain-language interpretation ONLY: what the clause does and why it matters for the reader. Do not copy or paste contract wording. Do not paraphrase the quote line-by-line. If you cannot add insight beyond the quote, write one short sentence on the practical risk instead.",
      "recommendation": "One actionable sentence telling the user what to do or watch out for.",
      "section": "Section heading or number where this clause appears",
      "confidence": "HIGH"
    }
  ],
  "action_items": [
    {
      "title": "string",
      "description": "string",
      "priority": "HIGH",
      "category": "string"
    }
  ],
  "overall_risk_score": 0
}

Rules:
- Return the top 15 most important risky clauses, prioritising highest-severity ones.
- "explanation" and "quote" must differ: the explanation is your analysis; the quote is exact contract text only. Never use the same sentences in both fields.
- Each clause "quote" MUST be verbatim — do NOT paraphrase, fix typos, or alter capitalisation.
- "char_start" and "char_end" are integer character offsets of the quote within the document text.
- "section" is the heading or section number nearest to the clause.
- "confidence" reflects how certain you are the clause is correctly identified: HIGH | MEDIUM | LOW.
- "severity" and "triggered_features" will be overridden server-side — set severity to "LOW" and triggered_features to [] as placeholders.
- "overall_risk_score" will be overridden server-side — set to 0 as a placeholder.
- "action_items" should contain 3–7 concrete actions the user should take before signing.`;

    // --- 4. SINGLE LLM CALL ---
    const rawResult = await askOpenAI(analysisPrompt, truncatedText, apiKey);

    // --- 5. POST-PROCESS: COMPUTE SEVERITY & SCORE SERVER-SIDE ---
    type RawClause = {
      id: string;
      category: string[];
      severity: string;
      quote: string;
      char_start: number;
      char_end: number;
      triggered_features: string[];
      explanation: string;
      recommendation: string;
      section: string;
      confidence: string;
    };

    // Normalize and validate each clause before scoring
    const rawClauses = Array.isArray(rawResult.clauses) ? rawResult.clauses : [];
    const clauses: RawClause[] = rawClauses
      .filter((c): c is Record<string, unknown> => c !== null && typeof c === "object")
      .map((c) => ({
        id: typeof c.id === "string" ? c.id : "",
        category: Array.isArray(c.category)
          ? c.category.filter((x): x is string => typeof x === "string")
          : [],
        severity: typeof c.severity === "string" ? c.severity : "LOW",
        quote: typeof c.quote === "string" ? c.quote : "",
        char_start: typeof c.char_start === "number" ? c.char_start : 0,
        char_end: typeof c.char_end === "number" ? c.char_end : 0,
        triggered_features: Array.isArray(c.triggered_features)
          ? c.triggered_features.filter((x): x is string => typeof x === "string")
          : [],
        explanation: typeof c.explanation === "string" ? c.explanation : "",
        recommendation: typeof c.recommendation === "string" ? c.recommendation : "",
        section: typeof c.section === "string" ? c.section : "",
        confidence: typeof c.confidence === "string" ? c.confidence : "LOW",
      }));

    for (const clause of clauses) {
      const { severity, triggered_features } = computeClauseSeverity({
        category: clause.category,
        quote: clause.quote,
      });
      clause.severity = severity;
      clause.triggered_features = triggered_features;
      clause.id = crypto.randomUUID();
    }

    rawResult.clauses = clauses;

    // Fetch user sensitivity preferences for personalized scoring
    let sensitivityPrefs: UserSensitivityPreferences | undefined;
    {
      const supabase = createAdminClient();
      const { data: userData } = await supabase
        .from("users")
        .select("sensitivity_preferences")
        .eq("id", userId)
        .single();
      if (
        userData?.sensitivity_preferences &&
        typeof userData.sensitivity_preferences === "object"
      ) {
        sensitivityPrefs =
          userData.sensitivity_preferences as UserSensitivityPreferences;
      }
    }

    rawResult.overall_risk_score = computeDocumentScore(
      clauses.map((c) => ({
        severity: c.severity as "HIGH" | "MEDIUM" | "LOW",
        category: c.category,
      })),
      sensitivityPrefs,
    );

    // --- 6. DE-ANONYMIZE AND RETURN ---
    const jsonString = JSON.stringify(rawResult);
    const restoredJsonString = deanonymizeText(jsonString, vault);
    const finalData = JSON.parse(restoredJsonString);

    return NextResponse.json(finalData);

  } catch (error) {
    console.error("Analysis route error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
