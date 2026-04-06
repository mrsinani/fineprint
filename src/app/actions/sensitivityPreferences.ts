"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";
import {
  SENSITIVITY_CATEGORIES,
  type SensitivityLevel,
  type UserSensitivityPreferences,
} from "@/lib/sensitivity";

const VALID_LEVELS = new Set<string>(["VERY_LOW", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"]);
const VALID_IDS = new Set(SENSITIVITY_CATEGORIES.map((c) => c.id));

export async function saveSensitivityPreferences(
  prefs: UserSensitivityPreferences,
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  await ensureUserExists(userId);

  const cleaned: UserSensitivityPreferences = {};
  for (const [key, value] of Object.entries(prefs)) {
    if (VALID_IDS.has(key) && VALID_LEVELS.has(value)) {
      cleaned[key] = value as SensitivityLevel;
    }
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({
      sensitivity_preferences: cleaned,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function getSensitivityPreferences(): Promise<UserSensitivityPreferences | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("sensitivity_preferences")
    .eq("id", userId)
    .single();

  if (!data?.sensitivity_preferences) return null;
  return data.sensitivity_preferences as UserSensitivityPreferences;
}
