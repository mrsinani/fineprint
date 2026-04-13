"use client";

function getScoreStyles(score: number) {
  if (score >= 76) {
    return {
      text:     "text-red-500",
      label:    "High Risk",
      subtitle: "High risk level — negotiate before signing",
    };
  }
  if (score >= 51) {
    return {
      text:     "text-amber-500",
      label:    "Medium Risk",
      subtitle: "Above average risk level",
    };
  }
  return {
    text:     "text-emerald-500",
    label:    "Low Risk",
    subtitle: "Below average risk level",
  };
}

export function RiskScoreBadge({ score }: { score: number }) {
  const styles = getScoreStyles(score);

  return (
    <div className="flex flex-col justify-center gap-3 rounded-[28px] border border-navy-700 bg-white p-8 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-500">
        Overall Risk Score
      </p>
      <p className={`font-display text-8xl font-bold leading-none tabular-nums ${styles.text}`}>
        {score}
      </p>
      <p className={`text-lg font-semibold ${styles.text}`}>{styles.label}</p>
      <p className="max-w-[180px] text-sm leading-relaxed text-navy-500">{styles.subtitle}</p>
    </div>
  );
}
