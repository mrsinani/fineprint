export type RiskSeverity = "HIGH" | "MEDIUM" | "LOW";

export type KeyTermIcon =
  | "calendar"
  | "scale"
  | "shield"
  | "file-text"
  | "alert-triangle"
  | "users";

export type ActionCategory =
  | "negotiate"
  | "legal"
  | "finance"
  | "operations"
  | "signing";

export interface DocumentParty {
  role: string;
  name: string;
}

export interface KeyTerm {
  id: string;
  title: string;
  description: string;
  icon: KeyTermIcon;
}

export interface RiskClause {
  id: string;
  title: string;
  severity: RiskSeverity;
  description: string;
  recommendation: string;
  quote: string;
  char_start: number;
  char_end: number;
  page_number?: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  severity: RiskSeverity;
}

export interface AnalysisResult {
  overview: string;
  parties: DocumentParty[];
  key_terms: KeyTerm[];
  plain_english: string[];
  risk_score: number;
  clauses: RiskClause[];
  action_items: ActionItem[];
  document_text: string;
  pdf_url?: string | null;
  storage_path?: string | null;
}

export interface DocumentAnalysisPageData {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  page_count: number;
  created_at: string;
  updated_at?: string;
  analysis: AnalysisResult;
  source: "sample" | "localStorage" | "supabase";
}
