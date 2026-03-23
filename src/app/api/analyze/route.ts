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
      model: "gpt-4o-mini", // Fast, cost-effective model for text processing
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
    throw new Error(
      "AI returned an incomplete response. The document may be too long — try excluding some pages.",
    );
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

    const summaryPrompt = `You are an expert legal summarizer. Provide a plain language summary so a layperson understands the overall intent. Format EXACTLY in this JSON format: { "summary": "insert summary here" }`;

    const obligationsPrompt = `You are a legal auditor. Extract a list of the key obligations and responsibilities the user is agreeing to. Format EXACTLY in this JSON format: { "obligations": ["obligation 1", "obligation 2"] }`;

    const riskPrompt = `You are an expert legal auditor protecting the user. Analyze the contract for risky clauses and assign an overall risk score.
      Risk Scoring Rubric for Clauses:
      * Level 1 (Standard/Low): Boilerplate clauses, standard industry practice, minimal threat.
      * Level 2 (Moderate): Favors the company but common. User should be aware, not a dealbreaker.
      * Level 3 (High): Aggressive clauses stripping normal legal rights or exposing financial risk.
      * Level 4 (Critical/Avoid): Predatory clauses giving total unchecked power.

      Derive an overall risk_score from 1 to 10 for the entire document.
      Format EXACTLY in this JSON format: { "risk_score": number, "risky_clauses": [ ["clause text or plain English explanation", severity_level_number] ] }`;

    // 3. RUN IN PARALLEL
    // Fire all three API calls simultaneously for maximum speed
    const [summaryData, obligationsData, riskData] = await Promise.all([
      askOpenAI(summaryPrompt, documentText, apiKey),
      askOpenAI(obligationsPrompt, documentText, apiKey),
      askOpenAI(riskPrompt, documentText, apiKey),
    ]);

    // 4. COMBINE AND RETURN
    // This perfectly matches the JSON structure your frontend is expecting to render in the <pre> tag
    return NextResponse.json({
      summary: summaryData.summary,
      obligations: obligationsData.obligations,
      risk_score: riskData.risk_score,
      risky_clauses: riskData.risky_clauses,
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
