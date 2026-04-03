"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart3,
  FileText,
  Layers,
  Trash2,
  type LucideIcon,
} from "lucide-react";

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

export function ProfileEditor({
  initialDisplayName,
  email,
  memberSinceLabel,
  customAvatarUrl,
  clerkImageUrl,
  stats,
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
    </>
  );
}
