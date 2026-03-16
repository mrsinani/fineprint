"use client";

import { FileText, X } from "lucide-react";

export interface PendingFileRowProps {
  name: string;
  size: string;
  status: "pending" | "uploading" | "done" | "error";
  onRemove?: () => void;
}

export function PendingFileRow({ name, size, status, onRemove }: PendingFileRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-navy-700 bg-white px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-850 text-navy-400"
          aria-hidden
        >
          <FileText size={20} strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-navy-100">
            {name}
          </p>
          <p className="text-[12px] text-navy-500">
            {size}
            {status === "uploading" && (
              <span className="ml-1.5 text-gold-600">
                &bull; Uploading&hellip;
              </span>
            )}
            {status === "done" && (
              <span className="ml-1.5 text-fp-emerald">
                &bull; Ready
              </span>
            )}
            {status === "error" && (
              <span className="ml-1.5 text-fp-red">
                &bull; Failed
              </span>
            )}
          </p>
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-full p-1.5 text-navy-500 transition-colors duration-150 hover:bg-navy-850 hover:text-navy-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
          aria-label={`Remove ${name}`}
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
