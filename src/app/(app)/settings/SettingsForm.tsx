"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, SlidersHorizontal } from "lucide-react";

export function SettingsForm() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

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

  return (
    <>
      <h1
        className="font-display text-3xl font-bold tracking-tight text-navy-100 opacity-0 sm:text-4xl"
        style={{ animation: "fp-fade-in-up 0.6s ease-out 0.1s forwards" }}
      >
        Settings
      </h1>

      <div className="mt-10 flex flex-col gap-8">
        {/* Sensitivity preferences */}
        <section
          className="rounded-xl border border-navy-800 bg-white p-6 opacity-0 sm:p-8"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0.12s forwards" }}
        >
          <div className="flex items-center gap-2 text-navy-200">
            <SlidersHorizontal size={20} strokeWidth={1.75} aria-hidden />
            <h2 className="font-display text-lg font-semibold">Sensitivity preferences</h2>
          </div>
          <p className="mt-2 text-sm text-navy-500">
            Adjust how sensitive you are to different types of clauses. This
            personalizes your risk scores.
          </p>
          <Link
            href="/onboarding"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-navy-700 px-4 py-2.5 text-sm font-semibold text-navy-200 transition-colors hover:border-gold-500 hover:text-gold-700"
          >
            Edit preferences
          </Link>
        </section>

        {/* Danger zone */}
        <section
          className="rounded-xl border border-fp-red/30 bg-white p-6 opacity-0 sm:p-8"
          style={{ animation: "fp-fade-in-up 0.6s ease-out 0.15s forwards" }}
        >
          <div className="flex items-center gap-2 text-fp-red">
            <Trash2 size={20} strokeWidth={1.75} aria-hidden />
            <h2 className="font-display text-lg font-semibold">Danger zone</h2>
          </div>
          <p className="mt-2 text-sm text-navy-500">
            Permanently delete your FinePrint account and sign-in. This cannot be undone.
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
