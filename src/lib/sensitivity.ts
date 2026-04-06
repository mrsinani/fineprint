export type SensitivityLevel =
  | "VERY_LOW"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "VERY_HIGH";

export type SensitivityCategory = {
  id: string;
  name: string;
  question: string;
  description: string;
  icon: string;
  taxonomyIds: string[];
  defaultLevel: SensitivityLevel;
};

export type UserSensitivityPreferences = Record<string, SensitivityLevel>;

export const SENSITIVITY_CATEGORIES: SensitivityCategory[] = [
  {
    id: "money_fees",
    name: "Money & Hidden Fees",
    question: "Will I be charged things I don't expect?",
    description:
      "Cancellation fees, late fees, interest charges, and surprise costs buried in the fine print.",
    icon: "DollarSign",
    taxonomyIds: [
      "price_changes_fee_escalation",
      "payment_billing",
      "auto_renewal_cancellation",
    ],
    defaultLevel: "MEDIUM",
  },
  {
    id: "data_privacy",
    name: "Data Sharing & Privacy",
    question: "Where does my data go?",
    description:
      "Third-party data sharing, selling personal information, behavioral tracking.",
    icon: "Eye",
    taxonomyIds: ["data_collection_sharing", "privacy_surveillance"],
    defaultLevel: "MEDIUM",
  },
  {
    id: "intellectual_property",
    name: "Intellectual Property",
    question: "Can they claim ownership of my work?",
    description:
      "IP transfers, broad license grants, work-for-hire provisions.",
    icon: "Lightbulb",
    taxonomyIds: ["ip_ownership"],
    defaultLevel: "MEDIUM",
  },
  {
    id: "commitment_lockin",
    name: "Commitment & Lock-in",
    question: "How hard is it to leave?",
    description:
      "Auto-renewals, cancellation penalties, minimum contract terms.",
    icon: "Lock",
    taxonomyIds: ["auto_renewal_cancellation", "termination_rights"],
    defaultLevel: "MEDIUM",
  },
  {
    id: "legal_rights",
    name: "Legal Rights & Disputes",
    question: "Can I fight back if something goes wrong?",
    description:
      "Mandatory arbitration, class action waivers, jurisdiction clauses.",
    icon: "Scale",
    taxonomyIds: ["arbitration_class_action", "governing_law_jurisdiction"],
    defaultLevel: "MEDIUM",
  },
  {
    id: "liability_exposure",
    name: "Liability & Risk Exposure",
    question: "Who's on the hook when things break?",
    description:
      "Liability caps, indemnification obligations, warranty disclaimers.",
    icon: "ShieldAlert",
    taxonomyIds: [
      "liability_cap_exclusion",
      "indemnification",
      "warranty_disclaimer",
    ],
    defaultLevel: "MEDIUM",
  },
  {
    id: "account_control",
    name: "Account Control & Content",
    question: "Can they kill my account or remove my stuff?",
    description:
      "Account suspension, content removal, unilateral platform discretion.",
    icon: "UserX",
    taxonomyIds: ["content_moderation_suspension", "termination_rights"],
    defaultLevel: "MEDIUM",
  },
  {
    id: "employment_competition",
    name: "Employment & Competition",
    question: "Can this limit my future career?",
    description:
      "Non-competes, non-solicitation, broad confidentiality obligations.",
    icon: "Briefcase",
    taxonomyIds: ["non_compete_non_solicitation", "confidentiality_nda"],
    defaultLevel: "MEDIUM",
  },
  {
    id: "unilateral_changes",
    name: "Unilateral Changes",
    question: "Can they change the deal after I agree?",
    description:
      "Terms modifications, price changes, feature removal without notice.",
    icon: "PenLine",
    taxonomyIds: ["price_changes_fee_escalation", "assignment_transfer"],
    defaultLevel: "MEDIUM",
  },
];

// ---------- Reverse mapping: taxonomy ID → sensitivity category IDs ----------

