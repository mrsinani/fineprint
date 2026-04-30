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
  searchName: string;
  entityType: ReputationEntityType;
  contractType: string | null;
  referenceType: string;
  sourceDomains: string[];
  queryTerms: string[];
};

type GoogleCustomSearchResponse = {
  items?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    displayLink?: string;
  }>;
};

type PerplexityReviewResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  search_results?: Array<{
    title?: string;
    url?: string;
    snippet?: string;
    source?: string;
  }>;
  citations?: string[];
};

type PerplexityReviewPayload = {
  summary?: string;
  risk_level?: RiskSeverity;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
  top_complaints?: string[];
  red_flags?: string[];
  sources?: Array<{
    provider?: string;
    reference_type?: string;
    title?: string;
    url?: string;
    snippet?: string;
    sentiment?: ReputationSource["sentiment"];
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

type ReferenceStrategy = {
  match: string[];
  entityType: ReputationEntityType | null;
  referenceType: string;
  targetRoles: string[];
  sourceDomains: string[];
  queryTerms: string[];
};

const DEFAULT_SOCIAL_DOMAINS = ["reddit.com", "news.ycombinator.com", "quora.com"];

export const DOCUMENT_REFERENCE_STRATEGIES: ReferenceStrategy[] = [
  {
    match: ["residential lease", "sublease", "lease", "rental"],
    entityType: "landlord",
    referenceType: "Tenant discussion and housing record",
    targetRoles: ["landlord", "lessor", "property manager", "owner", "management"],
    sourceDomains: ["reddit.com", "openigloo.com", "bbb.org", "badlandlords.sail.codes"],
    queryTerms: ["tenant reviews", "landlord complaints", "maintenance", "deposit", "eviction", "housing violations"],
  },
  {
    match: ["mortgage", "loan agreement", "promissory note", "credit card", "cardholder"],
    entityType: "company",
    referenceType: "Borrower complaint and regulatory record",
    targetRoles: ["lender", "issuer", "bank", "creditor", "company"],
    sourceDomains: ["reddit.com", "consumerfinance.gov", "bbb.org"],
    queryTerms: ["complaints", "fees", "servicing", "billing", "CFPB"],
  },
  {
    match: ["hoa", "homeowners association", "ccrs"],
    entityType: "company",
    referenceType: "Owner discussion and association record",
    targetRoles: ["association", "hoa", "management", "company"],
    sourceDomains: ["reddit.com", "bbb.org"],
    queryTerms: ["complaints", "fines", "maintenance", "board", "management"],
  },
  {
    match: ["employment", "offer letter", "employee handbook", "severance", "separation"],
    entityType: "company",
    referenceType: "Worker discussion and employment record",
    targetRoles: ["employer", "company", "client", "customer"],
    sourceDomains: ["reddit.com", "teamblind.com", "indeed.com", "bbb.org"],
    queryTerms: ["employee complaints", "workplace", "pay", "layoffs", "management"],
  },
  {
    match: ["non disclosure", "non compete", "non solicitation", "independent contractor", "statement of work", "ip assignment"],
    entityType: "company",
    referenceType: "Contractor/vendor discussion",
    targetRoles: ["client", "customer", "company", "vendor"],
    sourceDomains: DEFAULT_SOCIAL_DOMAINS,
    queryTerms: ["contractor complaints", "unpaid", "scope creep", "vendor dispute", "legal dispute"],
  },
  {
    match: ["terms of service", "end user license", "privacy policy"],
    entityType: "company",
    referenceType: "User discussion and privacy/regulatory record",
    targetRoles: ["provider", "platform", "company", "service"],
    sourceDomains: ["reddit.com", "tosdr.org", "bbb.org", "ftc.gov"],
    queryTerms: ["user complaints", "privacy", "billing", "account cancellation", "data sharing"],
  },
  {
    match: ["bill of sale"],
    entityType: "company",
    referenceType: "Seller marketplace discussion",
    targetRoles: ["seller", "dealer", "company"],
    sourceDomains: ["reddit.com", "bbb.org"],
    queryTerms: ["seller complaints", "refund", "warranty", "title issue"],
  },
  {
    match: ["prenuptial", "postnuptial", "last will", "power of attorney"],
    entityType: null,
    referenceType: "Professional or public-record context",
    targetRoles: ["attorney", "firm", "preparer"],
    sourceDomains: ["reddit.com", "bbb.org"],
    queryTerms: ["complaints", "discipline", "malpractice"],
  },
  {
    match: ["other"],
    entityType: "company",
    referenceType: "Public discussion",
    targetRoles: ["platform", "provider", "service", "company", "vendor", "client"],
    sourceDomains: DEFAULT_SOCIAL_DOMAINS,
    queryTerms: ["reviews", "complaints", "reddit"],
  },
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isLikelyOrganization(name: string) {
  return /\b(llc|inc|corp|company|co\.|ltd|lp|llp|pllc|group|holdings|properties|apartments|management|venture|platform|services|association|bank|credit union|university|foundation)\b/i.test(
    name,
  );
}

function getReferenceStrategy(documentType: string | null): ReferenceStrategy {
  const normalized = (documentType ?? "other").toLowerCase();
  return (
    DOCUMENT_REFERENCE_STRATEGIES.find((strategy) =>
      strategy.match.some((term) => normalized.includes(term)),
    ) ?? DOCUMENT_REFERENCE_STRATEGIES[DOCUMENT_REFERENCE_STRATEGIES.length - 1]
  );
}

function maybeTrimEntityName(name: string) {
  return normalizeWhitespace(
    name
      .replace(/\b(the employee|employee|contractor|vendor|tenant|resident)\b/gi, "")
      .replace(/[,:;]+$/g, ""),
  );
}

function getPublicSearchName(entityName: string): string {
  const cleaned = normalizeWhitespace(
    entityName
      .replace(/\bUSDS Joint Venture\b/gi, "")
      .replace(/\bJoint Venture\b/gi, "")
      .replace(/\b(llc|inc|corp|corporation|company|co\.|ltd|lp|llp|pllc)\b\.?/gi, "")
      .replace(/\s+/g, " "),
  );

  if (cleaned.length >= 3) return cleaned;
  return entityName;
}

function pickTargetByRole(
  parties: DocumentParty[],
  strategy: ReferenceStrategy,
) {
  for (const role of strategy.targetRoles) {
    const match = parties.find((party) => party.role.toLowerCase().includes(role));
    if (match?.name) {
      return maybeTrimEntityName(match.name);
    }
  }

  for (const party of parties) {
    const candidate = maybeTrimEntityName(party.name);
    if (!candidate) continue;
    if (strategy.entityType === "company" && isLikelyOrganization(candidate)) return candidate;
    if (strategy.entityType === "landlord" && isLikelyOrganization(candidate)) return candidate;
  }

  return null;
}

export function inferReviewTarget(
  documentType: string | null,
  parties: DocumentParty[],
): ReviewTarget | null {
  const strategy = getReferenceStrategy(documentType);
  if (!strategy.entityType) {
    console.log("[fineprint:reputation] no lookup strategy for document type", {
      documentType,
      referenceType: strategy.referenceType,
    });
    return null;
  }

  const entityName = pickTargetByRole(parties, strategy);
  if (!entityName || entityName.length < 3) {
    console.log("[fineprint:reputation] no target entity found from parties", {
      documentType,
      strategy,
      parties,
    });
    return null;
  }

  // Avoid aggregating reputation for what looks like a private individual.
  if (!isLikelyOrganization(entityName)) {
    console.log("[fineprint:reputation] target was not treated as an organization", {
      documentType,
      entityName,
      parties,
      note:
        "This commonly happens when privacy review sends anonymized names such as [Company 1], which cannot be searched publicly.",
    });
    return null;
  }

  const target = {
    entityName,
    searchName: getPublicSearchName(entityName),
    entityType: strategy.entityType,
    contractType: documentType,
    referenceType: strategy.referenceType,
    sourceDomains: strategy.sourceDomains,
    queryTerms: strategy.queryTerms,
  };
  console.log("[fineprint:reputation] inferred review target", target);
  return target;
}

function buildQuery(target: ReviewTarget) {
  return `"${target.searchName}" (${target.queryTerms.join(" OR ")})`;
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

function parseJsonObject(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const parsed = JSON.parse(match[0]) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
}

function validRiskLevel(value: unknown): RiskSeverity | null {
  return value === "HIGH" || value === "MEDIUM" || value === "LOW" ? value : null;
}

function validConfidence(value: unknown): ReputationReport["confidence"] | null {
  return value === "HIGH" || value === "MEDIUM" || value === "LOW" ? value : null;
}

function validSentiment(value: unknown): ReputationSource["sentiment"] {
  return value === "positive" ||
    value === "mixed" ||
    value === "negative" ||
    value === "neutral"
    ? value
    : "neutral";
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

async function searchPerplexity(target: ReviewTarget): Promise<ReputationReport> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return buildUnavailableReport(
      target,
      "External review lookup is available once PERPLEXITY_API_KEY is configured.",
    );
  }

  const response = await fetch("https://api.perplexity.ai/v1/sonar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
    body: JSON.stringify({
      model: "sonar-pro",
      temperature: 0.1,
      max_tokens: 1800,
      search_domain_filter: target.sourceDomains.slice(0, 20),
      web_search_options: { search_context_size: "medium" },
      response_format: {
        type: "json_schema",
        json_schema: {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              risk_level: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
              confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
              top_complaints: { type: "array", items: { type: "string" } },
              red_flags: { type: "array", items: { type: "string" } },
              sources: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    provider: { type: "string" },
                    reference_type: { type: "string" },
                    title: { type: "string" },
                    url: { type: "string" },
                    snippet: { type: "string" },
                    sentiment: {
                      type: "string",
                      enum: ["positive", "mixed", "negative", "neutral"],
                    },
                  },
                  required: ["provider", "reference_type", "title", "url", "snippet", "sentiment"],
                },
              },
            },
            required: ["summary", "risk_level", "confidence", "top_complaints", "red_flags", "sources"],
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You find public reputation signals for legal-document counterparties. Use only public sources from the search results. Never use Trustpilot or Glassdoor. Do not invent reviews, ratings, counts, people, or URLs. Prefer direct Reddit/social discussions and official complaint or public-record pages when available.",
        },
        {
          role: "user",
          content: `Find public reputation references for "${target.searchName}" related to a ${target.contractType ?? "legal document"}.

Legal counterparty name from the document: ${target.entityName}

Reference type to assign by default: ${target.referenceType}
Preferred query concepts: ${target.queryTerms.join(", ")}

Return concise JSON. Include at most 5 sources. Each source must have a working URL from the search results and a one-sentence snippet. If evidence is thin, set confidence to LOW and say so in the summary.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[fineprint:reputation] Perplexity lookup failed", {
      status: response.status,
      body: errorBody.slice(0, 1000),
    });

    return buildUnavailableReport(
      target,
      `Perplexity review lookup failed with status ${response.status}.`,
    );
  }

  const data = (await response.json()) as PerplexityReviewResponse;
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonObject(content) as PerplexityReviewPayload | null;

  const searchResults = Array.isArray(data.search_results) ? data.search_results : [];
  const fallbackSources: ReputationSource[] = searchResults.slice(0, 5).flatMap((source) => {
    const url = normalizeWhitespace(source.url ?? "");
    const title = normalizeWhitespace(source.title ?? "");
    const snippet = normalizeWhitespace(source.snippet ?? "");
    if (!url && !title && !snippet) return [];
    return [
      {
        provider: source.source ?? "Perplexity",
        reference_type: target.referenceType,
        title,
        url,
        snippet,
        sentiment: classifySentiment(`${title} ${snippet}`),
      },
    ];
  });

  const sources = Array.isArray(parsed?.sources)
    ? parsed.sources.flatMap((source) => {
        const url = normalizeWhitespace(source.url ?? "");
        const title = normalizeWhitespace(source.title ?? "");
        const snippet = normalizeWhitespace(source.snippet ?? "");
        if (!url && !title && !snippet) return [];
        return [
          {
            provider: normalizeWhitespace(source.provider ?? "Perplexity"),
            reference_type: normalizeWhitespace(source.reference_type ?? target.referenceType),
            title,
            url,
            snippet,
            sentiment: validSentiment(source.sentiment),
          },
        ];
      })
    : fallbackSources;

  if (sources.length === 0) {
    return buildUnavailableReport(
      target,
      "No public social or official-reference results were found for this counterparty.",
    );
  }

  const snippets = sources.map((source) => `${source.title} ${source.snippet}`.trim());
  const negativeCount = sources.filter((source) => source.sentiment === "negative").length;
  const positiveCount = sources.filter((source) => source.sentiment === "positive").length;
  const redFlags =
    Array.isArray(parsed?.red_flags) && parsed.red_flags.length > 0
      ? parsed.red_flags.filter((item): item is string => typeof item === "string").slice(0, 5)
      : extractRedFlags(snippets);
  const topComplaints =
    Array.isArray(parsed?.top_complaints) && parsed.top_complaints.length > 0
      ? parsed.top_complaints.filter((item): item is string => typeof item === "string").slice(0, 3)
      : summarizeComplaints(snippets);

  const riskLevel =
    validRiskLevel(parsed?.risk_level) ??
    getRiskLevel(negativeCount, positiveCount, redFlags);

  return {
    status: "available",
    entity_name: target.entityName,
    entity_type: target.entityType,
    contract_type: target.contractType,
    provider: "perplexity-sonar",
    risk_level: riskLevel,
    average_rating: null,
    review_count: null,
    confidence: validConfidence(parsed?.confidence) ?? (sources.length >= 5 ? "MEDIUM" : "LOW"),
    summary:
      typeof parsed?.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : `Public references for ${target.entityName} were found, but evidence was limited.`,
    top_complaints: topComplaints,
    red_flags: redFlags,
    sources,
    disclaimer:
      "These are public social and official-reference signals, not verified findings. Posts and search results can be biased, incomplete, stale, or about a similarly named entity.",
    searched_at: new Date().toISOString(),
  };
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
      reference_type: target.referenceType,
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
  if (!target) {
    console.log("[fineprint:reputation] returning null because no searchable counterparty target was inferred", {
      documentType,
      parties,
    });
    return null;
  }

  const provider = process.env.PERPLEXITY_API_KEY ? "perplexity-sonar" : "google-cse";
  const cacheKey = `${provider}:${target.entityType}:${slugify(target.searchName)}:${slugify(target.contractType ?? "unknown")}`;
  const cached = await readCache(cacheKey);
  if (cached) {
    console.log("[fineprint:reputation] cache hit", {
      cacheKey,
      provider,
      status: cached.status,
      sourceCount: cached.sources?.length ?? 0,
    });
    return cached;
  }

  const report = provider === "perplexity-sonar"
    ? await searchPerplexity(target)
    : await searchGoogleCustomSearch(target);
  console.log("[fineprint:reputation] lookup complete", {
    provider,
    cacheKey,
    status: report.status,
    sourceCount: report.sources.length,
    summary: report.summary,
  });
  await writeCache(cacheKey, target, report);
  return report;
}
