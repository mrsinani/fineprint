"use client";

import { useState, useCallback, useEffect } from "react";
import { UploadZone, PendingFileRow, DocumentPreview } from "@/components/upload";

type UploadStatus = "pending" | "uploading" | "done" | "error";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("pending");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    setStatus("pending");
  }, []);

  const handleRemove = useCallback(() => {
    setFile(null);
    setStatus("pending");
  }, []);

  const simulateUpload = useCallback(() => {
    if (!file) return;
    setStatus("uploading");
    setTimeout(() => setStatus("done"), 1500);
  }, [file]);

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
                status={status}
                onRemove={handleRemove}
              />
              {status === "pending" && (
                <button
                  type="button"
                  onClick={simulateUpload}
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
                placeholder={status === "pending" || status === "uploading"}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
