import Link from "next/link";
import { FilePlus, ArrowRight } from "lucide-react";

export function RiskAnalysisCard() {
  return (
    <Link
      href="/upload"
      className="group block w-fit max-w-[220px] rounded-xl bg-gold-100 p-5 transition-shadow duration-200 hover:shadow-md"
      aria-label="Analyze new contract - go to upload"
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-500/20"
        aria-hidden
      >
        <FilePlus size={28} strokeWidth={1.5} className="text-gold-700" />
      </div>

      <h2 className="text-sm font-bold text-navy-100">
        Analyze new contract
      </h2>
      <p className="mt-1 text-[12px] leading-relaxed text-navy-400">
        Upload any contract for a plain English summary and risk analysis.
      </p>

      <div className="mt-3 flex justify-end">
        <ArrowRight size={16} strokeWidth={2} className="text-gold-600 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
