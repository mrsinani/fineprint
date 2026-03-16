import Link from "next/link";
import { File } from "lucide-react";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { MOCK_DOCUMENTS } from "@/components/documents/MockDocuments";

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <div
        className="flex items-end justify-between gap-4 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl">
            My documents
          </h1>
          <p className="mt-2 text-[15px] text-navy-400">
            Documents you&apos;ve uploaded for analysis
          </p>
        </div>
        <Link
          href="/upload"
          className="shrink-0 rounded-lg bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-gold-700"
        >
          Upload new
        </Link>
      </div>

      <div
        className="mt-10 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.25s forwards" }}
      >
        {MOCK_DOCUMENTS.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {MOCK_DOCUMENTS.map((doc, i) => (
              <li
                key={i}
                className="opacity-0"
                style={{
                  animation: `fp-fade-in-up 0.5s ease-out ${0.3 + i * 0.08}s forwards`,
                }}
              >
                <DocumentCard id={`${i}`} {...doc} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-navy-700 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy-850 text-navy-500">
              <File size={24} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-navy-400">
              No documents yet. Upload your first contract to get started.
            </p>
            <Link
              href="/upload"
              className="mt-4 inline-block text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
            >
              Upload new &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
