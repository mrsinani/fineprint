"use client";

import { useCallback, useRef } from "react";
import { Upload } from "lucide-react";

export interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: string;
  disabled?: boolean;
}

const DEFAULT_ACCEPT = ".pdf,.docx,.txt";
const DEFAULT_MAX = "PDF, DOCX or TXT (max. 475 MB)";

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
      className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-600 bg-navy-900/50 px-6 py-16 transition-colors duration-200 hover:border-blue-400 hover:bg-blue-100/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      aria-label="Click to upload or drag and drop"
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 transition-colors duration-200 group-hover:bg-blue-100 group-hover:text-blue-700"
        aria-hidden
      >
        <Upload size={24} strokeWidth={1.75} aria-hidden />
      </div>
      <p className="text-sm font-medium text-navy-200">
        Click to upload{" "}
        <span className="text-navy-500">or drag and drop</span>
      </p>
      <p className="mt-1.5 text-[12px] text-navy-500">{maxSize}</p>
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
