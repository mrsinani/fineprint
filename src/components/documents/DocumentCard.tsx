"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

export interface DocumentCardProps {
  id: string;
  title: string;
  fileName?: string;
  lastOpened?: string;
  fileType?: string;
  pages?: number;
  createdAt: string;
  uploadedAt?: string;
  manager?: string;
  team?: string;
}

export function DocumentCard({
  id,
  title,
  fileName,
  lastOpened,
  fileType,
  pages,
  createdAt,
  uploadedAt,
}: DocumentCardProps) {
  const titleId = `doc-title-${id}`;
  const displayOpened = lastOpened ?? uploadedAt;
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <Link href={`/documents/${id}`} className="block">
        <article
          className="flex min-h-[180px] flex-col justify-between rounded-xl border border-navy-700 bg-white p-4 transition-shadow duration-200 hover:shadow-md"
          aria-labelledby={titleId}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] text-navy-500">
                {displayOpened && <>Last opened: {displayOpened}</>}
              </p>
              <div className="w-5 shrink-0" />
            </div>

            <h3
              id={titleId}
              className="mt-2 truncate text-sm font-bold text-navy-100"
            >
              {title}
            </h3>
            {fileName && (
              <p className="mt-0.5 truncate text-[12px] text-navy-500">
                {fileName}
              </p>
            )}
          </div>

          <dl className="mt-4 flex flex-col gap-0.5 text-[11px] text-navy-500">
            {fileType && (
              <div>
                <dt className="sr-only">File type</dt>
                <dd>File type: {fileType}</dd>
              </div>
            )}
            {pages != null && (
              <div>
                <dt className="sr-only">Pages</dt>
                <dd>Pages: {pages}</dd>
              </div>
            )}
            <div>
              <dt className="sr-only">Created</dt>
              <dd>Created: {createdAt}</dd>
            </div>
          </dl>
        </article>
      </Link>

      <div className="absolute right-2 top-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          className="rounded-md p-0.5 text-navy-500 transition-colors hover:text-navy-300"
          aria-label="Document options"
        >
          <MoreHorizontal size={16} strokeWidth={2} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-navy-700 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                await fetch("/api/documents/trash", {
                  method: "POST",
                  body: JSON.stringify({ id }),
                  headers: { "Content-Type": "application/json" },
                });
                router.refresh();
              }}
              className="w-full px-3 py-2 text-left text-[13px] text-navy-400 transition-colors hover:bg-navy-850 hover:text-red-400"
            >
              Move to trash
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
