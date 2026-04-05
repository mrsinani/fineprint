import { createClient } from "@/lib/supabase/server";
import type {
  ActionCategory,
  ActionItem,
  AnalysisResult,
  DocumentAnalysisPageData,
  DocumentParty,
  KeyTerm,
  KeyTermIcon,
  RiskClause,
  RiskSeverity,
} from "@/components/analysis/types";

const SAMPLE_DOCUMENT_TEXT = `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into on March 1, 2026 between Atlas Design Studio LLC ("Client") and Northwind Product Labs Inc. ("Vendor").

Vendor will provide product strategy, UX design, and implementation support for the Client's internal tools program. The initial term is twelve months unless terminated earlier under this Agreement.

Either party may terminate this Agreement for convenience upon 10 days' written notice.
Client may withhold any disputed payment amounts until Vendor resolves the issue to Client's sole satisfaction.
Vendor shall indemnify, defend, and hold harmless Client from and against any and all claims, damages, losses, liabilities, costs, and expenses arising out of or related to Vendor's services, regardless of whether Client contributed to the claim.
Any work product, ideas, code, documentation, know-how, or inventions conceived, reduced to practice, or developed by Vendor during the term shall be deemed works made for hire and shall belong exclusively to Client, whether or not created specifically for the project.
Invoices are due within 45 days of receipt.
Vendor may not assign this Agreement without Client's prior written consent.
The parties will first attempt to resolve disputes informally.
Any unresolved dispute will be submitted to binding arbitration in Delaware, and each party waives any right to participate in a class or representative action.
Confidential information must be protected for five years after disclosure.
Either party may request deletion or return of confidential materials at the end of the engagement.`;

function findOffsets(text: string, quote: string) {
  const char_start = text.indexOf(quote);
  if (char_start === -1) {
    return { char_start: 0, char_end: Math.min(quote.length, text.length) };
  }

  return {
    char_start,
    char_end: char_start + quote.length,
  };
}

function buildClause(
  id: string,
  title: string,
  severity: RiskSeverity,
  description: string,
  recommendation: string,
  quote: string,
): RiskClause {
  const { char_start, char_end } = findOffsets(SAMPLE_DOCUMENT_TEXT, quote);

  return {
    id,
    title,
    severity,
    description,
    recommendation,
    quote,
    char_start,
    char_end,
    page_number: 1,
  };
}

const SAMPLE_PARTIES: DocumentParty[] = [
  { role: "Client", name: "Atlas Design Studio LLC" },
  { role: "Vendor", name: "Northwind Product Labs Inc." },
  { role: "Effective Date", name: "March 1, 2026" },
  { role: "Dispute Forum", name: "Binding arbitration in Delaware" },
];

const SAMPLE_KEY_TERMS: KeyTerm[] = [
  {
    id: "term-termination",
    title: "Termination for convenience",
    description: "Either side can end the deal without cause, which makes the engagement less predictable.",
    icon: "calendar",
  },
  {
    id: "term-ip",
    title: "Work made for hire",
    description: "Anything created during the engagement automatically belongs to the client unless the contract is narrowed.",
    icon: "file-text",
  },
  {
    id: "term-indemnity",
    title: "Broad indemnity",
    description: "The vendor is taking on legal and financial exposure for claims tied to the work, even when the client shares blame.",
    icon: "shield",
  },
  {
    id: "term-arbitration",
    title: "Mandatory arbitration",
    description: "Disputes skip court and go to private arbitration in Delaware, which can limit leverage and increase cost.",
    icon: "scale",
  },
];

