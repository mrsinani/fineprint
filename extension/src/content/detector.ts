const TOS_TITLE_PATTERNS = [
  /terms\s+(of\s+)?(service|use)/i,
  /terms\s+and\s+conditions/i,
  /user\s+agreement/i,
  /service\s+agreement/i,
  /subscriber\s+agreement/i,
  /member\s+agreement/i,
];

const TOS_URL_PATTERNS = [
  /\/tos\b/i,
  /\/terms/i,
  /\/legal\/terms/i,
  /\/user-agreement/i,
  /\/service-agreement/i,
];

const LEGAL_KEYWORDS = [
  "hereby",
  "notwithstanding",
  "indemnify",
  "indemnification",
  "liability",
  "arbitration",
  "governing law",
  "jurisdiction",
  "agree to be bound",
  "binding agreement",
  "waive",
  "covenant",
  "warranties",
  "disclaimer",
  "limitation of liability",
  "intellectual property",
  "termination",
  "severability",
  "force majeure",
  "confidential",
];

export interface DetectionResult {
  isToS: boolean;
  confidence: number;
  title: string;
}

export function detectTermsOfService(): DetectionResult {
  let score = 0;
  const pageTitle = document.title;
  const url = window.location.href;

  // Check page title
  for (const pattern of TOS_TITLE_PATTERNS) {
    if (pattern.test(pageTitle)) {
      score += 40;
      break;
    }
  }

  // Check URL
  for (const pattern of TOS_URL_PATTERNS) {
    if (pattern.test(url)) {
      score += 30;
      break;
    }
  }

  // Check headings
  const headings = document.querySelectorAll("h1, h2, h3");
  for (const heading of headings) {
    const text = heading.textContent ?? "";
    for (const pattern of TOS_TITLE_PATTERNS) {
      if (pattern.test(text)) {
        score += 25;
        break;
      }
    }
    if (score >= 50) break;
  }

  // Check body text for legal keyword density
  const bodyText = extractMainContent().toLowerCase();
  const wordCount = bodyText.split(/\s+/).length;

  if (wordCount > 200) {
    let keywordHits = 0;
    for (const keyword of LEGAL_KEYWORDS) {
      if (bodyText.includes(keyword.toLowerCase())) {
        keywordHits++;
      }
    }
    const density = keywordHits / LEGAL_KEYWORDS.length;
    score += Math.min(30, Math.round(density * 100));
  }

  const derivedTitle =
    headings[0]?.textContent?.trim() || pageTitle || new URL(url).hostname;

  return {
    isToS: score >= 40,
    confidence: Math.min(100, score),
    title: derivedTitle,
  };
}

export function extractMainContent(): string {
  const main =
    document.querySelector("main") ??
    document.querySelector("article") ??
    document.querySelector('[role="main"]');

  if (main) return main.innerText;

  // Fall back to body, stripping nav/footer/aside
  const clone = document.body.cloneNode(true) as HTMLElement;
  for (const tag of clone.querySelectorAll(
    "nav, footer, aside, header, script, style, noscript, iframe",
  )) {
    tag.remove();
  }

  return clone.innerText;
}
