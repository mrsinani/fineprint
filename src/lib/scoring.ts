import { TAXONOMY } from "./taxonomy";
import {
  getSensitivityMultiplier,
  type UserSensitivityPreferences,
} from "./sensitivity";

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

  // +1: "without notice" or "at any time" — only for categories where unilateral timing actually matters
  const unilateralCategories = new Set([
    "termination_rights",
    "price_changes_fee_escalation",
    "content_moderation_suspension",
    "auto_renewal_cancellation",
  ]);
  if (
    (q.includes("without notice") || q.includes("at any time")) &&
    clause.category.some((c) => unilateralCategories.has(c))
  ) {
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

// Relative weights — only the ratios matter for the normalized formula below
const SEVERITY_WEIGHTS: Record<Severity, number> = { HIGH: 3, MEDIUM: 1.5, LOW: 0.5 };

export function computeDocumentScore(
  clauses: { severity: Severity; category?: string[] }[],
  sensitivityPrefs?: UserSensitivityPreferences,
): number {
  if (clauses.length === 0) return 0;

  let weightedSum = 0;
  for (const clause of clauses) {
    const weight = SEVERITY_WEIGHTS[clause.severity];
    const multiplier =
      sensitivityPrefs && clause.category?.length
        ? getSensitivityMultiplier(clause.category, sensitivityPrefs)
        : 1.0;
    weightedSum += weight * multiplier;
  }

  // Normalize against "all clauses are HIGH" so the score reflects proportion of
  // severity rather than raw count — prevents long documents from always hitting 100.
  const maxPossible = clauses.length * SEVERITY_WEIGHTS.HIGH;
  return Math.min(Math.round((weightedSum / maxPossible) * 100), 100);
}