const SAMPLE_CLAUSES: RiskClause[] = [
  buildClause(
    "clause-indemnity",
    "Unlimited indemnity",
    "HIGH",
    "This clause makes the vendor cover nearly any claim related to the services, even if the client helped cause the problem.",
    "Narrow the indemnity to third-party claims caused by the vendor's negligence or breach, and exclude client-caused issues.",
    "Vendor shall indemnify, defend, and hold harmless Client from and against any and all claims, damages, losses, liabilities, costs, and expenses arising out of or related to Vendor's services, regardless of whether Client contributed to the claim.",
  ),
  buildClause(
    "clause-ip",
    "Overbroad IP assignment",
    "HIGH",
    "The client gets ownership of anything developed during the term, which could sweep in pre-existing tools or general know-how.",
    "Add carve-outs for pre-existing materials, reusable code, and general know-how that are not specifically created for this project.",
    "Any work product, ideas, code, documentation, know-how, or inventions conceived, reduced to practice, or developed by Vendor during the term shall be deemed works made for hire and shall belong exclusively to Client, whether or not created specifically for the project.",
  ),
  buildClause(
    "clause-payment",
    "Subjective payment holdback",
    "MEDIUM",
    "The client can hold disputed amounts until it is satisfied, which may delay payment without a clear resolution process.",
    "Tie withholding rights to specific disputed invoices, add a response deadline, and require undisputed amounts to be paid on time.",
    "Client may withhold any disputed payment amounts until Vendor resolves the issue to Client's sole satisfaction.",
  ),
  buildClause(
    "clause-arbitration",
    "Out-of-state arbitration",
    "MEDIUM",
    "Mandatory arbitration in Delaware may raise cost and reduce practical leverage if the vendor is located elsewhere.",
    "Negotiate a neutral venue, optional mediation first, or mutual small-claims and injunctive-relief carve-outs.",
    "Any unresolved dispute will be submitted to binding arbitration in Delaware, and each party waives any right to participate in a class or representative action.",
  ),
  buildClause(
    "clause-termination",
    "Short termination notice",
    "LOW",
    "A 10-day convenience termination right can disrupt work but is a manageable risk if wind-down rights are added.",
    "Ask for a longer notice period or a paid wind-down period so the vendor can close out work and invoices cleanly.",
    "Either party may terminate this Agreement for convenience upon 10 days' written notice.",
  ),
];

const SAMPLE_ACTION_ITEMS: ActionItem[] = [
  {
    id: "action-indemnity",
    title: "Limit the indemnity language",
    description: "Ask for mutual indemnity language and restrict coverage to third-party claims caused by a party's negligence or breach.",
    category: "legal",
    severity: "HIGH",
  },
  {
    id: "action-ip",
    title: "Protect pre-existing IP",
    description: "Add a schedule listing the vendor's pre-existing materials and a license-back for reusable tools and know-how.",
    category: "negotiate",
    severity: "HIGH",
  },
  {
    id: "action-payment",
    title: "Clarify payment dispute mechanics",
    description: "Require undisputed amounts to be paid on time and define a firm cure window for resolving disputed invoices.",
    category: "finance",
    severity: "MEDIUM",
  },
  {
    id: "action-arbitration",
    title: "Review the dispute venue",
    description: "Decide whether Delaware arbitration is realistic and whether mediation or a local venue would be more practical.",
    category: "operations",
    severity: "MEDIUM",
  },
  {
    id: "action-termination",
    title: "Plan for early termination",
    description: "Make sure there is a wind-down plan, final invoice process, and handoff checklist if either side ends the deal early.",
    category: "signing",
    severity: "LOW",
  },
];

function buildSampleAnalysis(): AnalysisResult {
  return {
    overview:
      "This services agreement is workable, but it leans in the client's favor on indemnity, intellectual property ownership, and payment leverage. The biggest negotiation points are legal exposure and making sure the vendor keeps control over pre-existing tools and know-how.",
    parties: SAMPLE_PARTIES,
    key_terms: SAMPLE_KEY_TERMS,
    plain_english: [
      "You can be asked to cover broad legal costs, even if the client partly caused the problem.",
      "Anything you create during the engagement may automatically belong to the client unless the language is narrowed.",
      "The client has strong leverage to delay payment if it claims a dispute.",
      "If a dispute escalates, you may have to arbitrate in Delaware instead of handling it locally.",
    ],
    risk_score: 68,
    clauses: SAMPLE_CLAUSES,
    action_items: SAMPLE_ACTION_ITEMS,
    document_text: SAMPLE_DOCUMENT_TEXT,
    pdf_url: null,
    storage_path: null,
  };
}

