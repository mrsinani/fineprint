import type { AnalyzeApiResponse, ExtensionSaveResponse } from "@shared/types";

const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:3001"
    : "https://fineprint.dev";

async function getToken(): Promise<string | null> {
  const result = await chrome.storage.local.get("fp_token");
  return result.fp_token ?? null;
}

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  if (!token) throw new Error("Not signed in");

  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function analyzeText(text: string): Promise<AnalyzeApiResponse> {
  const res = await authedFetch("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Analysis failed (${res.status})`);
  }

  return res.json();
}

export async function saveAnalysis(params: {
  title: string;
  sourceUrl: string;
  rawText: string;
  analysisResult: AnalyzeApiResponse;
}): Promise<ExtensionSaveResponse> {
  const res = await authedFetch("/api/documents/extension", {
    method: "POST",
    body: JSON.stringify({
      title: params.title,
      sourceUrl: params.sourceUrl,
      rawText: params.rawText,
      analysisResult: params.analysisResult,
      documentType: "terms_of_service",
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Save failed (${res.status})`);
  }

  return res.json();
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

export function getAppUrl(path: string = "/"): string {
  return `${API_BASE}${path}`;
}
