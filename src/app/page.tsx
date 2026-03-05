import {
  RiskAnalysisCard,
  RiskAnalysisBlurb,
  MyDocumentsSection,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        My dashboard
      </h1>

      <div className="mt-8 flex flex-col gap-8">
        <RiskAnalysisCard />
        <RiskAnalysisBlurb />
        <MyDocumentsSection />
      </div>
    </div>
  );
}

