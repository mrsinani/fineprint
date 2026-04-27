"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UploadZone } from "@/components/upload/UploadZone";
import { PendingFileRow } from "@/components/upload/PendingFileRow";
import { DocumentTypeSelector } from "@/components/documents/DocumentTypeSelector";
import { Info, Shield } from "lucide-react";

const DocumentPreview = dynamic(
  () =>
    import("@/components/upload/DocumentPreview").then((m) => m.DocumentPreview),
  { ssr: false }
);

type UploadStatus = "pending" | "uploading" | "done" | "error";
type InputMode = "file" | "text";
type ApiError = { error?: string };
type UploadedDocument = { storagePath: string; docId: string };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function uploadToStorage(file: File): Promise<{ storagePath: string; docId: string }> {
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });
  if (!signRes.ok) {
    const errorText = await signRes.text();
    try {
      const err = JSON.parse(errorText) as { error?: string };
      throw new Error(err.error || "Failed to get upload URL");
    } catch {
      throw new Error(
        `Failed to get upload URL (${signRes.status}): ${errorText.slice(0, 180) || "Unknown server error"}`,
      );
    }
  }
  const { signedUrl, token, storagePath, docId } = await signRes.json();

  if (!signedUrl || !token || !storagePath || !docId) {
    throw new Error("Upload signing response was incomplete.");
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("documents")
    .uploadToSignedUrl(storagePath, token, file, { contentType: file.type });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return { storagePath, docId };
}

function readApiError(data: unknown): string | null {
  if (data && typeof data === "object" && "error" in data) {
    const value = (data as ApiError).error;
    return typeof value === "string" ? value : null;
  }

  return null;
}