function formatDate(value?: string | null) {
  if (!value) return "Apr 2, 2026";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildSampleDocument(id: string): DocumentAnalysisPageData {
  return {
    id,
    title: "Master Services Agreement",
    file_name: "atlas-northwind-msa.pdf",
    file_type: "PDF",
    page_count: 6,
    created_at: "Apr 2, 2026",
    updated_at: "Apr 2, 2026",
    analysis: buildSampleAnalysis(),
    source: "sample",
  };
}

function severityFromLevel(level: number): RiskSeverity {
  if (level >= 3) return "HIGH";
  if (level === 2) return "MEDIUM";
  return "LOW";
}

function iconFromCategory(category: string): ActionCategory {
  if (category === "finance" || category === "payment") return "finance";
  if (category === "operations") return "operations";
  if (category === "signing") return "signing";
  if (category === "legal") return "legal";
  return "negotiate";
}

function termIconFromLabel(label: string): KeyTermIcon {
  const normalized = label.toLowerCase();
  if (normalized.includes("date") || normalized.includes("term")) return "calendar";
  if (normalized.includes("indemn") || normalized.includes("confidential")) return "shield";
  if (normalized.includes("arbitr") || normalized.includes("dispute")) return "scale";
  if (normalized.includes("party")) return "users";
  if (normalized.includes("risk")) return "alert-triangle";
  return "file-text";
}

function deriveActionItems(clauses: RiskClause[]): ActionItem[] {
  return clauses.map((clause) => ({
    id: `action-${clause.id}`,
    title: clause.title,
    description: clause.recommendation,
    category: iconFromCategory(
      clause.title.toLowerCase().includes("payment")
        ? "finance"
        : clause.title.toLowerCase().includes("arbitration")
          ? "operations"
          : "legal",
    ),
    severity: clause.severity,
  }));
}

function normalizeAnalysisResult(raw: Record<string, unknown>): AnalysisResult | null {
  const overview =
    typeof raw.overview === "string"
      ? raw.overview
      : typeof raw.summary === "string"
        ? raw.summary
        : null;

  if (!overview) return null;

  const documentText =
    typeof raw.document_text === "string"
      ? raw.document_text
      : typeof raw.text === "string"
        ? raw.text
        : SAMPLE_DOCUMENT_TEXT;

  const rawParties = Array.isArray(raw.parties) ? raw.parties : [];
  const parties: DocumentParty[] =
    rawParties.length > 0
      ? rawParties.flatMap((party, index) => {
          if (!party || typeof party !== "object") return [];
          const role = typeof party.role === "string" ? party.role : `Party ${index + 1}`;
          const name = typeof party.name === "string" ? party.name : "Unknown";
          return [{ role, name }];
        })
      : SAMPLE_PARTIES;

  const rawTerms = Array.isArray(raw.key_terms)
    ? raw.key_terms
    : Array.isArray(raw.obligations)
      ? raw.obligations
      : [];

  const key_terms: KeyTerm[] =
    rawTerms.length > 0
      ? rawTerms.flatMap((term, index) => {
          if (typeof term === "string") {
            return [
              {
                id: `term-${index}`,
                title: `Key point ${index + 1}`,
                description: term,
                icon: termIconFromLabel(term),
              },
            ];
          }

          if (!term || typeof term !== "object") return [];

          const title =
            typeof term.title === "string" ? term.title : `Key point ${index + 1}`;
          const description =
            typeof term.description === "string"
              ? term.description
              : typeof term.summary === "string"
                ? term.summary
                : title;

          return [
            {
              id: typeof term.id === "string" ? term.id : `term-${index}`,
              title,
              description,
              icon: termIconFromLabel(title),
            },
          ];
        })
      : SAMPLE_KEY_TERMS;

  const rawClauses = Array.isArray(raw.clauses)
    ? raw.clauses
    : Array.isArray(raw.risky_clauses)
      ? raw.risky_clauses
      : [];

  const clauses: RiskClause[] =
    rawClauses.length > 0
      ? rawClauses.flatMap((clause, index) => {
          if (Array.isArray(clause)) {
            const description = typeof clause[0] === "string" ? clause[0] : "Flagged clause";
            const severity = severityFromLevel(
              typeof clause[1] === "number" ? clause[1] : 1,
            );
            const quote = typeof clause[2] === "string" ? clause[2] : description;
            const { char_start, char_end } = findOffsets(documentText, quote);

            return [
              {
                id: `clause-${index}`,
                title: `Risk ${index + 1}`,
                severity,
                description,
                recommendation: "Review this clause and ask for narrower, more balanced language before signing.",
                quote,
                char_start,
                char_end,
                page_number: 1,
              },
            ];
          }

          if (!clause || typeof clause !== "object") return [];

          const quote =
            typeof clause.quote === "string"
              ? clause.quote
              : typeof clause.text === "string"
                ? clause.text
                : typeof clause.description === "string"
                  ? clause.description
                  : "Flagged clause";

          const offsets = {
            char_start:
              typeof clause.char_start === "number"
                ? clause.char_start
                : findOffsets(documentText, quote).char_start,
            char_end:
              typeof clause.char_end === "number"
                ? clause.char_end
                : findOffsets(documentText, quote).char_end,
          };

          return [
            {
              id: typeof clause.id === "string" ? clause.id : `clause-${index}`,
              title:
                typeof clause.title === "string" ? clause.title : `Risk ${index + 1}`,
              severity:
                clause.severity === "HIGH" ||
                clause.severity === "MEDIUM" ||
                clause.severity === "LOW"
                  ? clause.severity
                  : severityFromLevel(
                      typeof clause.severity === "number" ? clause.severity : 1,
                    ),
              description:
                typeof clause.description === "string"
                  ? clause.description
                  : quote,
              recommendation:
                typeof clause.recommendation === "string"
                  ? clause.recommendation
                  : "Review and negotiate this clause before signing.",
              quote,
              char_start: offsets.char_start,
              char_end: offsets.char_end,
              page_number:
                typeof clause.page_number === "number" ? clause.page_number : 1,
            },
          ];
        })
      : SAMPLE_CLAUSES;

  const rawPlainEnglish = Array.isArray(raw.plain_english)
    ? raw.plain_english
    : Array.isArray(raw.obligations)
      ? raw.obligations
      : [];

  const plain_english = rawPlainEnglish.filter(
    (entry): entry is string => typeof entry === "string",
  );

  const rawActionItems = Array.isArray(raw.action_items) ? raw.action_items : [];
  const action_items: ActionItem[] =
    rawActionItems.length > 0
      ? rawActionItems.flatMap((item, index) => {
          if (!item || typeof item !== "object") return [];

          return [
            {
              id: typeof item.id === "string" ? item.id : `action-${index}`,
              title:
                typeof item.title === "string"
                  ? item.title
                  : `Action item ${index + 1}`,
              description:
                typeof item.description === "string"
                  ? item.description
                  : "Review this issue before signing.",
              category: iconFromCategory(
                typeof item.category === "string" ? item.category : "negotiate",
              ),
              severity:
                item.severity === "HIGH" ||
                item.severity === "MEDIUM" ||
                item.severity === "LOW"
                  ? item.severity
                  : "MEDIUM",
            },
          ];
        })
      : deriveActionItems(clauses);

  return {
    overview,
    parties,
    key_terms,
    plain_english:
      plain_english.length > 0
        ? plain_english
        : SAMPLE_ACTION_ITEMS.map((item) => item.description),
    risk_score:
      typeof raw.risk_score === "number"
        ? raw.risk_score
        : typeof raw.overall_risk_score === "number"
          ? raw.overall_risk_score * 10
          : 55,
    clauses,
    action_items,
    document_text: documentText,
    pdf_url:
      typeof raw.pdf_url === "string"
        ? raw.pdf_url
        : typeof raw.pdfUrl === "string"
          ? raw.pdfUrl
          : null,
    storage_path:
      typeof raw.storage_path === "string" ? raw.storage_path : null,
  };
}

function normalizeDocumentRecord(
  id: string,
  raw: Record<string, unknown>,
  source: DocumentAnalysisPageData["source"],
): DocumentAnalysisPageData | null {
  const analysisSource =
    raw.analysis && typeof raw.analysis === "object"
      ? (raw.analysis as Record<string, unknown>)
      : raw;

  const analysis = normalizeAnalysisResult(analysisSource);
  if (!analysis) return null;

  return {
    id: typeof raw.id === "string" ? raw.id : id,
    title:
      typeof raw.title === "string"
        ? raw.title
        : typeof raw.name === "string"
          ? raw.name
          : "Untitled analysis",
    file_name:
      typeof raw.file_name === "string"
        ? raw.file_name
        : typeof raw.fileName === "string"
          ? raw.fileName
          : "document.pdf",
    file_type:
      typeof raw.file_type === "string"
        ? raw.file_type
        : typeof raw.fileType === "string"
          ? raw.fileType
          : "PDF",
    page_count:
      typeof raw.page_count === "number"
        ? raw.page_count
        : typeof raw.pages === "number"
          ? raw.pages
          : 1,
    created_at: formatDate(
      typeof raw.created_at === "string"
        ? raw.created_at
        : typeof raw.createdAt === "string"
          ? raw.createdAt
          : null,
    ),
    updated_at: formatDate(
      typeof raw.updated_at === "string"
        ? raw.updated_at
        : typeof raw.updatedAt === "string"
          ? raw.updatedAt
          : null,
    ),
    analysis,
    source,
  };
}

function findLocalMatch(
  value: unknown,
  id: string,
): Record<string, unknown> | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const match = findLocalMatch(entry, id);
      if (match) return match;
    }
    return null;
  }

  if (typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const candidateId =
    typeof record.id === "string"
      ? record.id
      : typeof record.documentId === "string"
        ? record.documentId
        : typeof record.slug === "string"
          ? record.slug
          : null;

  if (candidateId === id) return record;

  if (
    record.analysis &&
    typeof record.analysis === "object" &&
    candidateId === null &&
    (typeof record.title === "string" || typeof record.file_name === "string")
  ) {
    return record;
  }

  for (const nestedValue of Object.values(record)) {
    const match = findLocalMatch(nestedValue, id);
    if (match) return match;
  }

  return null;
}

