import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractText as extractPdfText } from "unpdf";

const SYSTEM_PROMPT = `You are an expert in legally analyzing any sort of document: from rent contracts to terms and conditions and ToS.

Given a piece of text, your task is to do the following:
1. Generate a plain language summary of the contract, so that the user can understand the overall meaning without reading dense legal text.
2. Display the most risky clauses from the contract text with explanations, so that the user can understand exactly which parts may disadvantage them. Rank them based on level of risk: 0 being irrelevant, 1 being non-risky, 2 being moderate risky, 3 being highly risky, 4 being avoid at all costs
3. Derive a risk score from 1 to 10 based on the contract text, so the user can gauge how cautious they must be with the text before signing.
4. Generate a list of key obligations from the contract text, so that the user can understand what they are responsible for before agreeing.

Once all these steps are performed, format the data EXACTLY in this JSON structure:
{
  "summary": "insert text here",
  "risk_score": number,
  "obligations": ["1234", "abcde"],
  "risky_clauses": [["12345", 3], ["67890", 2]]
}`;

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

  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Please use .pdf, .docx, or .txt");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured on the server." },
      { status: 500 }
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
          { status: 400 }
        );
      }
      documentText = text;
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No file provided." },
          { status: 400 }
        );
      }
      documentText = await extractText(file);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Here is the document text to analyze:\n\n${documentText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status} ${errorBody}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analysis route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
