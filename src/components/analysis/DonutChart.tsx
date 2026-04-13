"use client";

import { useState } from "react";
import type { RiskSeverity } from "@/components/analysis/types";

interface DonutChartProps {
  counts: Record<RiskSeverity, number>;
}

const SEVERITY_STYLES: Record<RiskSeverity, { color: string; label: string }> = {
  HIGH:   { color: "#c54332", label: "High Risk" },
  MEDIUM: { color: "#cb8231", label: "Medium Risk" },
  LOW:    { color: "#46956f", label: "Low Risk" },
};

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToXY(cx, cy, r, startAngle);
  const end   = polarToXY(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function DonutChart({ counts }: DonutChartProps) {
  const [hovered, setHovered] = useState<RiskSeverity | null>(null);
  const total = counts.HIGH + counts.MEDIUM + counts.LOW;

  if (total === 0) {
    return (
      <div className="flex h-[220px] w-[220px] items-center justify-center rounded-full border-2 border-dashed border-navy-700 text-sm text-navy-500">
        No risks
      </div>
    );
  }

  // Expanded viewBox: outside labels + long strings ("Medium Risk: …") must stay inside drawable area.
  const viewBox = "-180 -45 840 470";
  const cx = 240;
  const cy = 190;
  const r = 130;

  let currentAngle = 0;
  const slices = (["HIGH", "MEDIUM", "LOW"] as const)
    .filter((s) => counts[s] > 0)
    .map((severity) => {
      const count      = counts[severity];
      const sliceAngle = (count / total) * 360;
      const startAngle = currentAngle;
      const endAngle   = currentAngle + sliceAngle;
      const midAngle   = currentAngle + sliceAngle / 2;
      currentAngle    += sliceAngle;
      return { severity, count, startAngle, endAngle, midAngle, pct: Math.round((count / total) * 100) };
    });

  return (
    <div className="relative flex w-full max-w-xl flex-col items-center overflow-visible">
      <svg viewBox={viewBox} className="h-auto w-full overflow-visible" role="img">
        <title>Risk Distribution</title>

        {slices.map(({ severity, startAngle, endAngle, midAngle, pct }) => {
          const style    = SEVERITY_STYLES[severity];
          const isHover  = hovered === severity;
          const labelPt  = polarToXY(cx, cy, r * 1.38, midAngle);
          const linePt1  = polarToXY(cx, cy, r + 8, midAngle);
          const linePt2  = polarToXY(cx, cy, r * 1.24, midAngle);
          const textAnchor =
            labelPt.x > cx + 8 ? "start" : labelPt.x < cx - 8 ? "end" : "middle";

          return (
            <g key={severity}>
              <path
                d={slicePath(cx, cy, r, startAngle, endAngle)}
                fill={style.color}
                opacity={hovered && !isHover ? 0.45 : 1}
                stroke="white"
                strokeWidth="1.5"
                onMouseEnter={() => setHovered(severity)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
                style={{ transition: "opacity 0.18s ease" }}
              />
              <line
                x1={linePt1.x}
                y1={linePt1.y}
                x2={linePt2.x}
                y2={linePt2.y}
                stroke={style.color}
                strokeWidth="1"
                opacity="0.6"
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fill={style.color}
                fontSize="18"
                fontWeight="600"
                className="pointer-events-none select-none [text-rendering:geometricPrecision]"
              >
                {style.label}: {pct}%
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 rounded-xl border border-navy-700 bg-white px-3 py-1.5 text-xs font-semibold shadow-md"
          style={{ color: SEVERITY_STYLES[hovered].color }}
        >
          {SEVERITY_STYLES[hovered].label}: {counts[hovered]}
        </div>
      )}
    </div>
  );
}
