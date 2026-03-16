export function RiskAnalysisBlurb() {
  return (
    <section
      className="relative h-full overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900/50 p-6"
      aria-labelledby="risk-factors-heading"
    >
      {/* Gold accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-gold-500/60 via-gold-500/20 to-transparent"
        aria-hidden
      />

      <h2
        id="risk-factors-heading"
        className="font-display text-lg font-semibold text-navy-100"
      >
        How we assess risk
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-navy-400">
        We look at key factors to determine the risk to you: unclear or
        one-sided obligations, unfavorable termination or renewal terms, missing
        limits on liability, automatic renewals, and non-standard payment or
        penalty clauses.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Obligations", "Termination", "Liability", "Renewals", "Penalties"].map(
          (tag) => (
            <span
              key={tag}
              className="rounded-full border border-navy-700/60 bg-navy-800/60 px-2.5 py-1 text-[11px] font-medium tracking-wide text-navy-300"
            >
              {tag}
            </span>
          ),
        )}
      </div>
    </section>
  );
}
