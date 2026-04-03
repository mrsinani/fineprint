import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUserExists } from "@/lib/ensureUserExists";
import { getAvatarPublicUrl } from "@/lib/avatarPublicUrl";
import { ProfileEditor } from "./ProfileEditor";

function defaultDisplayName(
  row: {
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null,
  clerkFirst: string | null | undefined,
  clerkLast: string | null | undefined
) {
  if (row?.display_name?.trim()) return row.display_name.trim();
  const a = [clerkFirst, clerkLast].filter(Boolean).join(" ").trim();
  if (a) return a;
  return "";
}

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  await ensureUserExists(userId);

  const clerkUser = await currentUser();
  const supabase = createAdminClient();
  const { data: row } = await supabase.from("users").select("*").eq("id", userId).single();

  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    (row?.email as string | null) ??
    "";

  const displayName =
    defaultDisplayName(row, clerkUser?.firstName, clerkUser?.lastName) || email.split("@")[0] || "User";

  const created = clerkUser?.createdAt ?? row?.created_at;
  const memberSinceLabel = created
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(created))
    : "—";

  const customAvatar = getAvatarPublicUrl(row?.avatar_storage_path as string | null | undefined);
  const clerkImage =
    clerkUser?.imageUrl ?? (row?.image_url as string | null | undefined) ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <ProfileEditor
        initialDisplayName={displayName}
        email={email}
        memberSinceLabel={memberSinceLabel}
        customAvatarUrl={customAvatar}
        clerkImageUrl={clerkImage}
      />
    </div>
  );
}
