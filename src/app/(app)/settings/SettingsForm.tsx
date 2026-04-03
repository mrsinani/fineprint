"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Bell, Mail, Trash2 } from "lucide-react";
import { updateNotificationPrefs } from "@/app/actions/userProfile";

type SettingsFormProps = {
  initialNotifyContract: boolean;
  initialNotifyProduct: boolean;
};

export function SettingsForm({
  initialNotifyContract,
  initialNotifyProduct,
}: SettingsFormProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [notifyContract, setNotifyContract] = useState(initialNotifyContract);
  const [notifyProduct, setNotifyProduct] = useState(initialNotifyProduct);
  const [prefsMsg, setPrefsMsg] = useState<string | null>(null);
  const [prefsSaving, setPrefsSaving] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  async function savePrefs() {
    setPrefsMsg(null);
    setPrefsSaving(true);
    const res = await updateNotificationPrefs({
      notifyContractReady: notifyContract,
      notifyProductUpdates: notifyProduct,
    });
    setPrefsSaving(false);
    if ("error" in res && res.error) {
      setPrefsMsg(res.error);
      return;
    }
    setPrefsMsg("Preferences saved.");
    router.refresh();
  }

  async function addEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg(null);
    if (!user || !newEmail.trim()) return;
    setEmailBusy(true);
    try {
      await user.createEmailAddress({ email: newEmail.trim() });
      await user.reload();
      setNewEmail("");
      setEmailMsg("Check your inbox to verify the new address, then you can set it as primary in Clerk if needed.");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "errors" in err &&
        Array.isArray((err as { errors: { message: string }[] }).errors)
          ? (err as { errors: { message: string }[] }).errors[0]?.message
          : "Could not add email.";
      setEmailMsg(msg ?? "Could not add email.");
    } finally {
      setEmailBusy(false);
    }
  }

  async function setPrimaryEmail(id: string) {
    if (!user) return;
    setEmailMsg(null);
    setEmailBusy(true);
    try {
      await user.update({ primaryEmailAddressId: id });
      await user.reload();
      setEmailMsg("Primary email updated.");
    } catch {
      setEmailMsg("Could not update primary email.");
    } finally {
      setEmailBusy(false);
    }
  }

  async function confirmDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleteErr(null);
    setDeleteBusy(true);
    try {
      const r = await fetch("/api/account", { method: "DELETE" });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) {
        setDeleteErr(data.error ?? "Something went wrong.");
        return;
      }
      window.location.href = "/";
    } finally {
      setDeleteBusy(false);
    }
  }

  const primaryId = user?.primaryEmailAddressId;

  return (
    <>
      <h1
        className="font-display text-3xl font-bold tracking-tight text-navy-100 opacity-0 sm:text-4xl"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        Settings
      </h1>

      <div className="mt-10 flex flex-col gap-8">
        {/* Account — email via Clerk (no change-password) */}
        <section
          className="rounded-xl border border-navy-800 bg-white p-6 opacity-0 sm:p-8"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0.15s forwards" }}
        >
          <div className="flex items-center gap-2 text-navy-100">
            <Mail size={20} strokeWidth={1.75} className="text-gold-600" aria-hidden />
            <h2 className="font-display text-lg font-semibold">Account</h2>
          </div>
          <p className="mt-2 text-sm text-navy-500">
            Email addresses are managed with Clerk. Add a secondary email, verify it, then set it as primary if you
            like.
          </p>

          {!isLoaded || !user ? (
            <p className="mt-6 text-sm text-navy-400">Loading account…</p>
          ) : (
            <>
              <ul className="mt-6 space-y-3 border-t border-navy-800 pt-6">
                {user.emailAddresses.map((ea) => (
                  <li
                    key={ea.id}
                    className="flex flex-col gap-2 rounded-lg border border-navy-800 bg-navy-900 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy-100">{ea.emailAddress}</p>
                      <p className="text-xs text-navy-500">
                        {ea.id === primaryId ? "Primary" : "Secondary"}
                        {ea.verification?.status === "verified" ? " · Verified" : " · Pending verification"}
                      </p>
                    </div>
                    {ea.id !== primaryId && ea.verification?.status === "verified" && (
                      <button
                        type="button"
                        disabled={emailBusy}
                        onClick={() => setPrimaryEmail(ea.id)}
                        className="text-xs font-semibold text-gold-600 hover:text-gold-700 disabled:opacity-50"
                      >
                        Make primary
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <form onSubmit={addEmail} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label htmlFor="newEmail" className="text-xs font-medium uppercase tracking-wide text-navy-400">
                    Add email
                  </label>
                  <input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-navy-800 bg-navy-900 px-3 py-2.5 text-sm text-navy-100 outline-none ring-gold-500/30 focus:ring-2"
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailBusy || !newEmail.trim()}
                  className="rounded-lg bg-navy-100 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {emailBusy ? "…" : "Add"}
                </button>
              </form>
              {emailMsg && <p className="mt-3 text-sm text-navy-400">{emailMsg}</p>}
            </>
          )}
        </section>

        {/* Preferences */}
        <section
          className="rounded-xl border border-navy-800 bg-white p-6 opacity-0 sm:p-8"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0.22s forwards" }}
        >
          <div className="flex items-center gap-2 text-navy-100">
            <Bell size={20} strokeWidth={1.75} className="text-gold-600" aria-hidden />
            <h2 className="font-display text-lg font-semibold">Preferences</h2>
          </div>
          <p className="mt-2 text-sm text-navy-500">
            Notification toggles are stored on your FinePrint profile. (Delivery is coming soon.)
          </p>

          <div className="mt-6 space-y-4 border-t border-navy-800 pt-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={notifyContract}
                onChange={(e) => setNotifyContract(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-navy-600 text-gold-600 focus:ring-gold-500"
              />
              <span>
                <span className="block text-sm font-medium text-navy-100">Contract analysis ready</span>
                <span className="text-xs text-navy-500">When a document you uploaded finishes processing.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={notifyProduct}
                onChange={(e) => setNotifyProduct(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-navy-600 text-gold-600 focus:ring-gold-500"
              />
              <span>
                <span className="block text-sm font-medium text-navy-100">Product updates</span>
                <span className="text-xs text-navy-500">News and improvements to FinePrint.</span>
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={savePrefs}
            disabled={prefsSaving}
            className="mt-6 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
          >
            {prefsSaving ? "Saving…" : "Save preferences"}
          </button>
          {prefsMsg && (
            <p className={`mt-2 text-sm ${prefsMsg.includes("saved") ? "text-fp-emerald" : "text-fp-red"}`}>
              {prefsMsg}
            </p>
          )}
        </section>

        {/* Danger zone */}
        <section
          className="rounded-xl border border-fp-red/30 bg-white p-6 opacity-0 sm:p-8"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0.28s forwards" }}
        >
          <div className="flex items-center gap-2 text-fp-red">
            <Trash2 size={20} strokeWidth={1.75} aria-hidden />
            <h2 className="font-display text-lg font-semibold">Danger zone</h2>
          </div>
          <p className="mt-2 text-sm text-navy-500">
            Permanently delete your FinePrint account and Clerk sign-in. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => {
              setDeleteOpen(true);
              setDeleteConfirm("");
              setDeleteErr(null);
            }}
            className="mt-6 rounded-lg border border-fp-red/50 px-4 py-2.5 text-sm font-semibold text-fp-red transition-colors hover:bg-red-50"
          >
            Delete account
          </button>
        </section>
      </div>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-50/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="max-w-md rounded-xl border border-navy-800 bg-white p-6 shadow-lg">
            <h3 id="delete-title" className="font-display text-lg font-semibold text-navy-100">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm text-navy-500">
              Type <span className="font-mono font-semibold text-navy-200">DELETE</span> to confirm. Your documents
              and data will be removed.
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="mt-4 w-full rounded-lg border border-navy-800 bg-navy-900 px-3 py-2.5 text-sm text-navy-100 outline-none ring-gold-500/30 focus:ring-2"
              placeholder="DELETE"
              autoComplete="off"
            />
            {deleteErr && <p className="mt-2 text-sm text-fp-red">{deleteErr}</p>}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-navy-400 hover:bg-navy-850"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy || deleteConfirm !== "DELETE"}
                onClick={confirmDelete}
                className="rounded-lg bg-fp-red px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleteBusy ? "Deleting…" : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
