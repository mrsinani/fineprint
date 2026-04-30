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

export type ReputationEntityType = "company" | "landlord";

export type ReputationStatus = "available" | "unavailable";

export interface ReputationSource {
  provider: string;
  reference_type?: string;
  title: string;
  url: string;
  snippet: string;
  sentiment: "positive" | "mixed" | "negative" | "neutral";
}

export interface ReputationReport {
  status: ReputationStatus;
  entity_name: string;
  entity_type: ReputationEntityType;
  contract_type: string | null;
  provider: string;
  risk_level: RiskSeverity;
  average_rating: number | null;
  review_count: number | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  top_complaints: string[];
  red_flags: string[];
  sources: ReputationSource[];
  disclaimer: string;
  searched_at: string | null;
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
  reputation?: ReputationReport | null;
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
