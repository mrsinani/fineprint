"use client";

import { useState, useCallback, useEffect } from "react";
import * as mammoth from "mammoth";
import { UploadZone, PendingFileRow, DocumentPreview } from "@/components/upload";

type UploadStatus = "pending" | "uploading" | "done" | "error";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadPage() {
  // --- File State ---
  const [file, setFile] = useState<File | null>(null);
  const [fileStatus, setFileStatus] = useState<UploadStatus>("pending");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- Analysis State ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  // --- File Handlers ---
  const handleFileSelect = useCallback((selected: File) => {
    setFile(selected);
    setFileStatus("pending");
    setAnalysisResult(null);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setFileStatus("pending");
    setAnalysisResult(null);
  }, []);

  const simulateFileUpload = useCallback(() => {
    if (!file) return;
    setFileStatus("uploading");
    setTimeout(() => setFileStatus("done"), 1500);
  }, [file]);

  // --- Text Extraction Helper ---
  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "text/plain") {
      return await file.text();
    }
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    throw new Error("Unsupported file type for text extraction. Please use .txt or .docx");
  };

  // --- Analyze Handler ---
  const isReadyToAnalyze = fileStatus === "done";

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const documentText = await extractTextFromFile(file);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are an expert in legally analyzing any sort of document: from rent contracts to terms and conditions and ToS.

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
}`
            },
            {
              role: "user",
              content: `Here is the document text to analyze:\n\n${documentText}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const parsedContent = JSON.parse(data.choices[0].message.content);
      
      setAnalysisResult(parsedContent);

    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error instanceof Error ? error.message : "Failed to analyze document.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div
        className="opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl">
          Upload file
        </h1>
        <p className="mt-2 text-[15px] text-navy-400">
          Drop a contract to start your analysis.
        </p>
      </div>

      <div
        className="mt-10 flex flex-col gap-6 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.25s forwards" }}
      >
        <UploadZone onFileSelect={handleFileSelect} />

        {file && (
          <>
            <div>
              <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.12em] text-navy-400">
                Selected file
              </h2>
              <PendingFileRow
                name={file.name}
                size={formatFileSize(file.size)}
                status={fileStatus}
                onRemove={handleRemoveFile}
              />
              {fileStatus === "pending" && (
                <button
                  type="button"
                  onClick={simulateFileUpload}
                  className="mt-4 rounded-lg bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gold-700"
                >
                  Upload &amp; analyze
                </button>
              )}
            </div>

            <div>
              <DocumentPreview
                fileName={file.name}
                fileType={file.type}
                fileUrl={previewUrl}
                file={file}
                placeholder={fileStatus === "pending" || fileStatus === "uploading"}
              />
            </div>
          </>
        )}
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <div className="mt-8 rounded-xl bg-navy-100 p-6 text-sm text-green-400 overflow-x-auto">
          <h3 className="text-white font-bold mb-4">Analysis Result (Raw JSON)</h3>
          <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
        </div>
      )}

      {/* Floating Analyze Button */}
      {isReadyToAnalyze && !analysisResult && (
        <div className="fixed bottom-8 right-8 flex transform justify-center">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 rounded-full bg-gold-600 px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-gold-700 hover:shadow-2xl disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isAnalyzing ? (
              <span className="animate-pulse">Analyzing...</span>
            ) : (
              <>
                <span>Analyze Content</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
