/**
 * Shared types between the FinePrint web app and Chrome extension.
 * Single source of truth for API contracts and analysis data shapes.
 */

export type RiskSeverity = "HIGH" | "MEDIUM" | "LOW";

// ── API response from POST /api/analyze ──

export interface AnalysisSummary {
  overview: string;
  parties: { role: string; name: string }[];
  plain_english: string[];
}

export interface AnalysisClause {
  id: string;
  category: string[];
  severity: RiskSeverity;
  quote: string;
  char_start: number;
  char_end: number;
  triggered_features: string[];
  explanation: string;
  recommendation: string;
  section: string;
  confidence: string;
}

export interface AnalysisActionItem {
  title: string;
  description: string;
  priority: RiskSeverity;
  category: string;
}

export interface AnalyzeApiResponse {
  summary: AnalysisSummary;
  clauses: AnalysisClause[];
  action_items: AnalysisActionItem[];
  overall_risk_score: number;
}

// ── POST /api/documents/extension (extension save) ──

export interface ExtensionSaveRequest {
  title: string;
  sourceUrl: string;
  rawText: string;
  analysisResult: AnalyzeApiResponse;
  documentType?: string;
}

export interface ExtensionSaveResponse {
  id: string;
}

// ── Extension messaging ──

export type ExtensionMessageType =
  | "ANALYZE_PAGE"
  | "ANALYSIS_RESULT"
  | "ANALYSIS_ERROR"
  | "SAVE_ANALYSIS"
  | "SAVE_RESULT"
  | "GET_AUTH_STATUS"
  | "AUTH_STATUS"
  | "AUTH_TOKEN"
  | "SIGN_OUT";

export interface ExtensionMessage {
  type: ExtensionMessageType;
  payload?: unknown;
}
