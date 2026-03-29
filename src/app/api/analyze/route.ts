import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractText as extractPdfText } from "unpdf";
import { anonymizeDocument } from "@/app/utils/anonymize";
import { deanonymizeText } from "@/app/utils/anonymize";

const clauses = {
  "Residential Lease Agreement": {
    "Standard/Low": "Quiet enjoyment, pet deposits (if applicable), standard notice periods (30-60 days), utility responsibilities (clear division), ordinary wear and tear allowance",
    "Moderate": "Automatic lease renewal clauses, late rent fees (if high but legal), required professional cleaning upon move-out, restrictions on guests (duration), landlord entry with 24-hour notice",
    "High": "Joint and several liability (in shared housing), exorbitant break-lease fees (liquidated damages), \"as-is\" clauses shifting major maintenance to the tenant, broad indemnification of the landlord for their own negligence",
    "Critical": "Confession of judgment clauses (tenant waives right to defend against eviction), waiver of right to a jury trial, clauses permitting landlord to seize personal property for unpaid rent (where legally questionable), unilateral right for landlord to alter lease terms mid-lease"
  },
  "Sublease Agreement": {
    "Standard/Low": "Subtenant adherence to master lease rules, utility splitting agreements, standard security deposit terms, clear move-in/move-out dates",
    "Moderate": "Sublessor retaining the right to inspect the premises, specific restrictions on using common areas, moderate penalties for late payment to the sublessor",
    "High": "Lack of explicit written consent from the master landlord, sublessor entirely shifting their own master lease liability to the subtenant, immediate eviction clauses without standard cure periods",
    "Critical": "Subtenant assumes liability for preexisting damage caused by the sublessor, convoluted indemnity clauses holding the subtenant responsible for the sublessor's breaches of the master lease"
  },
  "Mortgage Agreement": {
    "Standard/Low": "Escrow requirements for taxes and insurance, standard principal and interest payment schedules, requirements to maintain property insurance, late payment grace periods (e.g., 15 days)",
    "Moderate": "Prepayment penalties (if explicitly disclosed and within legal limits), specific requirements for property maintenance (to protect the asset), forced-placed insurance clauses (if the borrower's lapses)",
    "High": "Adjustable-rate mechanisms with high or uncapped margins, \"due on sale\" clauses triggered by minor title transfers (e.g., into a family trust), broad cross-default provisions (defaulting on a different credit card triggers mortgage default)",
    "Critical": "Acceleration clauses triggered by subjective criteria (\"lender deems itself insecure\"), negative amortization structures, balloon payments due unexpectedly, waiver of statutory redemption rights after foreclosure"
  },
  "HOA (Homeowners Association) CC&Rs": {
    "Standard/Low": "Basic architectural guidelines (e.g., paint colors), rules regarding trash disposal and parking, requirements to pay standard monthly assessments, noise restrictions",
    "Moderate": "Restrictions on short-term rentals (e.g., Airbnb), specific pet limitations (breed or weight), requirements for HOA approval for minor exterior modifications, moderate fines for rule violations",
    "High": "Broad powers for the HOA board to levy special assessments without a homeowner vote, aggressive foreclosure rights for unpaid fines (not just unpaid dues), severe restrictions on property use (e.g., home businesses)",
    "Critical": "Unilateral right of the developer to amend CC&Rs without homeowner consent, binding arbitration for disputes with the HOA board, clauses shifting all liability for common area injuries entirely to individual homeowners"
  },
  "Employment Contract / Offer Letter": {
    "Standard/Low": "At-will employment confirmation, standard benefits eligibility descriptions, clear job title and reporting structure, confidentiality regarding basic company operations",
    "Moderate": "\"Clawback\" provisions for signing bonuses or relocation expenses if leaving within a year, mandatory arbitration for workplace disputes, broad \"duties as assigned\" clauses",
    "High": "Liquidated damages for early termination by the employee, severe restrictions on outside employment (moonlighting), clauses granting the employer rights to inventions created on the employee's own time",
    "Critical": "Extreme non-compete clauses embedded within the offer letter, forced waiver of class action rights for wage disputes, unilateral employer right to permanently reduce salary or change location without severance triggers"
  },
  "Non-Disclosure Agreement (NDA)": {
    "Standard/Low": "Clear definition of what constitutes \"Confidential Information\", standard exclusions (e.g., info already public), requirement to return or destroy materials upon request",
    "Moderate": "Broad definitions of \"Representatives\" who are bound by the agreement, requirements to notify the disclosing party immediately of any legal subpoenas, 3-5 year duration of confidentiality obligations",
    "High": "Perpetual duration of confidentiality for non-trade secret information, \"residuals\" clauses allowing the disclosing party to use ideas retained in the recipient's unaided memory, liquidated damages for any breach",
    "Critical": "Exceedingly broad, catch-all definitions of confidential information (covering almost any interaction), shifting the burden of proof entirely to the receiving party in a dispute, indemnification covering all legal costs of the disclosing party regardless of outcome"
  },
  "Non-Compete / Non-Solicitation Agreement": {
    "Standard/Low": "Prohibition on soliciting current, direct clients of the employee for 6-12 months, prohibition on recruiting current colleagues",
    "Moderate": "Non-compete limited to a specific, narrow competitor list, restrictions covering a tight geographic radius (e.g., 10 miles), non-solicitation of prospective clients the employee had direct contact with",
    "High": "Non-compete durations exceeding 12 months, broad geographic restrictions (e.g., \"worldwide\" or \"any state where the company does business\"), preventing employment in the same general industry (not just direct competitors)",
    "Critical": "\"Tolling\" provisions (the restriction period pauses and extends if a breach is suspected), heavy liquidated damages for soliciting a single employee, preventing the employee from working for a client even if the client approaches them independently"
  },
  "Severance / Separation Agreement": {
    "Standard/Low": "General release of claims against the employer, confirmation of severance payment schedule, return of company property requirements",
    "Moderate": "Standard non-disparagement clauses, reaffirmation of prior confidentiality or non-compete agreements, requirement to cooperate in future company litigation",
    "High": "Broad non-disparagement clauses applying even to truthful statements about workplace conditions, waivers of the right to file charges with government agencies (e.g., EEOC), overly broad release of unknown future claims",
    "Critical": "\"Clawback\" of severance pay if the employee breaches any minor provision (like a vague non-disparagement clause), forced waiver of rights to vested deferred compensation, severe penalties for disclosing the amount of the severance"
  },
  "Terms of Service (ToS) / Terms of Use": {
    "Standard/Low": "Acceptable use policies (no spam, no illegal content), right to terminate accounts for violations, standard \"as-is\" warranty disclaimers",
    "Moderate": "Broad licenses granting the platform the right to use user-generated content for promotional purposes, limitation of liability capping damages at the amount the user paid, automatic renewal of subscription features",
    "High": "Binding arbitration and class action waivers, unilateral right to change the terms without direct notice to the user, broad indemnification requiring the user to pay the platform's legal fees for any claim arising from their use",
    "Critical": "Irrevocable, perpetual, royalty-free licenses to all user IP (effectively transferring ownership), clauses dictating the user waives moral rights to their content, forced jurisdiction in highly inconvenient, specific foreign courts"
  },
  "End-User License Agreement (EULA)": {
    "Standard/Low": "Restrictions on reverse engineering or modifying the software, limitation to personal/non-commercial use, standard disclaimer of warranties regarding software bugs",
    "Moderate": "Requirements for mandatory automatic updates, consent to collect anonymized telemetry/usage data, restrictions on transferring the license to another user",
    "High": "Strict prohibitions on publishing benchmark tests or reviews without permission, broad rights for the software to access and scan the user's wider system files, termination of the license for minor infractions without refunds",
    "Critical": "\"Self-help\" or \"kill switch\" provisions allowing the licensor to remotely disable the software without a court order, extreme limitation of liability capping damages at $5.00, forced acceptance of third-party software installations bundled with the main product"
  },
  "Employee Handbook / Corporate Code of Conduct": {
    "Standard/Low": "Dress code guidelines, general core values, standard reporting structures for HR complaints.",
    "Moderate": "Rules around accepting gifts from vendors (e.g., nothing over $50), strict protocols for speaking to the media or posting on social media about the company.",
    "High": "Broad definitions of \"Conflicts of Interest\" (e.g., running a side-hustle that the company could argue competes with them), strict rules on using company laptops/networks for personal use (no expectation of privacy).",
    "Critical": "Violations of Insider Trading laws, violations of the FCPA (Foreign Corrupt Practices Act - anti-bribery), clauses stating the company can monitor personal devices if they are used for work purposes (BYOD policies)."
  },
  "Privacy Policy": {
    "Standard/Low": "Clear explanations of data collected for core functionality, standard cookie usage disclosures, instructions on how to request account deletion",
    "Moderate": "Collection of location data, sharing data with \"trusted third-party partners\" for analytics, usage of data to train internal machine learning models",
    "High": "Explicit selling of user data to data brokers or advertising networks, retention of data indefinitely even after account deletion, broad tracking of user activity across other, unaffiliated websites",
    "Critical": "Forced consent to share sensitive data (health, biometric, financial) with unspecified affiliates, clauses claiming the user cannot opt-out of data sales, unilateral rights to retroactively change the policy to permit the sale of previously collected private data"
  },
  "Independent Contractor Agreement": {
    "Standard/Low": "Clear scope of work and deliverables, standard payment terms (e.g., Net 30), confirmation of independent contractor status (taxes are the contractor's responsibility)",
    "Moderate": "\"Work made for hire\" provisions transferring IP ownership upon full payment, requirement for the contractor to carry their own liability insurance, termination for convenience with a short notice period (e.g., 14 days)",
    "High": "Broad indemnification holding the contractor liable for any damages the client suffers related to the work, non-compete clauses preventing the freelancer from working with the client's competitors, Net 90 or Net 120 payment terms",
    "Critical": "Clauses penalizing the contractor heavily for minor delays, \"pay-if-paid\" clauses (contractor only gets paid if the client's end-customer pays them), complete transfer of IP rights even if the client defaults on payment"
  },
  "Statement of Work (SOW)": {
    "Standard/Low": "Detailed description of deliverables, clear milestone schedules, specific payment amounts tied to those milestones",
    "Moderate": "Specific acceptance criteria the client uses to approve the work, change order processes requiring written approval for scope creep, specified number of revision rounds included in the price",
    "High": "Vague or subjective acceptance criteria (\"client is satisfied\"), aggressive delivery penalties/liquidated damages for missing deadlines, open-ended scope definitions lacking boundaries",
    "Critical": "Clauses allowing the client to endlessly reject deliverables without payment, forcing the contractor to absorb all costs for out-of-scope work deemed \"necessary\" by the client, total liability for third-party delays outside the contractor's control"
  },
  "IP Assignment Agreement": {
    "Standard/Low": "Clear definition of the specific IP being transferred, confirmation of payment as consideration for the transfer, standard representations that the work is original",
    "Moderate": "Requirement for the creator to assist in securing patents or trademarks (usually at the client's expense), waiver of moral rights (where legally applicable)",
    "High": "Assignment of \"future inventions\" not strictly related to the current project, broad definitions of \"prior inventions\" that might inadvertently capture the creator's pre-existing tools or codebases",
    "Critical": "Assignment of IP created entirely on the creator's own time and with their own equipment, severe indemnification requiring the creator to fund the defense against any third-party patent troll claims, lack of a \"reversion\" clause if the client fails to pay the agreed compensation"
  },
  "Loan Agreement / Promissory Note": {
    "Standard/Low": "Clear principal amount and fixed interest rate, defined repayment schedule, standard grace periods for late payments",
    "Moderate": "Late fee percentages (e.g., 5% of the overdue amount), requirement to provide updated financial statements annually, specific definitions of what constitutes a default",
    "High": "Prepayment penalties that make early payoff prohibitively expensive, variable interest rates tied to volatile indices without caps, broad cross-default provisions (defaulting on an unrelated lease triggers loan default)",
    "Critical": "Confession of judgment clauses (borrower waives the right to a trial if they default), severe acceleration clauses triggered by the lender feeling \"insecure\" about repayment regardless of actual payment history, exorbitant default interest rates (e.g., 25%+)"
  },
  "Credit Card Cardholder Agreement": {
    "Standard/Low": "Standard APR disclosures for purchases, definitions of the billing cycle, clear grace periods to avoid interest",
    "Moderate": "Penalty APRs triggered by a single late payment, fees for cash advances or foreign transactions, rights of the issuer to lower the credit limit at any time",
    "High": "Universal default clauses (raising the APR because the user was late paying a different, unrelated creditor), mandatory binding arbitration preventing lawsuits, class action waivers",
    "Critical": "Aggressive changes in terms clauses allowing the issuer to retroactively apply higher rates to existing balances (where loopholes exist), right of offset (allowing the bank to seize funds directly from the user's checking account at the same bank to pay the credit card debt without notice)"
  },
  "Bill of Sale": {
    "Standard/Low": "Clear identification of the buyer, seller, and the asset (e.g., VIN number), statement of the purchase price, date of transfer",
    "Moderate": "\"As-is, where-is\" clauses stating the buyer accepts the item with all faults, explicit disclaimer of any implied warranties of merchantability",
    "High": "Seller attempting to retain a security interest in the item after the sale without a separate financing agreement, broad indemnification where the buyer assumes liability for the seller's past use of the asset",
    "Critical": "Clauses requiring the buyer to defend the seller against future claims related to the item's manufacture, hidden agreements to assume the seller's outstanding debts related to the asset"
  },
  "Prenuptial / Postnuptial Agreement": {
    "Standard/Low": "Clear demarcation of separate pre-marital property versus joint marital property, agreements on handling joint debts, standard disclosures of current assets",
    "Moderate": "Specific waivers of spousal support/alimony (if reasonable and mutually agreed), agreements on the division of future business growth, \"sunset clauses\" where the agreement expires after a certain number of years",
    "High": "\"Lifestyle clauses\" dictating specific behaviors (e.g., weight limits, social media rules) with financial penalties, strict infidelity clauses with massive financial forfeiture, complete waiver of all rights to the marital home regardless of contribution",
    "Critical": "Unconscionable waivers leaving one spouse destitute while the other retains massive wealth, attempts to dictate child custody or child support (which are generally legally unenforceable in a prenup but intimidating), clauses penalizing a spouse for initiating the divorce"
  },
  "Last Will and Testament": {
    "Standard/Low": "Clear identification of beneficiaries, appointment of a primary executor, standard distribution of basic assets (e.g., \"my house to my spouse\")",
    "Moderate": "Appointment of guardians for minor children, creation of basic testamentary trusts for minors with standard age-based payouts (e.g., 25 years old), specific disinheritance of a relative",
    "High": "\"In terrorem\" (no-contest) clauses disinheriting anyone who challenges the will, complex conditional gifts (\"to my son, provided he graduates from medical school\"), granting the executor absolute, unchecked power to interpret vague distributions",
    "Critical": "Attempts to control beneficiaries' lives from beyond the grave (e.g., requiring them to marry within a certain religion to inherit), highly complex generation-skipping trusts designed primarily for tax evasion rather than estate planning, leaving significant assets to an executor or attorney drafting the will (creates severe conflict of interest)"
  },
  "Power of Attorney": {
    "Standard/Low": "Limited Power of Attorney (for a specific transaction like closing on a house), clear designation of the agent, clear expiration date or triggering event",
    "Moderate": "Springing Power of Attorney (only activates if the user becomes incapacitated, requiring medical certification), Durable Power of Attorney for general financial matters, naming alternate/successor agents",
    "High": "Broad, immediate Durable Power of Attorney granting the agent total control over all finances while the user is still competent, lack of requirements for the agent to provide regular accounting or reporting",
    "Critical": "Clauses explicitly allowing the agent to make gifts of the principal's money to themselves (self-dealing), granting the agent the power to change the principal's will or beneficiary designations, waiving the principal's right to ever revoke the Power of Attorney"
  }
};

