import { createAdminClient } from "@/lib/supabase/admin";
import type { DocumentAnalysisPageData } from "@/components/analysis/types";
import {
  buildSampleDocument,
  normalizeDocumentRecord,
} from "@/components/analysis/data";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

function mapDbRowsToPageData(
  doc: Record<string, unknown>,
  analysis: Record<string, unknown>,
  supabase: SupabaseAdmin,
): DocumentAnalysisPageData | null {
  const summary =
    analysis.summary && typeof analysis.summary === "object"
      ? (analysis.summary as Record<string, unknown>)
      : {};

  const overview =
    typeof summary.overview === "string"
      ? summary.overview
      : "No summary available for this document.";

  const analysisPayload: Record<string, unknown> = {
    overview: overview.trim() || "No summary available for this document.",
    parties: summary.parties,
    plain_english: summary.plain_english,
    clauses: analysis.clauses,
    action_items: analysis.action_items,
    reputation_report:
      analysis.reputation_report && typeof analysis.reputation_report === "object"
        ? analysis.reputation_report
        : null,
    risk_score:
      typeof analysis.overall_risk_score === "number"
        ? analysis.overall_risk_score
        : 0,
    document_text:
      typeof analysis.raw_text === "string" ? analysis.raw_text : "",
    storage_path:
      typeof doc.file_path === "string" ? doc.file_path : null,
    pdf_url: null,
  };

  const wrapped: Record<string, unknown> = {
    id: doc.id,
    title: doc.title,
    file_name: doc.file_name,
    file_type: doc.file_type,
    page_count: doc.page_count,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    analysis: analysisPayload,
  };

  const normalized = normalizeDocumentRecord(
    String(doc.id),
    wrapped,
    "supabase",
  );
  if (!normalized) return null;

  if (
    !normalized.analysis.pdf_url &&
    normalized.analysis.storage_path &&
    typeof normalized.analysis.storage_path === "string"
  ) {
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("documents")
      .getPublicUrl(normalized.analysis.storage_path);

    normalized.analysis.pdf_url = publicUrl || null;
  }

  return normalized;
}

export type OwnedDocumentAnalysisState =
  | { status: "not_found" }
  | {
      status: "no_analysis";
      doc: {
        title: string | null;
        file_name: string | null;
        document_type: string | null;
        page_count: number | null;
        created_at: string;
      };
    }
  | { status: "ok"; pageData: DocumentAnalysisPageData };

/**
 * Loads data for `/documents/[id]`: distinguishes missing doc vs missing analysis.
 */
export async function getOwnedDocumentAnalysisState(
  documentId: string,
  userId: string,
): Promise<OwnedDocumentAnalysisState> {
  const supabase = createAdminClient();

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (docError || !doc || typeof doc !== "object") {
    return { status: "not_found" };
  }

  const d = doc as Record<string, unknown>;

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!analysis || typeof analysis !== "object") {
    console.log("[fineprint:analysis] document has no analysis row", {
      documentId,
      userId,
      title: typeof d.title === "string" ? d.title : null,
      fileName: typeof d.file_name === "string" ? d.file_name : null,
    });

    return {
      status: "no_analysis",
      doc: {
        title: typeof d.title === "string" ? d.title : null,
        file_name: typeof d.file_name === "string" ? d.file_name : null,
        document_type: typeof d.document_type === "string" ? d.document_type : null,
        page_count: typeof d.page_count === "number" ? d.page_count : null,
        created_at: String(d.created_at ?? ""),
      },
    };
  }

  const pageData = mapDbRowsToPageData(
    d,
    analysis as Record<string, unknown>,
    supabase,
  );

  if (!pageData) {
    return {
      status: "no_analysis",
      doc: {
        title: typeof d.title === "string" ? d.title : null,
        file_name: typeof d.file_name === "string" ? d.file_name : null,
        document_type: typeof d.document_type === "string" ? d.document_type : null,
        page_count: typeof d.page_count === "number" ? d.page_count : null,
        created_at: String(d.created_at ?? ""),
      },
    };
  }

  return { status: "ok", pageData };
}

/**
 * Loads the tabbed analysis UI payload for a document the user owns.
 * Returns null if the document does not exist, or there is no analysis row.
 */
export async function getDocumentAnalysisForOwner(
  documentId: string,
  userId: string,
): Promise<DocumentAnalysisPageData | null> {
  const state = await getOwnedDocumentAnalysisState(documentId, userId);
  if (state.status === "ok") return state.pageData;
  return null;
}

/**
 * Preview route: real analysis when logged in and the id belongs to the user;
 * otherwise the built-in sample document (same as before).
 */
export async function getDocumentAnalysisForPreview(
  id: string,
  userId: string | null,
): Promise<DocumentAnalysisPageData> {
  if (userId) {
    const owned = await getDocumentAnalysisForOwner(id, userId);
    if (owned) return owned;
  }
  return buildSampleDocument(id);
}

/** @deprecated Use getDocumentAnalysisForOwner or getDocumentAnalysisForPreview */
export async function getDocumentAnalysisById(
  id: string,
): Promise<DocumentAnalysisPageData> {
  return getDocumentAnalysisForPreview(id, null);
}