const _taxonomyToSensitivity = new Map<string, string[]>();
for (const cat of SENSITIVITY_CATEGORIES) {
  for (const taxId of cat.taxonomyIds) {
    const existing = _taxonomyToSensitivity.get(taxId) ?? [];
    existing.push(cat.id);
    _taxonomyToSensitivity.set(taxId, existing);
  }
}

export function getSensitivityCategoriesForTaxonomy(
  taxonomyIds: string[],
): string[] {
  const result = new Set<string>();
  for (const taxId of taxonomyIds) {
    const ids = _taxonomyToSensitivity.get(taxId);
    if (ids) for (const id of ids) result.add(id);
  }
  return Array.from(result);
}

export function getDefaultPreferences(): UserSensitivityPreferences {
  const prefs: UserSensitivityPreferences = {};
  for (const cat of SENSITIVITY_CATEGORIES) {
    prefs[cat.id] = cat.defaultLevel;
  }
  return prefs;
}

// ---------- Persona presets ----------

export type PersonaPreset = {
  id: string;
  name: string;
  description: string;
  icon: string;
  preferences: UserSensitivityPreferences;
};

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: "app_service",
    name: "App or service signup",
    description: "SaaS, streaming, social media, etc.",
    icon: "Smartphone",
    preferences: {
      money_fees: "HIGH",
      data_privacy: "VERY_HIGH",
      intellectual_property: "LOW",
      commitment_lockin: "HIGH",
      legal_rights: "MEDIUM",
      liability_exposure: "LOW",
      account_control: "HIGH",
      employment_competition: "VERY_LOW",
      unilateral_changes: "HIGH",
    },
  },
  {
    id: "freelancer",
    name: "Freelance / contractor",
    description: "Client contracts, SOWs, independent work",
    icon: "PenTool",
    preferences: {
      money_fees: "HIGH",
      data_privacy: "MEDIUM",
      intellectual_property: "VERY_HIGH",
      commitment_lockin: "MEDIUM",
      legal_rights: "HIGH",
      liability_exposure: "VERY_HIGH",
      account_control: "LOW",
      employment_competition: "HIGH",
      unilateral_changes: "MEDIUM",
    },
  },
  {
    id: "lease",
    name: "Signing a lease",
    description: "Apartment, office, equipment rental",
    icon: "Home",
    preferences: {
      money_fees: "VERY_HIGH",
      data_privacy: "LOW",
      intellectual_property: "VERY_LOW",
      commitment_lockin: "VERY_HIGH",
      legal_rights: "HIGH",
      liability_exposure: "HIGH",
      account_control: "VERY_LOW",
      employment_competition: "VERY_LOW",
      unilateral_changes: "HIGH",
    },
  },
  {
    id: "employment",
    name: "Starting a new job",
    description: "Employment contracts, offer letters",
    icon: "Building2",
    preferences: {
      money_fees: "MEDIUM",
      data_privacy: "MEDIUM",
      intellectual_property: "VERY_HIGH",
      commitment_lockin: "MEDIUM",
      legal_rights: "MEDIUM",
      liability_exposure: "MEDIUM",
      account_control: "LOW",
      employment_competition: "VERY_HIGH",
      unilateral_changes: "MEDIUM",
    },
  },
];

// ---------- Sensitivity multipliers for scoring ----------

const SENSITIVITY_MULTIPLIERS: Record<SensitivityLevel, number> = {
  VERY_LOW: 0.25,
  LOW: 0.5,
  MEDIUM: 1.0,
  HIGH: 1.5,
  VERY_HIGH: 2.0,
};

export function getSensitivityMultiplier(
  clauseCategories: string[],
  prefs: UserSensitivityPreferences,
): number {
  const sensIds = getSensitivityCategoriesForTaxonomy(clauseCategories);
  if (sensIds.length === 0) return 1.0;

  let max = 0;
  for (const id of sensIds) {
    const level = prefs[id] ?? "MEDIUM";
    const m = SENSITIVITY_MULTIPLIERS[level] ?? 1.0;
    if (m > max) max = m;
  }
  return max;
}
