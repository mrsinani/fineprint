import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/auth";

export async function DELETE(req: Request) {
  const { userId } = await getAuthenticatedUser(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch {
    return NextResponse.json(
      { error: "Could not delete your account. Try again or contact support." },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();
  const { data: folder } = await supabase.storage.from("avatars").list(userId);
  if (folder?.length) {
    await supabase.storage
      .from("avatars")
      .remove(folder.map((f) => `${userId}/${f.name}`));
  }
  await supabase.from("users").delete().eq("id", userId);

  return NextResponse.json({ ok: true });
}
