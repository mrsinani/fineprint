"use client";

import { useCallback, useRef } from "react";

export interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: string;
  disabled?: boolean;
}

const DEFAULT_ACCEPT = ".pdf,.docx,.txt";
const DEFAULT_MAX = "PDF, DOCX or TXT (max. 10MB)";

export function UploadZone({
  onFileSelect,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX,
  disabled = false,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect, disabled],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 px-6 py-14 transition-colors hover:border-slate-400 hover:bg-slate-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800/30 dark:hover:border-slate-500 dark:hover:bg-slate-800/50"
      aria-label="Click to upload or drag and drop"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-400" aria-hidden>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16.5V9m0 0l-3 3m3-3l3 3" />
          <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Click to upload or drag and drop
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {maxSize}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
        aria-hidden
        disabled={disabled}
      />
    </div>
  );
}