export default function UploadPage() {
  const [mode, setMode] = useState<InputMode>("file");

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [fileStatus, setFileStatus] = useState<UploadStatus>("pending");
  const [previewUrl] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);

  // Tracking PDF Pages
  const [excludedPages, setExcludedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Text state
  const [pastedText, setPastedText] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [hasLoadedReview, setHasLoadedReview] = useState(false);
  const [isPreparingReview, setIsPreparingReview] = useState(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const router = useRouter();

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
      const fileBytes = new Uint8Array(modifiedBytes);

      const modifiedFile = new File([fileBytes], file.name, { type: file.type });
      
      setAnalysisFile(modifiedFile);
    };
    
    modifyPdf();
  }, [excludedPages, file]);

  useEffect(() => {
    setUploadedDocument(null);
    setReviewText("");
    setExtractedText("");
    setHasLoadedReview(false);
  }, [analysisFile]);

  const handleFileSelect = useCallback((selected: File) => {
    setFile(selected);
    setAnalysisFile(selected);
    setFileStatus("pending");
    setUploadedDocument(null);
    setReviewText("");
    setExtractedText("");
    setHasLoadedReview(false);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setFileStatus("pending");
    setUploadedDocument(null);
    setReviewText("");
    setExtractedText("");
    setHasLoadedReview(false);
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

  const ensureUploadedDocument = useCallback(async () => {
    if (uploadedDocument) return uploadedDocument;
    if (!analysisFile) {
      throw new Error("No file selected.");
    }

    const nextUploadedDocument = await uploadToStorage(analysisFile);
    setUploadedDocument(nextUploadedDocument);
    return nextUploadedDocument;
  }, [analysisFile, uploadedDocument]);

  const handlePreparePrivacyReview = useCallback(async () => {
    if (!analysisFile) return;

    setIsPreparingReview(true);
    setStatusMessage("Preparing review...");

    try {
      const { storagePath } = await ensureUploadedDocument();
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storagePath,
          fileType: analysisFile.type,
        }),
      });

      const extractData = (await extractRes.json()) as { text?: string; error?: string };
      if (!extractRes.ok) {
        throw new Error(extractData.error || `Extraction error: ${extractRes.status}`);
      }

      const nextText = typeof extractData.text === "string" ? extractData.text : "";
      setExtractedText(nextText);
      setReviewText(nextText);
      setHasLoadedReview(true);
      setFileStatus("done");
    } catch (error) {
      console.error("Privacy review preparation failed:", error);
      alert(error instanceof Error ? error.message : "Failed to prepare privacy review.");
    } finally {
      setIsPreparingReview(false);
      setStatusMessage("");
    }
  }, [analysisFile, ensureUploadedDocument]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setStatusMessage("");

    try {
      if (mode === "file") {
        if (!analysisFile) return;
        const approvedReviewText = reviewText.trim();

        // 1. Upload file directly to Supabase Storage (bypasses Vercel size limit)
        setStatusMessage("Uploading...");
        const { storagePath, docId } = await ensureUploadedDocument();

        // 2. Analyze via storage path (small JSON payload to Vercel)
        setStatusMessage("Analyzing...");
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storagePath,
            documentType,
            fileType: analysisFile.type,
            reviewedText: approvedReviewText || undefined,
            reviewedTextIsAnonymized: approvedReviewText.length > 0,
          }),
        });

        const analyzeText = await analyzeRes.text();
        let data: unknown;
        try {
          data = JSON.parse(analyzeText);
        } catch {
          throw new Error(`Server error (${analyzeRes.status}): ${analyzeText.slice(0, 120)}`);
        }
        if (!analyzeRes.ok) {
          throw new Error(readApiError(data) || `Analysis error: ${analyzeRes.status}`);
        }

        // 3. Save document + analysis to database (small JSON payload)
        setStatusMessage("Saving...");
        const saveRes = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storagePath,
            docId,
            fileName: analysisFile.name,
            fileType: analysisFile.type,
            analysisResult: data,
            documentType,
            pageCount: totalPages,
            title: analysisFile.name.replace(/\.[^/.]+$/, ""),
            rawText: approvedReviewText || undefined,
          }),
        });

        const saveData = await saveRes.json();
        if (!saveRes.ok) {
          throw new Error(saveData.error || `Save error: ${saveRes.status}`);
        }

        router.push(`/documents/${saveData.id}`);
      } else {
        // Text paste mode -- no storage needed
        setStatusMessage("Analyzing...");
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pastedText }),
        });

        const responseText = await response.text();
        let data: unknown;
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Server error (${response.status}): ${responseText.slice(0, 120)}`);
        }
        if (!response.ok) {
          throw new Error(readApiError(data) || `Server error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(error instanceof Error ? error.message : "Failed to analyze document.");
    } finally {
      setIsAnalyzing(false);
      setStatusMessage("");
    }
  };

  const switchMode = (next: InputMode) => {
    setMode(next);
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
        <p className="mt-3 max-w-2xl text-sm text-navy-500">
          Before analysis, you can optionally review and edit the anonymized text that will be sent to OpenAI for an extra privacy check.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-navy-500">
          This analysis is informational only and not legal advice. If you need legal guidance, consult a licensed attorney before signing or relying on any contract.
        </p>
      </div>
      <div
        className="relative z-20 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.15s forwards" }}
      >
        <DocumentTypeSelector value={documentType} onChange={setDocumentType}/>
      </div>

      {/* Mode toggle */}
      <div
        className="relative z-10 mt-8 flex gap-1 rounded-lg bg-navy-850 p-1 opacity-0"
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
        className="relative z-10 mt-6 flex flex-col gap-6 opacity-0"
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
                      Continue
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

                <div className="rounded-2xl border border-navy-700 bg-navy-900/80 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-navy-800 p-2 text-gold-400">
                      <Shield size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold text-navy-100">
                        Privacy review
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-navy-400">
                        For extra control, you can review the anonymized text and remove anything else you do not want included before AI analysis. If you edit it here, this approved version becomes the one sent to OpenAI.
                      </p>
                    </div>
                  </div>

                  {!hasLoadedReview ? (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handlePreparePrivacyReview}
                        disabled={isPreparingReview || fileStatus !== "done"}
                        className="rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-2.5 text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isPreparingReview ? "Preparing review..." : "Load anonymized text"}
                      </button>
                      <p className="text-xs text-navy-500">
                        Optional, but recommended when you want to manually confirm the anonymization removed everything sensitive enough.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={16}
                        className="w-full resize-y rounded-xl border border-navy-700 bg-navy-950 px-5 py-4 text-sm text-navy-100 placeholder:text-navy-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                        placeholder="Review and edit the anonymized text before analysis..."
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="flex items-center gap-2 text-xs text-navy-500">
                          <Info size={14} />
                          The anonymized text above is what will be sent for AI analysis.
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setReviewText(extractedText)}
                            className="text-xs font-semibold text-navy-400 transition-colors hover:text-navy-200"
                          >
                            Reset to anonymized text
                          </button>
                          <span className="text-xs text-navy-500">
                            {reviewText.length.toLocaleString()} characters
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div>
            <div className="mb-3 rounded-xl border border-navy-700 bg-navy-900/80 p-4 text-sm text-navy-400">
              The text below is the content that will be analyzed. You can edit or redact it before submission, and we still anonymize it server-side before sending it to OpenAI.
            </div>
            <textarea
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
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

      {canAnalyze && (
        <div className="fixed bottom-8 right-8 flex transform justify-center">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || isPreparingReview}
            className="flex items-center gap-2 rounded-full bg-gold-600 px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-gold-700 hover:shadow-2xl disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isAnalyzing ? (
              <span className="animate-pulse">{statusMessage || "Processing..."}</span>
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
