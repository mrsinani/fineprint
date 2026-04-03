"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateDisplayName } from "@/app/actions/userProfile";

type ProfileEditorProps = {
  initialDisplayName: string;
  email: string;
  memberSinceLabel: string;
  customAvatarUrl: string | null;
  clerkImageUrl: string | null;
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

export function ProfileEditor({
  initialDisplayName,
  email,
  memberSinceLabel,
  customAvatarUrl,
  clerkImageUrl,
}: ProfileEditorProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    customAvatarUrl || clerkImageUrl
  );
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const initials = useMemo(
    () => initialsFrom(displayName || email || "U"),
    [displayName, email]
  );

  async function onSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameMsg(null);
    setSavingName(true);
    const res = await updateDisplayName(displayName);
    setSavingName(false);
    if ("error" in res && res.error) {
      setNameMsg(res.error);
      return;
    }
    setNameMsg("Saved.");
    router.refresh();
  }

  async function onPickFile(f: FileList | null) {
    const file = f?.[0];
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const r = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const data = (await r.json()) as { error?: string; publicUrl?: string };
      if (!r.ok) {
        setUploadErr(data.error ?? "Upload failed.");
        return;
      }
      if (data.publicUrl) setAvatarUrl(data.publicUrl);
      router.refresh();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="flex flex-col items-center gap-3 sm:items-start">
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
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold uppercase tracking-wide text-gold-600 transition-colors hover:text-gold-700 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload photo"}
            </button>
            {uploadErr && (
              <p className="max-w-[200px] text-center text-xs text-fp-red sm:text-left">
                {uploadErr}
              </p>
            )}
            <p className="max-w-[220px] text-center text-[11px] text-navy-500 sm:text-left">
              JPEG, PNG, WebP, or GIF · max 2MB. Falls back to initials if you
              remove your photo in the future.
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-navy-400">{email}</p>
            <p className="mt-1 text-xs text-navy-500">Member since {memberSinceLabel}</p>

            <form onSubmit={onSaveName} className="mt-8 border-t border-navy-800 pt-8">
              <label htmlFor="displayName" className="text-xs font-medium uppercase tracking-wide text-navy-400">
                Display name
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full max-w-md rounded-lg border border-navy-800 bg-navy-900 px-3 py-2.5 text-sm text-navy-100 outline-none ring-gold-500/30 focus:ring-2"
                  maxLength={160}
                  autoComplete="name"
                />
                <button
                  type="submit"
                  disabled={savingName}
                  className="shrink-0 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
                >
                  {savingName ? "Saving…" : "Save"}
                </button>
              </div>
              {nameMsg && (
                <p
                  className={`mt-2 text-sm ${nameMsg === "Saved." ? "text-fp-emerald" : "text-fp-red"}`}
                >
                  {nameMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
