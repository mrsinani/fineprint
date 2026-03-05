import Link from "next/link";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { MOCK_DOCUMENTS } from "@/components/documents/MockDocuments";

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            My documents
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Documents you’ve uploaded for analysis
          </p>
        </div>
        <Link
          href="/upload"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Upload new
        </Link>
      </div>

      <div className="mt-8">
        {MOCK_DOCUMENTS.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {MOCK_DOCUMENTS.map((doc, i) => (
              <li key={i}>
                <DocumentCard id={`${i}`} {...doc} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center dark:border-slate-600 dark:bg-slate-800/20">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No documents yet. Upload your first contract to get started.
            </p>
            <Link
              href="/upload"
              className="mt-4 inline-block text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Upload new →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

