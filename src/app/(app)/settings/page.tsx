import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  await ensureUserExists(userId);

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("users")
    .select("notify_contract_ready, notify_product_updates")
    .eq("id", userId)
    .single();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <SettingsForm
        initialNotifyContract={row?.notify_contract_ready ?? true}
        initialNotifyProduct={row?.notify_product_updates ?? true}
      />
    </div>
  );
}
