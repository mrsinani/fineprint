import { DocumentAnalysisShell } from "@/components/analysis/DocumentAnalysisShell";
import { getDocumentAnalysisForPreview } from "@/components/analysis/loadDocumentAnalysis.server";

export default async function DocumentAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await getDocumentAnalysisForPreview(id, null);

  return <DocumentAnalysisShell initialDocument={document} />;
}
