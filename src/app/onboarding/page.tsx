import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserSensitivityPreferences } from "@/lib/sensitivity";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata = { title: "Personalize — FinePrint" };

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("sensitivity_preferences, onboarding_completed")
    .eq("id", userId)
    .single();

  const existingPrefs =
    (data?.sensitivity_preferences as UserSensitivityPreferences) || null;
  const isEdit = data?.onboarding_completed === true;

  return <OnboardingFlow initialPreferences={existingPrefs} isEdit={isEdit} />;
}
