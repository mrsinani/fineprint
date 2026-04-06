"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Eye,
  Lightbulb,
  Lock,
  Scale,
  ShieldAlert,
  UserX,
  Briefcase,
  PenLine,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import {
  SENSITIVITY_CATEGORIES,
  getDefaultPreferences,
  type SensitivityLevel,
  type UserSensitivityPreferences,
} from "@/lib/sensitivity";
import { saveSensitivityPreferences } from "@/app/actions/sensitivityPreferences";

const ICONS: Record<string, LucideIcon> = {
  DollarSign,
  Eye,
  Lightbulb,
  Lock,
  Scale,
  ShieldAlert,
  UserX,
  Briefcase,
  PenLine,
};

const LEVELS: SensitivityLevel[] = [
  "VERY_LOW",
  "LOW",
  "MEDIUM",
  "HIGH",
  "VERY_HIGH",
];

const LEVEL_META: Record<SensitivityLevel, { label: string; dot: string }> = {
  VERY_LOW: { label: "Don't Care", dot: "bg-navy-700" },
  LOW: { label: "Not Really", dot: "bg-navy-500" },
  MEDIUM: { label: "Neutral", dot: "bg-gold-500" },
  HIGH: { label: "Care", dot: "bg-fp-red/70" },
  VERY_HIGH: { label: "Care A Lot", dot: "bg-fp-red" },
};

export function OnboardingFlow({
  initialPreferences,
  isEdit,
}: {
  initialPreferences: UserSensitivityPreferences | null;
  isEdit: boolean;
}) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<UserSensitivityPreferences>(
    initialPreferences ?? getDefaultPreferences(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLevel = useCallback(
    (categoryId: string, level: SensitivityLevel) => {
      setPrefs((p) => ({ ...p, [categoryId]: level }));
    },
    [],
  );

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const result = await saveSensitivityPreferences(prefs);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.push(isEdit ? "/profile" : "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="mx-auto max-w-2xl px-5 pb-20 pt-12 sm:px-8">
        {/* Header */}
        <div
          className="text-center opacity-0"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0.05s forwards" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-600">
            {isEdit ? "Edit preferences" : "Step 1 of 1"}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-100 sm:text-4xl">
            {isEdit
              ? "Your sensitivity preferences"
              : "What matters most to you?"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-navy-400">
            Tell us how sensitive you are to different types of clauses.
            We&apos;ll use this to personalize your risk scores and highlight
            what you actually care about.
          </p>
        </div>

        {/* Sensitivity list */}
        <div className="mt-10 flex flex-col gap-3">
          {SENSITIVITY_CATEGORIES.map((cat, i) => {
            const Icon = ICONS[cat.icon] ?? ShieldAlert;
            const currentLevel = prefs[cat.id] ?? "MEDIUM";
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-navy-800 bg-white px-5 py-4 opacity-0 transition-shadow hover:shadow-sm"
                style={{
                  animation: `fp-fade-in-up 0.5s ease-out ${0.12 + i * 0.04}s forwards`,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <span className="inline-flex shrink-0 rounded-lg bg-navy-850 p-2.5 text-navy-400">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-navy-100">
                      {cat.name}
                    </h3>
                    <p className="text-[13px] leading-snug text-navy-400">
                      {cat.question}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-1 rounded-xl bg-navy-850 p-1">
                  {LEVELS.map((level) => {
                    const meta = LEVEL_META[level];
                    const active = currentLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setLevel(cat.id, level)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all duration-150 ${
                          active
                            ? "bg-white text-navy-100 shadow-sm"
                            : "text-navy-500 hover:text-navy-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${active ? meta.dot : "bg-transparent"}`}
                        />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-6 text-center text-sm text-fp-red">{error}</p>
        )}

        {/* CTA */}
        <div
          className="mt-10 flex justify-center opacity-0"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0.55s forwards" }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2.5 rounded-full bg-gold-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-gold-700 hover:shadow-lg disabled:opacity-60"
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                {isEdit ? "Save changes" : "Continue to dashboard"}
                <ArrowRight size={16} strokeWidth={2} />
              </>
            )}
          </button>
        </div>

        {/* Skip */}
        {!isEdit && (
          <p
            className="mt-4 text-center opacity-0"
            style={{ animation: "fp-fade-in-up 0.6s ease-out 0.6s forwards" }}
          >
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-sm text-navy-500 underline decoration-navy-700 underline-offset-2 transition-colors hover:text-navy-300"
            >
              Skip for now — use defaults
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
