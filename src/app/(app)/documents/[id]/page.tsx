import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { DocumentAnalysisShell } from "@/components/analysis/DocumentAnalysisShell";
import { getOwnedDocumentAnalysisState } from "@/components/analysis/loadDocumentAnalysis.server";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) notFound();
  await ensureUserExists(userId);

  const state = await getOwnedDocumentAnalysisState(id, userId);

  if (state.status === "not_found") {
    notFound();
  }

  if (state.status === "no_analysis") {
    const { doc } = state;
    const createdAt = new Date(doc.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return (
      <>
        <div className="mx-auto max-w-3xl px-8 py-12 pb-32">
          <div
            className="opacity-0"
            style={{ animation: "fp-fade-in-up 0.5s ease-out 0s forwards" }}
          >
            <Link
              href="/documents"
              className="inline-flex items-center gap-1.5 text-sm text-navy-400 transition-colors hover:text-navy-200"
            >
              <ArrowLeft size={16} />
              Back to documents
            </Link>
          </div>

          <div
            className="mt-6 border-b border-navy-700 pb-6 opacity-0"
            style={{ animation: "fp-fade-in-up 0.5s ease-out 0.1s forwards" }}
          >
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-100 sm:text-3xl">
              {doc.title ?? doc.file_name ?? "Untitled"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-400">
              {doc.document_type && <span>{doc.document_type}</span>}
              {doc.page_count != null && <span>{doc.page_count} pages</span>}
              <span>{createdAt}</span>
            </div>
          </div>

          <div
            className="mt-12 rounded-xl border border-dashed border-navy-700 py-16 text-center opacity-0"
            style={{ animation: "fp-fade-in-up 0.5s ease-out 0.2s forwards" }}
          >
            <p className="text-sm text-navy-400">
              No analysis found for this document.
            </p>
          </div>
        </div>
        <ChatBubble documentId={id} />
      </>
    );
  }

  return (
    <>
      <DocumentAnalysisShell initialDocument={state.pageData} />
      <ChatBubble documentId={id} />
    </>
  );
}
