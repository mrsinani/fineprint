"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SEV_HIGHLIGHT: Record<string, string> = {
  HIGH:   "rgba(239,68,68,0.35)",
  MEDIUM: "rgba(245,158,11,0.35)",
  LOW:    "rgba(34,197,94,0.35)",
};

interface Props {
  pdfBase64: string;
  highlightQuote: string | null;
  severity: "HIGH" | "MEDIUM" | "LOW" | null;
}

export function LiveClauseViewer({ pdfBase64, highlightQuote, severity }: Props) {
  const [numPages, setNumPages]     = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searching, setSearching]   = useState(false);
  const [containerWidth, setContainerWidth] = useState(370);

  // Find the page that contains the clause quote
  useEffect(() => {
    if (!highlightQuote || !pdfBase64) return;

    setSearching(true);
    // Use the first 5 meaningful words as the search key
    const words = highlightQuote
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 5);

    (async () => {
      try {
        const pdf = await pdfjs.getDocument(pdfBase64).promise;
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const tc   = await page.getTextContent();
          const text = tc.items.map((i: any) => i.str).join(" ").toLowerCase();
          const hits = words.filter((w) => text.includes(w.toLowerCase()));
          if (hits.length >= Math.min(3, words.length)) {
            setCurrentPage(p);
            break;
          }
        }
      } catch (e) {
        console.warn("Page search failed:", e);
      } finally {
        setSearching(false);
      }
    })();
  }, [highlightQuote, pdfBase64]);

  const highlightColor = severity ? SEV_HIGHLIGHT[severity] : "rgba(250,204,21,0.4)";

  // Build a set of distinctive words from the quote for matching
  const highlightWords = highlightQuote
    ? new Set(
        highlightQuote
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 4)
          .slice(0, 12),
      )
    : new Set<string>();

  const customTextRenderer = ({ str }: { str: string }) => {
    if (highlightWords.size === 0) return str;
    const lower = str.toLowerCase();
    const hasMatch = [...highlightWords].some((w) => lower.includes(w));
    if (hasMatch) {
      return `<span style="background:${highlightColor};border-radius:2px;padding:0 1px;">${str}</span>`;
    }
    return str;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* PDF area */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-gray-100 p-4">
        {searching ? (
          <div className="flex h-full items-center justify-center text-sm text-navy-400">
            Finding clause…
          </div>
        ) : (
          <Document
            file={pdfBase64}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            loading={
              <div className="flex items-center justify-center p-8 text-sm text-navy-400">
                Loading document…
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8 text-sm text-red-400">
                Could not load PDF.
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={containerWidth}
              renderTextLayer
              renderAnnotationLayer={false}
              customTextRenderer={customTextRenderer}
            />
          </Document>
        )}
      </div>

      {/* Page navigation */}
      {numPages > 0 && (
        <div className="flex items-center justify-between border-t border-navy-800 bg-white px-4 py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded p-1 text-navy-400 hover:bg-navy-850 hover:text-navy-200 disabled:opacity-30"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded p-1 text-navy-400 hover:bg-navy-850 hover:text-navy-200 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          <span className="text-xs text-navy-400">
            Page {currentPage} of {numPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage === numPages}
              className="rounded p-1 text-navy-400 hover:bg-navy-850 hover:text-navy-200 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(numPages)}
              disabled={currentPage === numPages}
              className="rounded p-1 text-navy-400 hover:bg-navy-850 hover:text-navy-200 disabled:opacity-30"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
