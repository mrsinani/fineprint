"use client";

import { useState, useRef, useEffect } from "react";

export interface DocumentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DOCUMENT_TYPES = [
  "Residential Lease Agreement",
  "Sublease Agreement",
  "Mortgage Agreement",
  "HOA Homeowners Association CCRs",
  "Employment Contract or Offer Letter",
  "Non Disclosure Agreement",
  "Non Compete or Non Solicitation Agreement",
  "Severance or Separation Agreement",
  "Terms of Service",
  "End User License Agreement",
  "Privacy Policy",
  "Employee Handbook",
  "Independent Contractor Agreement",
  "Statement of Work",
  "IP Assignment Agreement",
  "Loan Agreement or Promissory Note",
  "Credit Card Cardholder Agreement",
  "Bill of Sale",
  "Prenuptial or Postnuptial Agreement",
  "Last Will and Testament",
  "Power of Attorney",
  "Other",
];

function sanitize(input: string): string {
  return input.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ");
}

export function DocumentTypeSelector({
  value,
  onChange,
}: DocumentTypeSelectorProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = query.trim()
    ? DOCUMENT_TYPES.filter((t) =>
        t.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : DOCUMENT_TYPES;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        if (query.trim()) {
          onChange(sanitize(query.trim()));
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, onChange]);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [query]);

  function selectItem(item: string) {
    const clean = sanitize(item);
    setQuery(clean);
    onChange(clean);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open && e.key !== "Escape") {
      setOpen(true);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < filtered.length) {
        selectItem(filtered[highlightIndex]);
      } else if (query.trim()) {
        selectItem(query.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative z-30 mt-8 flex w-full flex-col gap-2" ref={wrapperRef}>
      <label
        htmlFor="document-type"
        className="text-sm font-semibold text-navy-200"
      >
        Document Type <span className="font-normal text-navy-500">(optional)</span>
      </label>

      <div className="relative">
        <input
          id="document-type"
          type="text"
          value={query}
          onChange={(e) => {
            const clean = sanitize(e.target.value);
            setQuery(clean);
            if (!open) setOpen(true);
            if (!clean) onChange("");
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type or select a document type..."
          autoComplete="off"
          className="w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-sm text-navy-100 placeholder:text-navy-500 outline-none transition-colors focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-navy-400 transition-colors hover:text-navy-200"
          aria-label="Toggle suggestions"
        >
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && filtered.length > 0 && (
          <ul
            ref={listRef}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-navy-700 bg-navy-900 py-1 shadow-xl"
          >
            {filtered.map((item, i) => (
              <li
                key={item}
                role="option"
                aria-selected={highlightIndex === i}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => selectItem(item)}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                  highlightIndex === i
                    ? "bg-navy-800 text-navy-100"
                    : "text-navy-300 hover:bg-navy-850 hover:text-navy-100"
                } ${item === value ? "font-medium text-gold-500" : ""}`}
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        {open && filtered.length === 0 && query.trim() && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 shadow-xl">
            <p className="text-sm text-navy-400">
              No matches. Press <span className="font-medium text-navy-200">Enter</span> to
              use &ldquo;{sanitize(query.trim())}&rdquo;
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-navy-400">
        Select from the list or type a custom document type.
      </p>
    </div>
  );
}
