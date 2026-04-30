import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | FinePrint",
  description: "Privacy policy for FinePrint and the FinePrint browser extension.",
};

export default function PrivacyPage() {
  const lastUpdated = "April 22, 2026";

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-6 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-[#1a2030] hover:opacity-80 transition">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span className="text-lg font-bold">FinePrint</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-[#1a2030] mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Overview</h2>
            <p>
              FinePrint ("we", "us", or "our") operates the website at fineprint.dev and the
              FinePrint browser extension. This Privacy Policy explains what information we collect,
              how we use it, and your choices regarding your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Information We Collect</h2>

            <h3 className="font-semibold text-[#1a2030] mt-4 mb-2">Account Information</h3>
            <p>
              When you sign up, we collect your name, email address, and profile picture through
              our authentication provider (Clerk). This is used to identify your account and
              personalize your experience.
            </p>

            <h3 className="font-semibold text-[#1a2030] mt-4 mb-2">Documents You Submit</h3>
            <p>
              When you upload a file (PDF, DOCX, or TXT) or paste contract text on the website,
              that file and the extracted text are sent to our servers for AI-powered analysis.
              Uploaded files are stored in private Supabase Storage scoped to your account. When
              you analyze a page from the browser extension, the text, URL, and title of that page
              are sent to our servers only when you explicitly trigger an analysis.
            </p>

            <h3 className="font-semibold text-[#1a2030] mt-4 mb-2">Saved Analyses and Chat</h3>
            <p>
              If you save an analysis, the results, document title, source (file or URL), and
              original text are stored in your account so you can revisit them. If you use the
              in-app chatbot, the document context and the messages you send are processed by
              our AI provider to generate answers and are stored as part of that document's
              conversation history.
            </p>

            <h3 className="font-semibold text-[#1a2030] mt-4 mb-2">Local Extension Data</h3>
            <p>
              The browser extension stores your authentication token, basic profile info, your
              auto-detect preference, and the most recent analysis result locally on your device
              using the Chrome storage API.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Privacy-Preserving Analysis</h2>
            <p>
              Before we send your document text to our AI provider, we automatically scrub
              personally identifying information such as names, email addresses, phone numbers,
              and organization names, replacing them with placeholders like{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[13px]">[Person 1]</code>{" "}
              or <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[13px]">[Email 1]</code>.
              The original values never leave our servers. When the AI returns its analysis, we
              swap the placeholders back so you see the familiar names. You can also preview and
              further edit the anonymized text before analysis using our optional privacy review
              step. Automated PII detection is not perfect, so we recommend avoiding documents
              that contain highly sensitive data (e.g. government IDs, financial account numbers)
              or using the privacy review to remove anything you do not want analyzed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the FinePrint service</li>
              <li>To analyze Terms of Service and legal documents on your behalf</li>
              <li>To store and display your past analyses</li>
              <li>To authenticate you across the website and browser extension</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Data Sharing and Subprocessors</h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties, and we
              do not use your data to train any AI models. We rely on a small number of trusted
              service providers (subprocessors) that process data on our behalf under strict
              confidentiality obligations:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Clerk</strong> — user authentication and account management.
              </li>
              <li>
                <strong>Supabase</strong> — database and private file storage for documents and
                analyses.
              </li>
              <li>
                <strong>OpenAI</strong> — AI analysis and chat responses. Text is sent through
                the OpenAI API after PII scrubbing. Per OpenAI's API data policy, data sent
                through the API is not used to train their models.
              </li>
              <li>
                <strong>Vercel</strong> — website and API hosting.
              </li>
              <li>
                <strong>Google Programmable Search</strong> — used when you request public web
                reviews of a company or service. Only your search query is sent; your document
                text is not.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Where Your Data Is Processed</h2>
            <p>
              Our servers and databases are hosted in the United States. If you are accessing
              FinePrint from another country, your data will be transferred to and processed in
              the United States.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Data Retention</h2>
            <p>
              Account information is retained as long as your account is active. Saved analyses
              are retained until you delete them or delete your account. You can delete individual
              analyses from your dashboard at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Your Rights</h2>
            <p>
              You can access, update, or delete your account and saved data at any time through
              your FinePrint dashboard. To request complete deletion of your data, contact us
              at the email below.
            </p>
            <p className="mt-3">
              Depending on where you live, you may have additional rights under laws such as the
              GDPR (EEA/UK) or CCPA (California), including the right to access, correct, delete,
              or port your personal data, and the right to object to certain processing. We do
              not sell personal information. To exercise any of these rights, contact us at the
              email below and we will respond within the timeframes required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Children's Privacy</h2>
            <p>
              FinePrint is not directed to children. You must be at least 13 years old (or 16 in
              the EEA/UK) to use the service. We do not knowingly collect personal information
              from children below these ages; if you believe a child has provided us with
              personal information, please contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS),
              secure authentication tokens, and access controls to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:danaid@bu.edu" className="text-teal-600 hover:underline">
                danaid@bu.edu
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
