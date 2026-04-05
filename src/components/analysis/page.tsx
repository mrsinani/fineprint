import { DocumentAnalysisShell } from "@/components/analysis/DocumentAnalysisShell";
import { getDocumentAnalysisById } from "@/components/analysis/data";

export default async function DocumentAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await getDocumentAnalysisById(id);

  return <DocumentAnalysisShell initialDocument={document} />;
}
