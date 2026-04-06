"use client";

import type { RiskSeverity } from "@/components/analysis/types";

interface DonutChartProps {
  counts: Record<RiskSeverity, number>;
}

const SEVERITY_STYLES: Record<RiskSeverity, { color: string; label: string }> = {
  HIGH: { color: "#dc2626", label: "High risk" },
  MEDIUM: { color: "#d97706", label: "Medium risk" },
  LOW: { color: "#059669", label: "Low risk" },
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function DonutChart({ counts }: DonutChartProps) {
  const total = counts.HIGH + counts.MEDIUM + counts.LOW;
  const radius = 52;

  if (total === 0) {
    return (
      <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full border border-dashed border-navy-700 text-sm text-navy-500">
        No risks
      </div>
    );
  }

  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-[180px] w-[180px]">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#d5d9e2"
            strokeWidth="16"
          />
          {(["HIGH", "MEDIUM", "LOW"] as const).map((severity) => {
            const count = counts[severity];
            if (count === 0) return null;

            const sliceAngle = (count / total) * 360;
            const path = describeArc(70, 70, radius, currentAngle, currentAngle + sliceAngle);
            currentAngle += sliceAngle;

            return (
              <path
                key={severity}
                d={path}
                fill="none"
                stroke={SEVERITY_STYLES[severity].color}
                strokeWidth="16"
                strokeLinecap="round"
                aria-label={`${SEVERITY_STYLES[severity].label}: ${count}`}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400">
            Clauses
          </span>
          <span className="mt-1 text-4xl font-bold text-navy-100">{total}</span>
          <span className="mt-1 text-xs text-navy-500">Flagged sections</span>
        </div>
      </div>

      <div className="space-y-3">
        {(["HIGH", "MEDIUM", "LOW"] as const).map((severity) => (
          <div key={severity} className="flex items-center gap-3 text-sm text-navy-300">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: SEVERITY_STYLES[severity].color }}
              aria-hidden
            />
            <span className="min-w-24">{SEVERITY_STYLES[severity].label}</span>
            <span className="font-semibold text-navy-100">{counts[severity]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
