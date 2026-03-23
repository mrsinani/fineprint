import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractText as extractPdfText } from "unpdf";

// --- Text Extraction Helper ---
async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "text/plain") {
    return buffer.toString("utf-8");
  }
  if (file.type === "application/pdf") {
    const { text } = await extractPdfText(new Uint8Array(buffer), {
      mergePages: true as const,
    });
    return Array.isArray(text) ? text.join("\n\n") : text;
  }
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error("Unsupported file type. Please use .pdf, .docx, or .txt");
}

// --- OpenAI Fetch Helper ---
async function askOpenAI(
  systemPrompt: string,
  userText: string,
  apiKey: string,
) {
  console.log("Handling Prompt Message:", systemPrompt);
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
    throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const raw = data.choices[0].message.content;
  try {
    return JSON.parse(raw);
  } catch {
    console.error(
      "Failed to parse OpenAI response. finish_reason:",
      data.choices[0].finish_reason,
      "raw:",
      raw?.slice(0, 500),
    );
    throw new Error("AI returned an incomplete response. Please try again.");
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let documentText: string;

    // Handle both Text Paste (JSON) and File Upload (FormData)
    if (contentType.includes("application/json")) {
      const { text } = await req.json();
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json(
          { error: "No text provided." },
          { status: 400 },
        );
      }
      documentText = text;
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No file provided." },
          { status: 400 },
        );
      }
      documentText = await extractText(file);
    }

    // Checks only the first 3000 characters to verify it's a legal document
    const gatekeeperPrompt = `You are a strict document classifier. Determine if the provided text is a legal document (e.g., contract, Terms of Service, Privacy Policy, Lease, NDA). Reply EXACTLY in this JSON format: { "is_legal": boolean, "reason": "brief explanation" }`;
    const verification = await askOpenAI(
      gatekeeperPrompt,
      documentText.substring(0, 3000),
      apiKey,
    );

    if (!verification.is_legal) {
      return NextResponse.json(
        {
          error: `This doesn't look like a legal document. AI Reason: ${verification.reason}`,
        },
        { status: 400 },
      );
    }

    const summaryPrompt = `You are an expert legal summarizer. Break down the contract into 3-5 thematic sections, each with a clear title and 4-8 bullet points explaining key aspects in plain language a layperson can understand.
      Format EXACTLY in this JSON format: { "sections": [ { "title": "Section Title", "points": ["point 1", "point 2"] } ] }`;

    const riskPrompt = `You are an expert legal auditor protecting the user. Analyze the contract for risky clauses and assign an overall risk score.
      Risk Scoring Rubric for Clauses:
      * Level 1 (Standard/Low): Boilerplate clauses, standard industry practice, minimal threat.
      * Level 2 (Moderate): Favors the company but common. User should be aware, not a dealbreaker.
      * Level 3 (High): Aggressive clauses stripping normal legal rights or exposing financial risk.
      * Level 4 (Critical/Avoid): Predatory clauses giving total unchecked power.

      Derive an overall risk_score from 1 to 10 for the entire document.
      Format EXACTLY in this JSON format: { "risk_score": number, "risky_clauses": [ ["clause text or plain English explanation", severity_level_number] ] }`;

    const actionItemsPrompt = `You are a legal advisor helping a user review a contract. Identify specific, concrete action items the user should take before signing or in response to the contract terms. Group them into 2-4 categories with clear titles.
      Format EXACTLY in this JSON format: { "sections": [ { "title": "Category Title", "points": ["action item 1", "action item 2"] } ] }`;

    // Truncate to ~300k chars (~100 pages) to stay within context limits
    const truncatedText = documentText.slice(0, 300000);

    // 3. RUN IN PARALLEL
    const [summaryData, riskData, actionItemsData] = await Promise.all([
      askOpenAI(summaryPrompt, truncatedText, apiKey),
      askOpenAI(riskPrompt, truncatedText, apiKey),
      askOpenAI(actionItemsPrompt, truncatedText, apiKey),
    ]);

    // 4. COMBINE AND RETURN
    return NextResponse.json({
      summary_sections: summaryData.sections,
      risk_score: riskData.risk_score,
      risky_clauses: riskData.risky_clauses,
      action_items: actionItemsData.sections,
    });
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
