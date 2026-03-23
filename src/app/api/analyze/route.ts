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

    // Gatekeeper: verify this is a legal document
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

    const summaryPrompt = `You are an expert legal summarizer. Analyze this contract and extract:
1. A 1-2 sentence plain-English overview of what this contract is about
2. The parties involved — identify who "you" (the user/signer) are and who the other party is
3. 4-8 key terms or sections with clear plain-English explanations and an icon hint
4. 4-6 plain English bullet points summarizing what this contract means for the user

For icon, choose the single best match from: calendar, dollar, file, users, shield, clock

Format EXACTLY as JSON:
{
  "overview": "1-2 sentence plain English description of the contract",
  "parties": [
    { "role": "Service Provider (You)", "name": "Actual company or person name" },
    { "role": "Client", "name": "Actual company or person name" }
  ],
  "key_terms": [
    { "title": "Contract Duration", "description": "Plain English explanation", "icon": "calendar" }
  ],
  "plain_english": ["bullet point 1", "bullet point 2"]
}`;

    const riskPrompt = `You are an expert legal auditor protecting the user. Identify every significant clause and assess its risk to the user.

For each clause:
- Extract a short, meaningful title
- Assign severity: HIGH (aggressive, strips rights, major financial risk), MEDIUM (favors other party, user should be aware), or LOW (standard/boilerplate)
- Quote the relevant sentence(s) directly from the document (verbatim, max 2-3 sentences)
- Explain the risk in plain English
- Give a specific, actionable recommendation
- Note the section reference if identifiable (e.g. "Section 8.2")

Sort by severity descending (HIGH first).

Format EXACTLY as JSON:
{
  "clauses": [
    {
      "title": "Termination Clause",
      "severity": "HIGH",
      "quote": "Either party may terminate this Agreement at any time with 7 days written notice.",
      "description": "The contract can be terminated with only 7 days notice, which is far shorter than industry standard (30 days), leaving you little time to transition.",
      "recommendation": "Negotiate for a minimum 30-day notice period to allow adequate time for transition.",
      "section": "Section 8.2"
    }
  ]
}`;

    const actionItemsPrompt = `You are a legal advisor reviewing a contract on behalf of the user. Identify 5-10 specific, concrete action items the user should take before signing or in response to this contract.

For each action item provide:
- A clear, actionable title (start with a verb)
- A brief description of why this matters
- Priority: HIGH (must do before signing), MEDIUM (important but not blocking), or LOW (nice to have)
- Category: one of Signature, Insurance, Legal, Financial, Administrative, Negotiation, Team, Meeting

Sort by priority (HIGH first), then by importance within each priority.

Format EXACTLY as JSON:
{
  "items": [
    {
      "title": "Review and sign contract",
      "description": "Sign the agreement and return to the other party within the required timeframe.",
      "priority": "HIGH",
      "category": "Signature"
    }
  ]
}`;

    const truncatedText = documentText.slice(0, 300000);

    const [summaryData, riskData, actionItemsData] = await Promise.all([
      askOpenAI(summaryPrompt, truncatedText, apiKey),
      askOpenAI(riskPrompt, truncatedText, apiKey),
      askOpenAI(actionItemsPrompt, truncatedText, apiKey),
    ]);

    return NextResponse.json({
      summary: {
        overview: summaryData.overview,
        parties: summaryData.parties ?? [],
        key_terms: summaryData.key_terms ?? [],
        plain_english: summaryData.plain_english ?? [],
      },
      risk_analysis: {
        clauses: riskData.clauses ?? [],
      },
      action_items: actionItemsData.items ?? [],
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
