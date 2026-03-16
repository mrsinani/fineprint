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

  // Manage the creation and cleanup of the Object URL for previews
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Free up memory when the component unmounts or the file changes
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

  /** Simulate upload for UI demo; no backend call. */
  const simulateUpload = useCallback(() => {
    if (!file) return;
    setStatus("uploading");
    setTimeout(() => setStatus("done"), 1500);
  }, [file]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        Upload file
      </h1>

      <div className="mt-8 flex flex-col gap-6">
        <UploadZone onFileSelect={handleFileSelect} />

        {file && (
          <>
            <div>
              <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  className="mt-3 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  Upload
                </button>
              )}
            </div>

            <div>
              {/* Show placeholder while uploading, reveal preview when done (or change logic as desired) */}
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