export type TaxonomyCategory = {
  id: string;
  name: string;
  description: string;
  baseSeverity: "HIGH" | "MEDIUM" | "LOW";
  exampleSignals: string[];
};

export const TAXONOMY: TaxonomyCategory[] = [
  {
    id: "arbitration_class_action",
    name: "Arbitration & Class Action Waiver",
    description: "Clauses requiring disputes to be resolved through private arbitration and waiving the right to join class action lawsuits.",
    baseSeverity: "HIGH",
    exampleSignals: [
      "mandatory binding arbitration",
      "waiver of right to jury trial",
      "class action waiver",
      "arbitration instead of court",
    ],
  },
  {
    id: "liability_cap_exclusion",
    name: "Liability Cap & Exclusion",
    description: "Provisions limiting the maximum damages recoverable or excluding certain categories of liability entirely.",
    baseSeverity: "HIGH",
    exampleSignals: [
      "in no event shall liability exceed",
      "limitation of liability",
      "excludes consequential damages",
      "maximum aggregate liability",
    ],
  },
  {
    id: "indemnification",
    name: "Indemnification",
    description: "Requirements that one party defend and hold harmless the other party from third-party claims, costs, and damages.",
    baseSeverity: "HIGH",
    exampleSignals: [
      "you shall indemnify",
      "hold harmless",
      "defend and indemnify",
      "costs and attorneys' fees",
    ],
  },
  {
    id: "ip_ownership",
    name: "Intellectual Property & Ownership",
    description: "Clauses transferring intellectual property rights, including assignment of inventions, work-made-for-hire provisions, and broad license grants.",
    baseSeverity: "HIGH",
    exampleSignals: [
      "all intellectual property shall vest in",
      "irrevocable license",
      "work made for hire",
      "assign all rights",
    ],
  },
  {
    id: "non_compete_non_solicitation",
    name: "Non-Compete & Non-Solicitation",
    description: "Restrictions preventing a party from working for competitors, soliciting clients or employees, or engaging in competing business activities.",
    baseSeverity: "HIGH",
    exampleSignals: [
      "shall not compete",
      "non-solicitation",
      "competing business",
      "restricted territory",
    ],
  },
  {
    id: "data_collection_sharing",
    name: "Data Collection & Sharing",
    description: "Provisions governing what personal data is collected, how it is used, and whether it is shared or sold to third parties.",
    baseSeverity: "MEDIUM",
    exampleSignals: [
      "we may share your data with third parties",
      "sell personal information",
      "data collected for advertising",
      "behavioral tracking",
    ],
  },
  {
    id: "auto_renewal_cancellation",
    name: "Auto-Renewal & Cancellation",
    description: "Terms that automatically renew subscriptions or contracts and restrict or penalize cancellation.",
    baseSeverity: "MEDIUM",
    exampleSignals: [
      "automatically renews",
      "cancel before renewal date",
      "no refund upon cancellation",
      "rolling subscription",
    ],
  },
  {
    id: "privacy_surveillance",
    name: "Privacy & Surveillance",
    description: "Clauses permitting monitoring of user activity, communications, or devices beyond what is necessary for core service delivery.",
    baseSeverity: "MEDIUM",
    exampleSignals: [
      "we may monitor your activity",
      "access to your device",
      "track usage across websites",
      "record communications",
    ],
  },
  {
    id: "price_changes_fee_escalation",
    name: "Price Changes & Fee Escalation",
    description: "Provisions allowing unilateral price increases or the addition of new fees with limited or no notice.",
    baseSeverity: "MEDIUM",
    exampleSignals: [
      "we may change our fees at any time",
      "price adjustments",
      "additional charges",
      "rate escalation",
    ],
  },
  {
    id: "termination_rights",
    name: "Termination Rights",
    description: "Conditions under which either party may terminate the agreement, including notice periods, for-cause vs. convenience termination, and consequences of termination.",
    baseSeverity: "MEDIUM",
    exampleSignals: [
      "terminate with X days notice",
      "terminate for convenience",
      "immediate termination",
      "termination without cause",
    ],
  },
  {
    id: "assignment_transfer",
    name: "Assignment & Transfer",
    description: "Rules governing whether and how rights and obligations under the agreement can be transferred to a third party.",
    baseSeverity: "MEDIUM",
    exampleSignals: [
      "may assign this agreement",
      "transfer rights without consent",
      "change of control",
      "merger or acquisition",
    ],
  },
  {
    id: "confidentiality_nda",
    name: "Confidentiality & NDA",
    description: "Obligations to keep certain information secret, including the scope of confidential information, duration of obligations, and permitted disclosures.",
    baseSeverity: "MEDIUM",
    exampleSignals: [
      "confidential information",
      "shall not disclose",
      "non-disclosure obligation",
      "perpetual confidentiality",
    ],
  },
  {
    id: "governing_law_jurisdiction",
    name: "Governing Law & Jurisdiction",
    description: "Provisions specifying which jurisdiction's law governs the agreement and where disputes must be litigated.",
    baseSeverity: "LOW",
    exampleSignals: [
      "governed by the laws of",
      "exclusive jurisdiction",
      "venue shall be",
      "choice of law",
    ],
  },
  {
    id: "warranty_disclaimer",
    name: "Warranty Disclaimer",
    description: "Clauses disclaiming implied warranties, limiting warranty coverage, or providing the service 'as-is'.",
    baseSeverity: "LOW",
    exampleSignals: [
      "provided as-is",
      "no warranty of merchantability",
      "disclaim all warranties",
      "no guarantee of uptime",
    ],
  },
  {
    id: "service_level_availability",
    name: "Service Level & Availability",
    description: "Commitments regarding uptime, performance, support response times, and remedies for service failures.",
    baseSeverity: "LOW",
    exampleSignals: [
      "99.9% uptime",
      "scheduled maintenance",
      "service credits",
      "SLA",
    ],
  },
  {
    id: "age_eligibility",
    name: "Age & Eligibility Requirements",
    description: "Restrictions on who may enter the agreement, including minimum age requirements and geographic eligibility.",
    baseSeverity: "LOW",
    exampleSignals: [
      "must be 18 years or older",
      "not available in certain jurisdictions",
      "age verification",
      "eligibility requirements",
    ],
  },
  {
    id: "third_party_services",
    name: "Third-Party Services & Integrations",
    description: "References to third-party integrations, sub-processors, or services whose terms may independently bind the user.",
    baseSeverity: "LOW",
    exampleSignals: [
      "third-party services",
      "sub-processors",
      "integrated platforms",
      "third-party terms apply",
    ],
  },
  {
    id: "force_majeure",
    name: "Force Majeure",
    description: "Clauses excusing non-performance due to extraordinary events outside a party's control.",
    baseSeverity: "LOW",
    exampleSignals: [
      "acts of God",
      "force majeure",
      "beyond reasonable control",
      "natural disaster",
    ],
  },
  {
    id: "payment_billing",
    name: "Payment & Billing Terms",
    description: "Terms covering payment methods, billing cycles, late fees, chargebacks, and consequences of non-payment.",
    baseSeverity: "LOW",
    exampleSignals: [
      "payment due within",
      "late payment fee",
      "chargeback policy",
      "billing cycle",
    ],
  },
  {
    id: "content_moderation_suspension",
    name: "Content Moderation & Account Suspension",
    description: "Rules giving the platform discretion to remove content or suspend/terminate user accounts.",
    baseSeverity: "LOW",
    exampleSignals: [
      "we may remove content",
      "suspend or terminate your account",
      "at our sole discretion",
      "content policy violations",
    ],
  },
  {
    id: "other",
    name: "Other",
    description: "A catch-all category for clauses that do not clearly fit into any other taxonomy category.",
    baseSeverity: "LOW",
    exampleSignals: [
      "miscellaneous provisions",
      "entire agreement",
      "severability",
      "waiver",
    ],
  },
];
