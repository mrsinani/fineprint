import { clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

const recentlyVerified = new Set<string>();

export async function ensureUserExists(userId: string): Promise<void> {
  if (recentlyVerified.has(userId)) return;

  const supabase = createAdminClient();

  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (data) {
    recentlyVerified.add(userId);
    return;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  await supabase.from("users").upsert({
    id: userId,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    first_name: user.firstName,
    last_name: user.lastName,
    image_url: user.imageUrl,
    updated_at: new Date().toISOString(),
  });

  recentlyVerified.add(userId);
}
