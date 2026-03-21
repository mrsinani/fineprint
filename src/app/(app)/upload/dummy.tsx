"use client";

import { useState, useCallback, useEffect } from "react";
import * as mammoth from "mammoth";
import { UploadZone, PendingFileRow, DocumentPreview } from "@/components/upload";

type UploadStatus = "pending" | "uploading" | "done" | "error";
type InputMode = "file" | "text";

interface RiskyClause {
  quote: string;
  explanation: string;
  severity: number;
}

interface AnalysisResult {
  summary: string;
  obligations: string[];
  risky_clauses: RiskyClause[];
  overall_risk_score?: number; // Calculated on the frontend
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadPage() {
  const [mode, setMode] = useState<InputMode>("file");

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileStatus, setFileStatus] = useState<UploadStatus>("pending");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Text state
  const [pastedText, setPastedText] = useState("");

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

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

  const canAnalyze = mode === "file" ? fileStatus === "done" : pastedText.trim().length > 0;

  // --- Text Extraction Helper ---
  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "text/plain") return await file.text();
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    throw new Error("Unsupported file type for text extraction. Please use .txt or .docx");
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let documentText = "";
      
      // Determine text source based on current mode
      if (mode === "file") {
        if (!file) return;
        documentText = await extractTextFromFile(file);
      } else {
        if (!pastedText.trim()) return;
        documentText = pastedText;
      }

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
              content: `You are an expert legal analyzer.
Find any risky clauses in the text that disadvantage the user. 
For each clause found, assign a severity score from 1 to 4 using this STRICT rubric:
1 (Low Risk): Standard annoyances, minor fees, standard mutual indemnification.
2 (Moderate Risk): Automatic renewals without notice, one-sided cancellation fees.
3 (High Risk): Forced arbitration, class action waivers, aggressive data selling.
4 (Extreme Risk): Unilateral rights to change terms without notice, waiving fundamental legal rights, predatory financial penalties.

Return the data EXACTLY in this JSON format:
{
  "summary": "plain language summary",
  "obligations": ["list of user duties"],
  "risky_clauses": [
    {
      "quote": "exact text from contract",
      "explanation": "why it's bad",
      "severity": 3
    }
  ]
}`
            },
            {
              role: "user",
              content: `Here is the document text to analyze:\n\n${documentText}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);

      const data = await response.json();
      const parsedContent: AnalysisResult = JSON.parse(data.choices[0].message.content);
      
      // --- SEVERITY MATH CALCULATION ---
      let calculatedScore = 1; // Base score (safe)
      
      if (parsedContent.risky_clauses && parsedContent.risky_clauses.length > 0) {
        const maxSeverity = Math.max(...parsedContent.risky_clauses.map(c => c.severity));
        const clauseCount = parsedContent.risky_clauses.length;

        // Base score on the absolute worst clause found
        if (maxSeverity === 4) calculatedScore = 8;
        else if (maxSeverity === 3) calculatedScore = 5;
        else if (maxSeverity === 2) calculatedScore = 3;
        else if (maxSeverity === 1) calculatedScore = 2;

        // Add volume penalty (death by a thousand papercuts)
        const volumePenalty = Math.min(clauseCount * 0.5, 2); // Max +2 points
        calculatedScore += volumePenalty;
        
        // Cap at 10 and round
        calculatedScore = Math.min(Math.round(calculatedScore), 10);
      }

      parsedContent.overall_risk_score = calculatedScore;
      setAnalysisResult(parsedContent);

    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error instanceof Error ? error.message : "Failed to analyze document.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const switchMode = (next: InputMode) => {
    setMode(next);
    setAnalysisResult(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-8 py-12 pb-32">
      <div
        className="opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl">
          Analyze contract
        </h1>
        <p className="mt-2 text-[15px] text-navy-400">
          Upload a file or paste contract text to start your analysis.
        </p>
      </div>

      {/* Mode toggle */}
      <div
        className="mt-8 flex gap-1 rounded-lg bg-navy-850 p-1 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.2s forwards" }}
      >
        {(["file", "text"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => switchMode(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === tab
                ? "bg-white text-navy-100 shadow-sm"
                : "text-navy-400 hover:text-navy-200"
            }`}
          >
            {tab === "file" ? "Upload File" : "Paste Text"}
          </button>
        ))}
      </div>

      <div
        className="mt-6 flex flex-col gap-6 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.25s forwards" }}
      >
        {mode === "file" ? (
          <>
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
          </>
        ) : (
          <div>
            <textarea
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                setAnalysisResult(null);
              }}
              placeholder="Paste your contract text here..."
              rows={14}
              className="w-full resize-y rounded-xl border border-navy-700 bg-navy-900 px-5 py-4 text-sm text-navy-100 placeholder:text-navy-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
            <p className="mt-2 text-right text-xs text-navy-500">
              {pastedText.length.toLocaleString()} characters
            </p>
          </div>
        )}
      </div>

      {/* --- RESULTS DASHBOARD --- */}
      {analysisResult && (
        <div 
          className="mt-12 flex flex-col gap-8 opacity-0"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0s forwards" }}
        >
          <div className="flex items-center justify-between border-b border-navy-700 pb-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-100">
              Analysis Results
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-navy-400 uppercase tracking-wider">Risk Score</span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white shadow-lg ${
                Number(analysisResult.overall_risk_score) > 7 ? 'bg-red-500' : Number(analysisResult.overall_risk_score) > 4 ? 'bg-orange-500' : 'bg-emerald-500'
              }`}>
                {analysisResult.overall_risk_score}
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-400">Plain Language Summary</h3>
            <p className="text-navy-100 leading-relaxed">{analysisResult.summary}</p>
          </div>

          {/* Obligations Box */}
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-400">Key Obligations</h3>
            <ul className="list-inside list-disc space-y-2 text-navy-100">
              {Array.isArray(analysisResult.obligations) ? analysisResult.obligations.map((ob: string, i: number) => (
                <li key={i}>{ob}</li>
              )) : <li>No specific obligations detected.</li>}
            </ul>
          </div>

          {/* Risky Clauses Box */}
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-400">Risky Clauses Detected</h3>
            <div className="space-y-4">
              {Array.isArray(analysisResult.risky_clauses) && analysisResult.risky_clauses.length > 0 ? (
                analysisResult.risky_clauses.map((clause: RiskyClause, i: number) => {
                  const level = clause.severity;
                  let badgeColors = "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20";
                  let levelText = "Standard";
                  
                  if (level === 4) { badgeColors = "bg-red-500/10 text-red-400 ring-red-500/20"; levelText = "Critical"; }
                  else if (level === 3) { badgeColors = "bg-orange-500/10 text-orange-400 ring-orange-500/20"; levelText = "High Risk"; }
                  else if (level === 2) { badgeColors = "bg-amber-500/10 text-amber-400 ring-amber-500/20"; levelText = "Moderate"; }

                  return (
                    <div key={i} className="flex flex-col gap-3 sm:flex-row sm:gap-4 rounded-lg bg-navy-900 p-5 border border-navy-800">
                      <div className="flex-shrink-0 pt-0.5">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeColors}`}>
                          Lvl {level}: {levelText}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-navy-300 italic border-l-2 border-navy-700 pl-3">"{clause.quote}"</span>
                        <p className="text-sm text-navy-100 leading-relaxed mt-1">
                          <span className="font-semibold">Why it matters:</span> {clause.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-navy-400">No significant risks detected in this document.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {canAnalyze && !analysisResult && (
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