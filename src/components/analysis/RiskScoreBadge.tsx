"use client";

function getScoreStyles(score: number) {
  if (score >= 76) {
    return {
      ring: "ring-red-200",
      bg: "bg-red-50",
      text: "text-red-600",
      label: "High risk",
    };
  }

  if (score >= 51) {
    return {
      ring: "ring-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-600",
      label: "Medium risk",
    };
  }

  return {
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    label: "Low risk",
  };
}

export function RiskScoreBadge({ score }: { score: number }) {
  const styles = getScoreStyles(score);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-navy-700 bg-white p-6 shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400">
        Risk score
      </span>
      <div
        className={`flex h-32 w-32 items-center justify-center rounded-full ring-8 ${styles.ring} ${styles.bg}`}
      >
        <span className={`text-4xl font-bold ${styles.text}`}>{score}</span>
      </div>
      <span className={`text-sm font-semibold ${styles.text}`}>{styles.label}</span>
      <p className="max-w-44 text-center text-xs leading-5 text-navy-500">
        Scores above 75 usually deserve negotiation before signing.
      </p>
    </div>
  );
}
