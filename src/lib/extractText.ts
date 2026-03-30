import mammoth from "mammoth";
import { extractText as extractPdfText } from "unpdf";

export async function extractText(file: File): Promise<string> {
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
