"use client";

import { useState, useCallback } from "react";
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
                  Start upload (demo)
                </button>
              )}
            </div>

            <div>
              <DocumentPreview fileName={file.name} placeholder />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

