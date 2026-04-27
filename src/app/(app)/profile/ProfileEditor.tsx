"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart3,
  FileText,
  Layers,
  Trash2,
  SlidersHorizontal,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import {
  SENSITIVITY_CATEGORIES,
  type SensitivityLevel,
  type UserSensitivityPreferences,
} from "@/lib/sensitivity";

export type ProfileStats = {
  documentCount: number;
  totalPages: number;
  analysisCount: number;
  trashCount: number;
};

type ProfileEditorProps = {
  initialDisplayName: string;
  email: string;
  memberSinceLabel: string;
  customAvatarUrl: string | null;
  clerkImageUrl: string | null;
  stats: ProfileStats;
  sensitivityPreferences: UserSensitivityPreferences | null;
};

function initialsFrom(text: string) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return text.slice(0, 2).toUpperCase() || "?";
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
        <Icon size={20} strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums text-navy-100">{value}</p>
        <p className="text-sm font-medium text-navy-300">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-navy-500">{hint}</p> : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl border border-navy-800 bg-white p-4 shadow-sm transition-colors hover:border-gold-500/40 hover:bg-navy-900/5 sm:p-5"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-navy-800 bg-white p-4 shadow-sm sm:p-5">{inner}</div>
  );
}

const LEVEL_BADGE: Record<SensitivityLevel, { label: string; className: string }> = {
  VERY_LOW: { label: "Don't Care", className: "bg-navy-900 text-navy-500" },
  LOW: { label: "Not Really", className: "bg-navy-850 text-navy-400" },
  MEDIUM: { label: "Neutral", className: "bg-gold-100 text-gold-700" },
  HIGH: { label: "Care", className: "bg-red-50 text-fp-red" },
  VERY_HIGH: { label: "Care A Lot", className: "bg-fp-red/10 text-fp-red" },
};

export function ProfileEditor({
  initialDisplayName,
  email,
  memberSinceLabel,
  customAvatarUrl,
  clerkImageUrl,
  stats,
  sensitivityPreferences,
}: ProfileEditorProps) {
  const avatarUrl = customAvatarUrl || clerkImageUrl;

  const initials = useMemo(
    () => initialsFrom(initialDisplayName || email || "U"),
    [initialDisplayName, email]
  );

  return (
    <>
      <h1
        className="font-display text-3xl font-bold tracking-tight text-navy-100 opacity-0 sm:text-4xl"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        My Profile
      </h1>

      <div
        className="mt-10 rounded-xl border border-navy-800 bg-white p-6 opacity-0 sm:p-8"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.2s forwards" }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-navy-800 bg-navy-900">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote Clerk / Supabase URLs
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gold-500 text-xl font-bold text-white">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-navy-100">
              {initialDisplayName}
            </p>
            <p className="mt-1 text-sm text-navy-400">{email}</p>
            <p className="mt-1 text-xs text-navy-500">
              Member since {memberSinceLabel}
            </p>
          </div>
        </div>
      </div>

      <div
        className="mt-8 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.28s forwards" }}
      >
        <h2 className="font-display text-lg font-semibold text-navy-100">Your activity</h2>
        <p className="mt-1 text-sm text-navy-500">
          Totals from your workspace (active documents only, except trash).
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Documents"
            value={stats.documentCount}
            hint="In My Documents"
            href="/documents"
          />
          <StatCard
            icon={Layers}
            label="Pages reviewed"
            value={stats.totalPages.toLocaleString()}
            hint="Sum of page counts"
          />
          <StatCard
            icon={BarChart3}
            label="AI analyses"
            value={stats.analysisCount}
            hint="Completed analysis runs"
          />
          <StatCard
            icon={Trash2}
            label="In trash"
            value={stats.trashCount}
            hint="Recover or delete forever"
            href="/trash"
          />
        </div>
      </div>

      {/* Sensitivity preferences */}
      <div
        className="mt-8 opacity-0"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.36s forwards" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-navy-100">
              Sensitivity preferences
            </h2>
            <p className="mt-1 text-sm text-navy-500">
              How sensitive you are to different types of clauses — used to
              personalize your risk scores.
            </p>
          </div>
          {sensitivityPreferences &&
            Object.keys(sensitivityPreferences).length > 0
              ? <Link
            href="/onboarding"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-navy-700 px-4 py-2.5 text-sm font-semibold text-navy-200 transition-colors hover:border-gold-500 hover:text-gold-700"
          >
            <RotateCcw size={14} strokeWidth={2} />
            Edit preferences
          </Link>
              : ""}
        </div>

        {sensitivityPreferences &&
        Object.keys(sensitivityPreferences).length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SENSITIVITY_CATEGORIES.map((cat) => {
              const level =
                (sensitivityPreferences[cat.id] as SensitivityLevel) ??
                "MEDIUM";
              const badge = LEVEL_BADGE[level];
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-xl border border-navy-800 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-200">
                      {cat.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-navy-500">
                      {cat.question}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-navy-700 bg-navy-900/50 px-6 py-8 text-center">
            <SlidersHorizontal
              size={28}
              strokeWidth={1.5}
              className="mx-auto text-navy-600"
            />
            <p className="mt-3 text-sm text-navy-400">
              You haven&apos;t set up your sensitivity preferences yet. This
              helps us personalize risk scores to what matters most to you.
            </p>
            <Link
              href="/onboarding"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-700"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
