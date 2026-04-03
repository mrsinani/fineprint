"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";

export async function updateDisplayName(displayName: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  await ensureUserExists(userId);

  const name = displayName.trim().slice(0, 160);
  if (!name) return { error: "Display name is required." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({
      display_name: name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function updateNotificationPrefs(prefs: {
  notifyContractReady: boolean;
  notifyProductUpdates: boolean;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  await ensureUserExists(userId);

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({
      notify_contract_ready: prefs.notifyContractReady,
      notify_product_updates: prefs.notifyProductUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { ok: true as const };
}
