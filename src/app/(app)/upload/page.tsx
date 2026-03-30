"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { UploadZone } from "@/components/upload/UploadZone";
import { PendingFileRow } from "@/components/upload/PendingFileRow";
import { DocumentTypeSelector } from "@/components/documents/DocumentTypeSelector";

const DocumentPreview = dynamic(
  () =>
    import("@/components/upload/DocumentPreview").then((m) => m.DocumentPreview),
  { ssr: false }
);

type UploadStatus = "pending" | "uploading" | "done" | "error";
type InputMode = "file" | "text";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadPage() {
  const [mode, setMode] = useState<InputMode>("file");

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [fileStatus, setFileStatus] = useState<UploadStatus>("pending");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Tracking PDF Pages
  const [excludedPages, setExcludedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Text state
  const [pastedText, setPastedText] = useState("");

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Record<string, any> | null>(null);

  // Document Type
  const [documentType, setDocumentType] = useState("");

  useEffect(() => {
    if (!file || file.type !== 'application/pdf') {
      setAnalysisFile(file);
      return;
    }
    
    if (excludedPages.length === 0) {
      setAnalysisFile(file);
      return;
    }

    const modifyPdf = async () => {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      const sortedExcluded = [...excludedPages].sort((a, b) => b - a);
      
      for (const pageNum of sortedExcluded) {
        if (pageNum >= 1 && pageNum <= pages.length) {
          pdfDoc.removePage(pageNum - 1);
        }
      }
      
      const modifiedBytes = await pdfDoc.save();
      
      const modifiedFile = new File(
        [modifiedBytes as any], 
        file.name, 
        { type: file.type }
      );
      
      setAnalysisFile(modifiedFile);
    };
    
    modifyPdf();
  }, [excludedPages, file]);

  const handleFileSelect = useCallback((selected: File) => {
    setFile(selected);
    setAnalysisFile(selected);
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

  const canAnalyze =
    mode === "file"
      ? fileStatus === "done" && !(totalPages > 0 && excludedPages.length === totalPages)
      : pastedText.trim().length > 0;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let response: Response;

      if (mode === "file") {
        if (!analysisFile) return;
        const formData = new FormData();
        formData.append("file", analysisFile);
        formData.append("type", documentType);
        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pastedText }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      setAnalysisResult(data);
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
      <DocumentTypeSelector value={documentType} onChange={setDocumentType}/>
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
          {!file && 
            <UploadZone onFileSelect={handleFileSelect} />
          }

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
                    onExcludedPagesChange={setExcludedPages}
                    onNumPagesChange={setTotalPages}
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

      {/* --- RESULTS --- */}
      {analysisResult && (
        <div 
          className="mt-12 flex flex-col gap-8 opacity-0"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0s forwards" }}
        >
          {/* Header with risk score */}
          <div className="flex items-center justify-between border-b border-navy-700 pb-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-100">
              Analysis Results
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-navy-400 uppercase tracking-wider">Risk Score</span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white shadow-lg ${
                Number(analysisResult.overall_risk_score) > 66
                  ? 'bg-red-500'
                  : Number(analysisResult.overall_risk_score) > 33
                  ? 'bg-orange-500'
                  : 'bg-emerald-500'
              }`}>
                {analysisResult.overall_risk_score}
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-400">Plain Language Summary</h3>
            <p className="text-navy-100 leading-relaxed">{analysisResult.summary?.overview}</p>
          </div>

          {/* Plain English Bullets */}
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-400">Key Points</h3>
            <ul className="list-inside list-disc space-y-2 text-navy-100">
              {Array.isArray(analysisResult.summary?.plain_english)
                ? analysisResult.summary.plain_english.map((bullet: string, i: number) => (
                    <li key={i}>{bullet}</li>
                  ))
                : <li>No key points extracted.</li>}
            </ul>
          </div>

          {/* Clauses Box */}
          <div className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-400">Risky Clauses Detected</h3>
            <div className="space-y-4">
              {Array.isArray(analysisResult.clauses) && analysisResult.clauses.length > 0 ? (
                analysisResult.clauses.map((clause: any, i: number) => {
                  const sev = clause.severity;
                  const badgeColors =
                    sev === "HIGH"
                      ? "bg-red-500/10 text-red-400 ring-red-500/20"
                      : sev === "MEDIUM"
                      ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20";

                  return (
                    <div key={clause.id ?? i} className="flex flex-col gap-3 rounded-lg bg-navy-900 p-4 border border-navy-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeColors}`}>
                          {sev}
                        </span>
                        {clause.section && (
                          <span className="text-xs text-navy-500">§ {clause.section}</span>
                        )}
                      </div>
                      <p className="text-sm text-navy-200 leading-relaxed">{clause.explanation}</p>
                      {clause.quote && (
                        <p className="text-xs italic text-navy-400 border-l-2 border-navy-700 pl-3">
                          &ldquo;{clause.quote}&rdquo;
                        </p>
                      )}
                      {clause.recommendation && (
                        <p className="text-xs text-navy-300 font-medium">{clause.recommendation}</p>
                      )}
                      {Array.isArray(clause.triggered_features) && clause.triggered_features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {clause.triggered_features.map((feat: string, fi: number) => (
                            <span key={fi} className="inline-flex items-center rounded-full bg-navy-800 px-2 py-0.5 text-[11px] text-navy-400 ring-1 ring-navy-700">
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-navy-400">No significant risks detected in this document.</p>
              )}
            </div>
          </div>

          {/* Action Items Box */}
          {Array.isArray(analysisResult.action_items) && analysisResult.action_items.length > 0 && (
            <div className="rounded-xl border border-navy-700 bg-navy-850 p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-navy-400">Action Items</h3>
              <div className="space-y-4">
                {analysisResult.action_items.map((item: any, i: number) => {
                  const prio = item.priority;
                  const prioBadge =
                    prio === "HIGH"
                      ? "bg-red-500/10 text-red-400 ring-red-500/20"
                      : prio === "MEDIUM"
                      ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20";

                  return (
                    <div key={i} className="flex flex-col gap-2 rounded-lg bg-navy-900 p-4 border border-navy-800">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${prioBadge}`}>
                          {prio}
                        </span>
                        <span className="text-sm font-semibold text-navy-100">{item.title}</span>
                      </div>
                      <p className="text-sm text-navy-300 leading-relaxed">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {canAnalyze && !analysisResult && (
        <div className="fixed bottom-8 right-8 flex transform justify-center">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !documentType}
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
