import { createAdminClient } from "@/lib/supabase/admin";
import type {
  DocumentParty,
  ReputationEntityType,
  ReputationReport,
  ReputationSource,
  RiskSeverity,
} from "@/components/analysis/types";

type ReviewTarget = {
  entityName: string;
  entityType: ReputationEntityType;
  contractType: string | null;
};

type GoogleCustomSearchResponse = {
  items?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    displayLink?: string;
  }>;
};

const CACHE_TTL_HOURS = 24 * 7;

const POSITIVE_KEYWORDS = [
  "great place",
  "supportive",
  "responsive",
  "fair pay",
  "professional",
  "helpful",
  "transparent",
];

const NEGATIVE_KEYWORDS = [
  "lawsuit",
  "scam",
  "fraud",
  "unpaid",
  "wage theft",
  "unsafe",
  "harassment",
  "eviction",
  "mold",
  "bugs",
  "ignored",
  "ghosted",
  "terrible",
  "awful",
  "complaint",
];

const COMPLAINT_BUCKETS: Array<{ label: string; keywords: string[] }> = [
  { label: "Unpaid or delayed compensation", keywords: ["unpaid", "late pay", "wage", "payroll", "bonus"] },
  { label: "Management communication", keywords: ["management", "communication", "ignored", "ghosted", "responsive"] },
  { label: "Heavy workload", keywords: ["burnout", "overtime", "workload", "hours"] },
  { label: "Maintenance and property conditions", keywords: ["mold", "roach", "bugs", "maintenance", "leak"] },
  { label: "Deposit or fee disputes", keywords: ["deposit", "fee", "charges"] },
  { label: "Harassment or toxic culture", keywords: ["harassment", "toxic", "hostile", "discrimination"] },
  { label: "Legal disputes", keywords: ["lawsuit", "sued", "court", "fraud", "scam"] },
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isLikelyOrganization(name: string) {
  return /\b(llc|inc|corp|company|co\.|ltd|lp|llp|pllc|group|holdings|properties|apartments|management)\b/i.test(
    name,
  );
}

function maybeTrimEntityName(name: string) {
  return normalizeWhitespace(
    name
      .replace(/\b(the employee|employee|contractor|vendor|tenant|resident)\b/gi, "")
      .replace(/[,:;]+$/g, ""),
  );
}

function inferEntityType(documentType: string | null): ReputationEntityType | null {
  const normalized = (documentType ?? "").toLowerCase();
  if (normalized.includes("employ")) return "company";
  if (normalized.includes("offer")) return "company";
  if (normalized.includes("lease")) return "landlord";
  if (normalized.includes("rental")) return "landlord";
  return null;
}

function pickTargetByRole(
  parties: DocumentParty[],
  entityType: ReputationEntityType,
) {
  const preferredRoles =
    entityType === "company"
      ? ["employer", "company", "client", "customer", "buyer"]
      : ["landlord", "lessor", "property manager", "owner", "management"];

  for (const role of preferredRoles) {
    const match = parties.find((party) => party.role.toLowerCase().includes(role));
    if (match?.name) {
      return maybeTrimEntityName(match.name);
    }
  }

  for (const party of parties) {
    const candidate = maybeTrimEntityName(party.name);
    if (!candidate) continue;
    if (entityType === "company" && isLikelyOrganization(candidate)) return candidate;
    if (entityType === "landlord" && isLikelyOrganization(candidate)) return candidate;
  }

  return null;
}

export function inferReviewTarget(
  documentType: string | null,
  parties: DocumentParty[],
): ReviewTarget | null {
  const entityType = inferEntityType(documentType);
  if (!entityType) return null;

  const entityName = pickTargetByRole(parties, entityType);
  if (!entityName || entityName.length < 3) return null;

  // Avoid aggregating reputation for what looks like a private individual.
  if (!isLikelyOrganization(entityName)) return null;

  return {
    entityName,
    entityType,
    contractType: documentType,
  };
}

function buildQuery(target: ReviewTarget) {
  if (target.entityType === "company") {
    return `"${target.entityName}" (reviews OR complaints OR Glassdoor OR Indeed OR Reddit OR Trustpilot)`;
  }

  return `"${target.entityName}" (tenant reviews OR apartment reviews OR complaints OR Reddit)`;
}

function classifySentiment(text: string): ReputationSource["sentiment"] {
  const normalized = text.toLowerCase();
  const negativeHits = NEGATIVE_KEYWORDS.filter((word) => normalized.includes(word)).length;
  const positiveHits = POSITIVE_KEYWORDS.filter((word) => normalized.includes(word)).length;

  if (negativeHits > positiveHits && negativeHits > 0) return "negative";
  if (positiveHits > negativeHits && positiveHits > 0) return "positive";
  if (positiveHits > 0 && negativeHits > 0) return "mixed";
  return "neutral";
}

function getRiskLevel(negativeCount: number, positiveCount: number, redFlags: string[]): RiskSeverity {
  if (redFlags.length >= 2 || negativeCount >= 4) return "HIGH";
  if (redFlags.length >= 1 || negativeCount > positiveCount) return "MEDIUM";
  return "LOW";
}

function summarizeComplaints(snippets: string[]) {
  const counts = new Map<string, number>();

  for (const snippet of snippets) {
    const normalized = snippet.toLowerCase();
    for (const bucket of COMPLAINT_BUCKETS) {
      if (bucket.keywords.some((keyword) => normalized.includes(keyword))) {
        counts.set(bucket.label, (counts.get(bucket.label) ?? 0) + 1);
      }
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);
}

function extractRedFlags(snippets: string[]) {
  const found = new Set<string>();

  for (const snippet of snippets) {
    const normalized = snippet.toLowerCase();
    for (const word of NEGATIVE_KEYWORDS) {
      if (normalized.includes(word)) {
        found.add(word);
      }
    }
  }

  return [...found].slice(0, 5);
}

function buildUnavailableReport(target: ReviewTarget, reason: string): ReputationReport {
  return {
    status: "unavailable",
    entity_name: target.entityName,
    entity_type: target.entityType,
    contract_type: target.contractType,
    provider: "none",
    risk_level: "LOW",
    average_rating: null,
    review_count: null,
    confidence: "LOW",
    summary: reason,
    top_complaints: [],
    red_flags: [],
    sources: [],
    disclaimer:
      "External reputation is optional context and may be incomplete, outdated, or biased.",
    searched_at: new Date().toISOString(),
  };
}

async function readCache(cacheKey: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reputation_cache")
    .select("payload, expires_at")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!data || typeof data !== "object") return null;
  return (data as { payload?: ReputationReport }).payload ?? null;
}

async function writeCache(cacheKey: string, target: ReviewTarget, payload: ReputationReport) {
  const supabase = createAdminClient();
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  await supabase.from("reputation_cache").upsert({
    cache_key: cacheKey,
    entity_name: target.entityName,
    entity_type: target.entityType,
    contract_type: target.contractType,
    provider: payload.provider,
    payload,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });
}

async function searchGoogleCustomSearch(target: ReviewTarget): Promise<ReputationReport> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !engineId) {
    return buildUnavailableReport(
      target,
      "External review lookup is available once GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID are configured.",
    );
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: engineId,
    q: buildQuery(target),
    num: "8",
  });

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?${params.toString()}`,
    { method: "GET", cache: "no-store" },
  );

  if (!response.ok) {
    return buildUnavailableReport(
      target,
      `Review lookup failed with status ${response.status}.`,
    );
  }

  const data = (await response.json()) as GoogleCustomSearchResponse;
  const items = Array.isArray(data.items) ? data.items : [];

  if (items.length === 0) {
    return buildUnavailableReport(
      target,
      "No public review results were found for this counterparty.",
    );
  }

  const sources: ReputationSource[] = items.map((item) => {
    const title = normalizeWhitespace(item.title ?? "");
    const snippet = normalizeWhitespace(item.snippet ?? "");
    return {
      provider: item.displayLink ?? "Web",
      title,
      url: item.link ?? "",
      snippet,
      sentiment: classifySentiment(`${title} ${snippet}`),
    };
  });

  const snippets = sources.map((source) => `${source.title} ${source.snippet}`.trim());
  const negativeCount = sources.filter((source) => source.sentiment === "negative").length;
  const positiveCount = sources.filter((source) => source.sentiment === "positive").length;
  const redFlags = extractRedFlags(snippets);
  const topComplaints = summarizeComplaints(snippets);
  const riskLevel = getRiskLevel(negativeCount, positiveCount, redFlags);

  return {
    status: "available",
    entity_name: target.entityName,
    entity_type: target.entityType,
    contract_type: target.contractType,
    provider: "google-cse",
    risk_level: riskLevel,
    average_rating: null,
    review_count: null,
    confidence: sources.length >= 5 ? "MEDIUM" : "LOW",
    summary:
      topComplaints.length > 0
        ? `Public review snippets for ${target.entityName} skew ${riskLevel === "HIGH" ? "negative" : riskLevel === "MEDIUM" ? "mixed" : "mostly neutral"}, with recurring complaints about ${topComplaints.join(", ").toLowerCase()}.`
        : `Public review snippets for ${target.entityName} were found, but there was not enough structured feedback to identify a consistent complaint pattern.`,
    top_complaints: topComplaints,
    red_flags: redFlags,
    sources,
    disclaimer:
      "These are public web snippets, not verified findings. Reviews can be biased, incomplete, or stale.",
    searched_at: new Date().toISOString(),
  };
}

export async function getCounterpartyReputation(
  documentType: string | null,
  parties: DocumentParty[],
): Promise<ReputationReport | null> {
  const target = inferReviewTarget(documentType, parties);
  if (!target) return null;

  const cacheKey = `${target.entityType}:${slugify(target.entityName)}:${slugify(target.contractType ?? "unknown")}`;
  const cached = await readCache(cacheKey);
  if (cached) return cached;

  const report = await searchGoogleCustomSearch(target);
  await writeCache(cacheKey, target, report);
  return report;
}
