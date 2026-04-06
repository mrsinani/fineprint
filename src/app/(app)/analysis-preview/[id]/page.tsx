import { auth } from "@clerk/nextjs/server";
import { DocumentAnalysisShell } from "@/components/analysis/DocumentAnalysisShell";
import { getDocumentAnalysisForPreview } from "@/components/analysis/loadDocumentAnalysis.server";

/**
 * Preview route for the tabbed document analysis UI (DocumentAnalysisShell).
 * Open e.g. /analysis-preview/demo — sample data. With a real document id while
 * logged in, shows the same payload as `/documents/[id]` when you own it.
 */
export default async function AnalysisPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  const document = await getDocumentAnalysisForPreview(id, userId ?? null);

  return <DocumentAnalysisShell initialDocument={document} />;
}
