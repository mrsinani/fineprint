import { TAXONOMY } from "./taxonomy";

type Severity = "HIGH" | "MEDIUM" | "LOW";

const severityToTier: Record<Severity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
const tierToSeverity: Record<number, Severity> = { 0: "LOW", 1: "MEDIUM", 2: "HIGH" };

export function computeClauseSeverity(clause: {
  category: string[];
  quote: string;
}): { severity: Severity; triggered_features: string[] } {
  // Evaluate ALL matched taxonomy categories, use the highest base severity tier
  const matchedEntries = clause.category
    .map((catId) => TAXONOMY.find((t) => t.id === catId))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);

  const baseTier = matchedEntries.reduce((max, entry) => {
    const t = severityToTier[entry.baseSeverity];
    return t > max ? t : max;
  }, 0);

  const categoryIds = new Set(clause.category);

  let tier = baseTier;
  const triggered_features: string[] = [];
  const q = clause.quote.toLowerCase();

  // +1: "without notice" or "at any time" — always
  if (q.includes("without notice") || q.includes("at any time")) {
    tier += 1;
    triggered_features.push("unilateral action without notice");
  }

  // +1: "irrevocable" or "perpetual" — only for ip_ownership or data_collection_sharing
  if (
    (q.includes("irrevocable") || q.includes("perpetual")) &&
    (categoryIds.has("ip_ownership") || categoryIds.has("data_collection_sharing"))
  ) {
    tier += 1;
    triggered_features.push("irrevocable or perpetual grant");
  }

  // +1: "unlimited" or " all " — only for liability_cap_exclusion or indemnification
  if (
    (q.includes("unlimited") || q.includes(" all ")) &&
    (categoryIds.has("liability_cap_exclusion") || categoryIds.has("indemnification"))
  ) {
    tier += 1;
    triggered_features.push("unlimited or all-encompassing scope");
  }

  // +1: notice period < 7 days — only for termination_rights
  if (categoryIds.has("termination_rights")) {
    const shortNoticeMatch = q.match(/\b([1-6])\s*day/);
    if (shortNoticeMatch) {
      tier += 1;
      triggered_features.push(`short notice period (${shortNoticeMatch[1]} day)`);
    }
  }

  // -1: notice period >= 30 days — only for termination_rights
  if (categoryIds.has("termination_rights")) {
    const longNoticeMatch = q.match(/\b(\d+)\s*day/);
    if (longNoticeMatch && parseInt(longNoticeMatch[1], 10) >= 30) {
      tier -= 1;
      triggered_features.push(`adequate notice period (${longNoticeMatch[1]} days)`);
    }
  }

  // +1: worldwide/global/international scope — only for non_compete_non_solicitation
  if (
    categoryIds.has("non_compete_non_solicitation") &&
    (q.includes("worldwide") || q.includes("global") || q.includes("international"))
  ) {
    tier += 1;
    triggered_features.push("broad geographic scope");
  }

  // -1: user rights preserved — always
  if (q.includes("you retain") || q.includes("user retains") || q.includes("your rights")) {
    tier -= 1;
    triggered_features.push("user rights explicitly preserved");
  }

  // Clamp to [0, 2]
  tier = Math.max(0, Math.min(2, tier));

  return { severity: tierToSeverity[tier], triggered_features };
}

export function computeDocumentScore(clauses: { severity: Severity }[]): number {
  let highCount = 0;
  let medCount = 0;
  let lowCount = 0;

  for (const clause of clauses) {
    if (clause.severity === "HIGH") highCount++;
    else if (clause.severity === "MEDIUM") medCount++;
    else lowCount++;
  }

  return Math.min(highCount * 18 + medCount * 7 + lowCount * 2, 100);
}
