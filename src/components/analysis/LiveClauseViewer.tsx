"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { RiskClause } from "@/components/analysis/types";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type PageTextMeta = {
  pageStart: number;
  items: string[];
  itemOffsets: number[];
};

const HIGHLIGHT_STYLES = {
  HIGH: "background: rgba(220, 38, 38, 0.28); box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.18); border-radius: 3px;",
  MEDIUM: "background: rgba(217, 119, 6, 0.28); box-shadow: 0 0 0 1px rgba(217, 119, 6, 0.18); border-radius: 3px;",
  LOW: "background: rgba(5, 150, 105, 0.24); box-shadow: 0 0 0 1px rgba(5, 150, 105, 0.18); border-radius: 3px;",
} as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHighlightedHtml(
  value: string,
  startOffset: number,
  endOffset: number,
  severity: RiskClause["severity"],
) {
  const safeStart = Math.max(0, Math.min(startOffset, value.length));
  const safeEnd = Math.max(safeStart, Math.min(endOffset, value.length));

  if (safeStart === safeEnd) {
    return escapeHtml(value);
  }

  const before = escapeHtml(value.slice(0, safeStart));
  const marked = escapeHtml(value.slice(safeStart, safeEnd));
  const after = escapeHtml(value.slice(safeEnd));

  return `${before}<mark style="${HIGHLIGHT_STYLES[severity]}">${marked}</mark>${after}`;
}

function getExcerpt(text: string, clause: RiskClause, padding = 180) {
  const start = Math.max(0, clause.char_start - padding);
  const end = Math.min(text.length, clause.char_end + padding);

  return {
    prefix: text.slice(start, clause.char_start),
    highlighted: text.slice(clause.char_start, clause.char_end),
    suffix: text.slice(clause.char_end, end),
  };
}

