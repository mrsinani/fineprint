/** Public URL for an object in the `avatars` bucket (path is `userId/filename.ext`). */
export function getAvatarPublicUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath?.trim()) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/avatars/${encoded}`;
}
