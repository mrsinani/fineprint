"use client";

import { useState, useEffect } from "react";
import { File, FileText } from "lucide-react";
import * as mammoth from "mammoth";

export interface DocumentPreviewProps {
  fileName: string;
  placeholder?: boolean;
  fileUrl?: string | null;
  fileType?: string;
  file?: File | null;
}

export function DocumentPreview({
  fileName,
  placeholder = true,
  fileUrl,
  fileType,
  file,
}: DocumentPreviewProps) {
  const [docxHtml, setDocxHtml] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    const parseDocx = async () => {
      if (
        !file ||
        fileType !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setDocxHtml("");
        return;
      }

      setIsParsing(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxHtml(result.value);
      } catch (error) {
        console.error("Error parsing Word document:", error);
        setDocxHtml("<p>Error loading document preview.</p>");
      } finally {
        setIsParsing(false);
      }
    };

    parseDocx();
  }, [file, fileType]);

  const renderPreview = () => {
    if (isParsing) {
      return (
        <p className="animate-pulse text-sm text-navy-400">
          Parsing Word Document&hellip;
        </p>
      );
    }

    if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <div
          className="h-[500px] w-full overflow-y-auto rounded-lg bg-white p-6 text-navy-100 shadow-inner"
          dangerouslySetInnerHTML={{ __html: docxHtml }}
        />
      );
    }

    if (!fileUrl) {
      return <p className="text-sm text-navy-500">No preview available.</p>;
    }

    if (fileType?.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt={`Preview of ${fileName}`}
          className="max-h-[400px] w-auto rounded-lg object-contain"
        />
      );
    }

    if (fileType === "application/pdf") {
      return (
        <iframe
          src={`${fileUrl}#toolbar=0`}
          title={fileName}
          className="h-[500px] w-full rounded-lg border-0 bg-white"
        />
      );
    }

    if (fileType === "text/plain") {
      return (
        <iframe
          src={`${fileUrl}#toolbar=0`}
          title={fileName}
          className="h-[500px] w-full rounded-lg border-0 bg-white"
        />
      );
    }

    return (
      <p className="text-sm text-navy-500">
        Preview not available for this file type.
      </p>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
      <div className="flex items-center gap-2 border-b border-navy-700 px-4 py-2.5">
        <File size={14} strokeWidth={1.75} className="text-navy-500" aria-hidden />
        <p className="truncate text-[13px] font-medium text-navy-300">
          {fileName}
        </p>
      </div>
      <div className="flex min-h-[240px] w-full items-center justify-center p-8">
        {placeholder ? (
          <div
            className="flex flex-col items-center gap-3 text-navy-600"
            aria-hidden
          >
            <FileText size={48} strokeWidth={0.75} />
            <span className="text-xs text-navy-500">Document preview</span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
}
