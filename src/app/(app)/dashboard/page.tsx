import {
  RiskAnalysisCard,
  MyDocumentsSection,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1
        className="font-display text-3xl font-bold tracking-tight text-navy-50 opacity-0 sm:text-4xl"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        My Dashboard
      </h1>

      <div
        className="mt-8 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.2s forwards" }}
      >
        <RiskAnalysisCard />
      </div>

      <div
        className="mt-10 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.3s forwards" }}
      >
        <MyDocumentsSection />
      </div>
    </div>
  );
}
