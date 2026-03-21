"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { File, FileText, Info } from "lucide-react";
import * as mammoth from "mammoth";

// --- React-PDF Imports ---
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface DocumentPreviewProps {
  fileName: string;
  placeholder?: boolean;
  fileUrl?: string | null;
  fileType?: string;
  file?: File | null;
  onExcludedPagesChange?: (excludedPages: number[]) => void;
  onNumPagesChange?: (numPages: number) => void; 
}

// Helper function to parse ranges like "1-3, 5, 8-10"
function parsePageRange(input: string, maxPage: number): Set<number> {
  const pages = new Set<number>();
  if (!input.trim() || !maxPage) return pages;

  const parts = input.split(/[,;]+/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(maxPage, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          pages.add(i);
        }
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPage) {
        pages.add(num);
      }
    }
  }
  return pages;
}

export function DocumentPreview({
  fileName,
  placeholder = true,
  fileUrl,
  fileType,
  file,
  onExcludedPagesChange,
  onNumPagesChange,
}: DocumentPreviewProps) {
  
  // Word Document State
  const [docxHtml, setDocxHtml] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);

  // PDF Pagination & Filtering State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [excludeInput, setExcludeInput] = useState<string>("");
  
  // Track the currently visible page for the indicator
  const [visiblePage, setVisiblePage] = useState<number>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const excludedPages = useMemo(() => {
    return parsePageRange(excludeInput, numPages || 9999);
  }, [excludeInput, numPages]);

  useEffect(() => {
    if (onExcludedPagesChange) {
      onExcludedPagesChange(Array.from(excludedPages));
    }
  }, [excludedPages, onExcludedPagesChange]);

  useEffect(() => {
    if (onNumPagesChange && numPages !== null) {
      onNumPagesChange(numPages);
    }
  }, [numPages, onNumPagesChange]);

  useEffect(() => {
    setExcludeInput("");
    setNumPages(null);
    setVisiblePage(1);
  }, [file]);

  // NEW: Intersection Observer to track which page is currently in view
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the page that is intersecting the most with the viewport
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          const bestMatch = visibleEntries.reduce((prev, current) => 
            prev.intersectionRatio > current.intersectionRatio ? prev : current
          );
          
          const pageStr = bestMatch.target.getAttribute("data-page");
          if (pageStr) setVisiblePage(parseInt(pageStr, 10));
        }
      },
      {
        root: container,
        threshold: 0.3, // Trigger when at least 30% of a page is visible
      }
    );

    // Give the DOM a tiny fraction of a second to render the wrappers, then observe them
    setTimeout(() => {
      const pageNodes = container.querySelectorAll(".pdf-page-wrapper");
      pageNodes.forEach((node) => observer.observe(node));
    }, 100);

    return () => observer.disconnect();
  }, [numPages, fileType]);

  useEffect(() => {
    const parseDocx = async () => {
      if (!file || fileType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
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
      return <p className="animate-pulse text-sm text-navy-400">Parsing Document&hellip;</p>;
    }

    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return (
        <div
          className="h-[500px] w-full overflow-y-auto rounded-lg bg-white p-6 text-navy-100 shadow-inner"
          dangerouslySetInnerHTML={{ __html: docxHtml }}
        />
      );
    }

    if (fileType === "application/pdf" && file) {
      const pagesArray = Array.from(new Array(numPages || 0), (_, index) => index + 1);

      return (
        <div className="flex w-full flex-col gap-4">
          
          {/* Relative wrapper allows the floating badge to stick inside this area */}
          <div className="relative w-full">
            
            {/* --- NEW: Floating Active Page Indicator --- */}
            {numPages && (
              <div className="absolute top-4 right-6 z-20 pointer-events-none transition-opacity duration-300">
                <div className="rounded-full bg-navy-900/90 px-4 py-1.5 text-xs font-semibold text-navy-200 border border-navy-700 shadow-md backdrop-blur-sm">
                  Page {visiblePage} of {numPages}
                </div>
              </div>
            )}

            {/* Document Canvas Container (Continuous Scroll) */}
            <div 
              ref={scrollContainerRef}
              className="flex h-[500px] w-full flex-col overflow-y-auto rounded-lg bg-navy-850 p-6 shadow-inner border border-navy-700 relative scroll-smooth"
            >
              <Document
                file={file}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<p className="animate-pulse text-center text-sm text-navy-400 mt-10">Loading PDF...</p>}
                error={<p className="text-center text-sm text-red-400 mt-10">Failed to load PDF.</p>}
              >
                <div className="flex flex-col items-center gap-8 pb-10">
                  {pagesArray.map((page) => {
                    const isExcluded = excludedPages.has(page);
                    
                    return (
                      <div 
                        key={page} 
                        data-page={page} // Added for the Observer to read
                        className="pdf-page-wrapper relative w-full max-w-fit transition-all duration-300"
                      >
                        
                        {/* Page Label */}
                        <div className="absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-navy-400 border border-navy-700 shadow-sm">
                          {page}
                        </div>

                        {/* Excluded Overlay */}
                        {isExcluded && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-navy-900/60 backdrop-blur-[1px]">
                            <div className="rounded-lg bg-navy-800 px-6 py-3 text-sm font-semibold text-navy-300 border border-navy-700 shadow-xl">
                              Page Excluded
                            </div>
                          </div>
                        )}

                        {/* Actual Page */}
                        <div className={`transition-all duration-300 ${isExcluded ? "opacity-30 grayscale scale-[0.98]" : "opacity-100 shadow-lg"}`}>
                          <Page 
                            pageNumber={page} 
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            width={600} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Document>
            </div>
          </div>

          {/* Filtering Input Section */}
          <div className="rounded-lg border border-navy-700 bg-navy-850 p-4 shadow-sm">
            <div className="flex flex-col gap-2">
              <label htmlFor="page-filter" className="text-sm font-semibold text-navy-200">
                Exclude pages from analysis
              </label>
              <div className="flex gap-3 items-start">
                <input
                  id="page-filter"
                  type="text"
                  value={excludeInput}
                  onChange={(e) => setExcludeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="flex-1 rounded-md border border-navy-600 bg-navy-900 px-4 py-2 text-sm text-navy-100 placeholder:text-navy-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
              <p className="flex items-center gap-1.5 text-xs text-navy-400 mt-1">
                <Info size={14} />
                Separate individual pages and ranges with commas. Currently excluding {excludedPages.size} page(s).
              </p>
            </div>
          </div>

        </div>
      );
    }

    if (!fileUrl) return <p className="text-sm text-navy-500">No preview available.</p>;

    if (fileType?.startsWith("image/")) {
      return <img src={fileUrl} alt={`Preview of ${fileName}`} className="max-h-[400px] w-auto rounded-lg object-contain" />;
    }

    if (fileType === "text/plain") {
      return <iframe src={`${fileUrl}#toolbar=0`} title={fileName} className="h-[500px] w-full rounded-lg border-0 bg-white" />;
    }

    return <p className="text-sm text-navy-500">Preview not available for this file type.</p>;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
      <div className="flex items-center gap-2 border-b border-navy-700 px-4 py-2.5">
        <File size={14} strokeWidth={1.75} className="text-navy-500" aria-hidden />
        <p className="truncate text-[13px] font-medium text-navy-300">{fileName}</p>
      </div>
      <div className="flex w-full items-center justify-center p-6">
        {placeholder ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-navy-600" aria-hidden>
            <FileText size={48} strokeWidth={0.75} />
            <span className="text-xs text-navy-500">Document preview</span>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center">
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
}