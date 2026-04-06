import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | FinePrint",
  description: "Privacy policy for FinePrint and the FinePrint browser extension.",
};

export default function PrivacyPage() {
  const lastUpdated = "April 6, 2026";

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

            <h3 className="font-semibold text-[#1a2030] mt-4 mb-2">Page Content for Analysis</h3>
            <p>
              When you choose to analyze a page, the text content of that page is sent to our
              servers for AI-powered analysis. We also collect the page URL and title to help
              you identify saved analyses. Page content is only sent when you explicitly trigger
              an analysis.
            </p>

            <h3 className="font-semibold text-[#1a2030] mt-4 mb-2">Saved Analyses</h3>
            <p>
              If you choose to save an analysis, the results, page title, source URL, and original
              text are stored in your account so you can revisit them later.
            </p>

            <h3 className="font-semibold text-[#1a2030] mt-4 mb-2">Local Extension Data</h3>
            <p>
              The browser extension stores your authentication token, basic profile info, your
              auto-detect preference, and the most recent analysis result locally on your device
              using Chrome's storage API.
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
            <h2 className="text-xl font-semibold text-[#1a2030] mb-3">Data Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. Page
              content submitted for analysis is sent to OpenAI's API to generate results.
              OpenAI's API data usage policy states that data sent through the API is not used
              to train their models. We do not use your data to train any AI models. We may
              use third-party service providers (hosting, authentication, database) that process
              data on our behalf under strict confidentiality obligations.
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