export function getLocalDocumentAnalysisById(
  id: string,
): DocumentAnalysisPageData | null {
  if (typeof window === "undefined") return null;

  const candidateKeys = [
    `fineprint:document:${id}`,
    `fineprint:analysis:${id}`,
    "fineprint:documents",
    "fineprint:analyses",
    "documents",
    "documentAnalyses",
  ];

  for (const key of candidateKeys) {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) continue;

    try {
      const parsed = JSON.parse(rawValue) as unknown;
      const match = findLocalMatch(parsed, id) ?? (parsed as Record<string, unknown>);
      const normalized = normalizeDocumentRecord(id, match, "localStorage");
      if (normalized) return normalized;
    } catch {
      // Ignore malformed local cache entries and continue scanning.
    }
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || (!key.includes(id) && !key.toLowerCase().includes("fineprint"))) {
      continue;
    }

    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) continue;

    try {
      const parsed = JSON.parse(rawValue) as unknown;
      const match = findLocalMatch(parsed, id);
      if (!match) continue;

      const normalized = normalizeDocumentRecord(id, match, "localStorage");
      if (normalized) return normalized;
    } catch {
      // Ignore malformed local cache entries and continue scanning.
    }
  }

  return null;
}

async function getSupabaseDocumentAnalysisById(
  id: string,
): Promise<DocumentAnalysisPageData | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("id, title, file_name, file_type, page_count, created_at, updated_at, analysis:analysis_results(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data || typeof data !== "object") {
      return null;
    }

    const normalized = normalizeDocumentRecord(
      id,
      data as Record<string, unknown>,
      "supabase",
    );
    if (!normalized) return null;

    if (!normalized.analysis.pdf_url && normalized.analysis.storage_path) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(normalized.analysis.storage_path);

      normalized.analysis.pdf_url = publicUrl || null;
    }

    return normalized;
  } catch {
    return null;
  }
}

export async function getDocumentAnalysisById(
  id: string,
): Promise<DocumentAnalysisPageData> {
  const supabaseDocument = await getSupabaseDocumentAnalysisById(id);
  if (supabaseDocument) return supabaseDocument;

  return buildSampleDocument(id);
}
