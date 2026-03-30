import nlp from "compromise";

export interface AnonymizationResult {
  scrubbedText: string;
  vault: Record<string, string>;
}

export function anonymizeDocument(rawText: string): AnonymizationResult {
  const vault: Record<string, string> = {};
  let scrubbedText = rawText;

  // Counters to keep the placeholders unique
  const counters = {
    person: 1,
    org: 1,
    email: 1,
    phone: 1,
  };

  // Helper to replace text and store it in the vault
  const replaceAndVault = (originalMatch: string, category: keyof typeof counters, tagPrefix: string) => {
    // Prevent double-replacing the exact same string
    const existingKey = Object.keys(vault).find((key) => vault[key] === originalMatch);
    if (existingKey) {
      scrubbedText = scrubbedText.split(originalMatch).join(existingKey);
      return;
    }

    const placeholder = `[${tagPrefix} ${counters[category]}]`;
    vault[placeholder] = originalMatch;
    
    // Replace all instances of this exact string in the text
    scrubbedText = scrubbedText.split(originalMatch).join(placeholder);
    counters[category]++;
  };

  // --- PHASE 1: REGEX (Rigid Formats) ---
  
  // 1. Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = scrubbedText.match(emailRegex) || [];
  emails.forEach((email) => replaceAndVault(email, "email", "Email"));

  // 2. Phone Numbers (Standard US formats)
  const phoneRegex = /\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g;
  const phones = scrubbedText.match(phoneRegex) || [];
  phones.forEach((phone) => replaceAndVault(phone, "phone", "Phone"));


  // --- PHASE 2: NLP (Semantic Entities) ---
  
  // Load the current state of the text into Compromise
  const doc = nlp(scrubbedText);

  // Extract People
  const people = doc.people().out("array");
  // Sort by length descending so "John Doe" gets replaced before just "John"
  people.sort((a: string, b: string) => b.length - a.length).forEach((person: string) => {
    replaceAndVault(person, "person", "Person");
  });

  // Extract Organizations (Companies, LLCs, etc.)
  const organizations = doc.organizations().out("array");
  organizations.sort((a: string, b: string) => b.length - a.length).forEach((org: string) => {
    replaceAndVault(org, "org", "Company");
  });

  return { scrubbedText, vault };
}

export function deanonymizeText(scrubbedResponse: string, vault: Record<string, string>): string {
  let restoredText = scrubbedResponse;
  
  // Iterate through the vault and swap the placeholders back to the real text
  for (const [placeholder, realValue] of Object.entries(vault)) {
    // We use split/join as a safe "replaceAll" alternative
    restoredText = restoredText.split(placeholder).join(realValue);
  }
  
  return restoredText;
}