export function LiveClauseViewer({
  clause,
  documentText,
  pdfUrl,
}: {
  clause: RiskClause;
  documentText: string;
  pdfUrl?: string | null;
}) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(clause.page_number ?? 1);
  const [pageMeta, setPageMeta] = useState<Record<number, PageTextMeta>>({});
  const [isPreparingText, setIsPreparingText] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentPage(clause.page_number ?? 1);
  }, [clause.id, clause.page_number]);

  useEffect(() => {
    let cancelled = false;

    async function extractPageText() {
      if (!pdfUrl) {
        setPageMeta({});
        setNumPages(0);
        return;
      }

      try {
        setIsPreparingText(true);
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const nextMeta: Record<number, PageTextMeta> = {};
        let documentCursor = 0;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const items = content.items
            .map((item) => ("str" in item ? item.str : ""))
            .filter((item) => item.length > 0);

          const itemOffsets: number[] = [];
          let pageCursor = 0;

          for (const item of items) {
            itemOffsets.push(pageCursor);
            pageCursor += item.length;
          }

          nextMeta[pageNumber] = {
            pageStart: documentCursor,
            items,
            itemOffsets,
          };

          documentCursor += pageCursor + 2;
        }

        if (!cancelled) {
          setNumPages(pdf.numPages);
          setPageMeta(nextMeta);
          setPdfFailed(false);
        }
      } catch {
        if (!cancelled) {
          setPdfFailed(true);
          setPageMeta({});
        }
      } finally {
        if (!cancelled) {
          setIsPreparingText(false);
        }
      }
    }

    void extractPageText();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  useEffect(() => {
    const container = pageRef.current;
    const meta = pageMeta[currentPage];
    if (!container || !meta) return;

    const spans = container.querySelectorAll(".react-pdf__Page__textContent span");
    if (spans.length === 0) return;

    spans.forEach((span, index) => {
      const rawText = meta.items[index] ?? span.textContent ?? "";
      const itemStart = meta.pageStart + (meta.itemOffsets[index] ?? 0);
      const itemEnd = itemStart + rawText.length;
      const overlapStart = Math.max(itemStart, clause.char_start);
      const overlapEnd = Math.min(itemEnd, clause.char_end);

      if (overlapStart < overlapEnd) {
        span.innerHTML = buildHighlightedHtml(
          rawText,
          overlapStart - itemStart,
          overlapEnd - itemStart,
          clause.severity,
        );
      } else {
        span.textContent = rawText;
      }
    });
  }, [clause.char_end, clause.char_start, clause.severity, currentPage, pageMeta]);

  const excerpt = useMemo(() => getExcerpt(documentText, clause), [documentText, clause]);
  const canShowPdf = Boolean(pdfUrl) && !pdfFailed;

  return (
    <div className="rounded-[28px] border border-navy-700 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-navy-800 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400">
            Live clause viewer
          </p>
          <h3 className="mt-1 text-lg font-semibold text-navy-100">{clause.title}</h3>
        </div>

        <div className="flex items-center gap-2">
          {[
            { label: "First page", action: () => setCurrentPage(1), disabled: currentPage <= 1, icon: ChevronFirst },
            { label: "Previous page", action: () => setCurrentPage((page) => Math.max(1, page - 1)), disabled: currentPage <= 1, icon: ChevronLeft },
            { label: "Next page", action: () => setCurrentPage((page) => Math.min(numPages || page, page + 1)), disabled: numPages > 0 ? currentPage >= numPages : true, icon: ChevronRight },
            { label: "Last page", action: () => setCurrentPage(numPages), disabled: numPages > 0 ? currentPage >= numPages : true, icon: ChevronLast },
          ].map(({ label, action, disabled, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              disabled={disabled}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy-700 bg-navy-900 text-navy-300 transition-colors hover:border-gold-500 hover:text-gold-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={label}
            >
              <Icon size={17} strokeWidth={1.9} />
            </button>
          ))}
          <div className="ml-2 rounded-xl bg-navy-900 px-3 py-2 text-xs font-medium text-navy-300">
            Page {canShowPdf ? currentPage : clause.page_number ?? 1}
            {numPages > 0 ? ` / ${numPages}` : ""}
          </div>
        </div>
      </div>

      {canShowPdf ? (
        <div className="mt-5 rounded-[24px] border border-navy-700 bg-navy-850 p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-navy-500">
            <span>Highlighting uses `char_start` / `char_end` offsets from the analyzed text.</span>
            {isPreparingText ? <span>Preparing text map...</span> : null}
          </div>
          <div ref={pageRef} className="overflow-auto rounded-2xl bg-white p-4">
            <Document
              file={pdfUrl!}
              onLoadSuccess={({ numPages: pages }) => {
                setNumPages(pages);
                setPdfFailed(false);
              }}
              onLoadError={() => setPdfFailed(true)}
              loading={
                <div className="flex h-[560px] items-center justify-center text-sm text-navy-500">
                  Loading PDF...
                </div>
              }
              error={
                <div className="flex h-[560px] items-center justify-center text-sm text-navy-500">
                  PDF unavailable. Showing quoted clause instead.
                </div>
              }
            >
              <Page pageNumber={currentPage} width={760} renderAnnotationLayer renderTextLayer />
            </Document>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] border border-dashed border-navy-700 bg-navy-900 p-5">
          <div className="flex items-center gap-3 text-navy-300">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gold-700">
              <FileText size={18} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-200">PDF unavailable</p>
              <p className="text-xs text-navy-500">
                Showing the exact clause quote and surrounding text instead.
              </p>
            </div>
          </div>

          <blockquote className="mt-5 rounded-2xl border border-navy-700 bg-white p-5 text-sm leading-7 text-navy-300">
            <span>{excerpt.prefix}</span>
            <mark
              className={
                clause.severity === "HIGH"
                  ? "rounded bg-red-100 px-1 text-red-700"
                  : clause.severity === "MEDIUM"
                    ? "rounded bg-amber-100 px-1 text-amber-700"
                    : "rounded bg-emerald-100 px-1 text-emerald-700"
              }
            >
              {excerpt.highlighted}
            </mark>
            <span>{excerpt.suffix}</span>
          </blockquote>
        </div>
      )}
    </div>
  );
}
