"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { UploadZone, PendingFileRow } from "@/components/upload";

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
  const [fileStatus, setFileStatus] = useState<UploadStatus>("pending");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Text state
  const [pastedText, setPastedText] = useState("");

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Record<string, unknown> | null>(null);

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

  const canAnalyze =
    mode === "file" ? fileStatus === "done" : pastedText.trim().length > 0;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let response: Response;

      if (mode === "file") {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
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
    <div className="mx-auto max-w-3xl px-8 py-12">
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

      {analysisResult && (
        <div className="mt-8 rounded-xl bg-navy-100 p-6 text-sm text-green-400 overflow-x-auto">
          <h3 className="text-white font-bold mb-4">Analysis Result (Raw JSON)</h3>
          <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
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