// --- Text Extraction Helper ---
async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "text/plain") {
    return buffer.toString("utf-8");
  }
  if (file.type === "application/pdf") {
    const { text } = await extractPdfText(new Uint8Array(buffer), {
      mergePages: true as const,
    });
    return Array.isArray(text) ? text.join("\n\n") : text;
  }
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error("Unsupported file type. Please use .pdf, .docx, or .txt");
}

// --- OpenAI Fetch Helper ---
async function askOpenAI(
  systemPrompt: string,
  userText: string,
  apiKey: string,
  retries = 2,
): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        max_tokens: 16384,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here is the document text to analyze:\n\n${userText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (attempt < retries) continue;
      throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;
    try {
      return JSON.parse(raw);
    } catch {
      console.error(
        `Failed to parse OpenAI response (attempt ${attempt + 1}). finish_reason:`,
        data.choices[0].finish_reason,
        "raw:",
        raw?.slice(0, 500),
      );
      if (attempt < retries) continue;
      throw new Error("AI returned an incomplete response. Please try again.");
    }
  }
  throw new Error("AI returned an incomplete response. Please try again.");
}

export async function POST(req: NextRequest) {
  let documentType = "";
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let rawDocumentText: string;

    // Handle both Text Paste (JSON) and File Upload (FormData)
    if (contentType.includes("application/json")) {
      const { text } = await req.json();
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json(
          { error: "No text provided." },
          { status: 400 },
        );
      }
      rawDocumentText = text;
    } else {
      const formData = await req.formData();
      documentType = formData.get("type") as string;
      
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No file provided." },
          { status: 400 },
        );
      }
      if (documentType == "") {
        return NextResponse.json(
          {error: "Document type not specified."},
          {status: 400},
        )
      }
      rawDocumentText = await extractText(file);
    }

    // --- 1. SCRUB THE DATA ---
    const { scrubbedText, vault } = anonymizeDocument(rawDocumentText);

    // --- 2. GATEKEEPER CHECK (Using Scrubbed Text) ---
    const gatekeeperPrompt = `You are a strict document classifier. Determine if the provided text is a legal document (e.g., contract, Terms of Service, Privacy Policy, Lease, NDA). Reply EXACTLY in this JSON format: { "is_legal": boolean, "reason": "brief explanation" }`;
    const verification = await askOpenAI(
      gatekeeperPrompt,
      scrubbedText.substring(0, 3000),
      apiKey,
    );

    if (!verification.is_legal) {
      return NextResponse.json(
        {
          error: `This doesn't look like a legal document. AI Reason: ${verification.reason}`,
        },
        { status: 400 },
      );
    }

    const typeKey = documentType as keyof typeof clauses;

    const summaryPrompt = `You are an expert legal summarizer. Provide a plain language summary so a layperson understands the overall intent. Format EXACTLY in this JSON format: { "summary": "insert summary here" }`;

    const obligationsPrompt = `You are a legal auditor. Extract a list of the key obligations and responsibilities the user is agreeing to. Return at most 20 obligations, each concise (under 25 words). Format EXACTLY in this JSON format: { "obligations": ["obligation 1", "obligation 2"] }`;

    const riskPrompt = `You are an expert legal auditor specializing in ${documentType} protecting the user. Analyze the ${documentType} for risky clauses and assign an overall risk score.
      Risk Scoring Rubric for Clauses:
      * Level 1 (Standard/Low): ${clauses[typeKey]?.["Standard/Low"] || "Standard boilerplate."} 
      * Level 2 (Moderate): ${clauses[typeKey]?.["Moderate"] || "Favors the company."} 
      * Level 3 (High): ${clauses[typeKey]?.["High"] || "Aggressive clauses."} 
      * Level 4 (Critical/Avoid): ${clauses[typeKey]?.["Critical"] || "Predatory clauses."} 

      Return only the top 15 most important risky clauses, prioritizing the highest severity ones. Keep each explanation concise (under 30 words). 
      
      CRITICAL QUOTING INSTRUCTIONS:
      For each clause, you MUST provide a short, VERBATIM quote (1-2 sentences maximum) from the document that proves the risk. 
      - Do NOT quote the entire paragraph.
      - Do NOT paraphrase, fix typos, or alter capitalization. 
      - Copy the text character-for-character exactly as it appears in the source.

      Derive an overall risk_score from 1 to 10 for the entire document.
      Format EXACTLY in this JSON format: { "risk_score": number, "risky_clauses": [ ["clause text or plain English explanation", severity_level_number, "VERBATIM quote"] ] }`;

      console.log(riskPrompt)
    // Truncate to ~300k chars to stay within context limits
    const truncatedText = scrubbedText.slice(0, 300000);

    console.log(truncatedText)

    // --- 3. RUN IN PARALLEL ---
    const [summaryData, obligationsData, riskData] = await Promise.all([
      askOpenAI(summaryPrompt, truncatedText, apiKey),
      askOpenAI(obligationsPrompt, truncatedText, apiKey),
      askOpenAI(riskPrompt, truncatedText, apiKey),
    ]);

    // --- 4. COMBINE, DE-ANONYMIZE, AND RETURN ---
    
    // First, combine the safe JSON objects into one string
    const combinedRawJsonString = JSON.stringify({
      summary: summaryData.summary,
      obligations: obligationsData.obligations,
      risk_score: riskData.risk_score,
      risky_clauses: riskData.risky_clauses,
    });

    // Run the string through the vault to swap placeholders for real data
    const restoredJsonString = deanonymizeText(combinedRawJsonString, vault);

    // Parse it back into a clean JSON object for the frontend
    const finalData = JSON.parse(restoredJsonString);

    return NextResponse.json(finalData);

  } catch (error) {
    console.error("Analysis route error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}