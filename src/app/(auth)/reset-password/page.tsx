"use client";

import Link from "next/link";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const { isLoaded } = useAuth();
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!signIn) return;

    const { error: createError } = await signIn.create({
      identifier: email.trim(),
    });
    if (createError) {
      setError(createError.message ?? "Could not start reset.");
      return;
    }

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      setError(sendError.message ?? "Could not send reset email.");
      return;
    }

    setCodeSent(true);
    setMessage("Check your email for the reset code.");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!signIn) return;

    const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
      code: code.trim(),
    });
    if (verifyError) {
      setError(verifyError.message ?? "Invalid code.");
    }
  }

  async function submitNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!signIn) return;

    const { error: pwError } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
    });
    if (pwError) {
      setError(pwError.message ?? "Could not update password.");
      return;
    }

    if (signIn.status === "complete") {
      const { error: finError } = await signIn.finalize({
        navigate: async ({ decorateUrl }) => {
          const url = decorateUrl("/dashboard");
          if (url.startsWith("http")) {
            window.location.assign(url);
          } else {
            router.push(url);
          }
        },
      });
      if (finError) {
        setError(finError.message ?? "Could not complete sign-in.");
      }
    }
  }

  const busy = fetchStatus === "fetching";

  if (!isLoaded || signIn === null) {
    return (
      <div className="rounded-xl border border-navy-800 bg-white p-8 text-center text-sm text-navy-400">
        Loading…
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-navy-800 bg-white p-8 opacity-0 shadow-sm"
      style={{
        animation: "fp-fade-in-up 0.55s ease-out 0.05s forwards",
      }}
    >
      <h1 className="text-xl font-semibold text-navy-100">Reset password</h1>
      <p className="mt-2 text-sm text-navy-400">
        We&apos;ll email you a code to set a new password.
      </p>

      {message && (
        <p className="mt-4 rounded-lg bg-gold-100/80 px-3 py-2 text-sm text-navy-200">{message}</p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-fp-red" role="alert">
          {error}
        </p>
      )}

      {!codeSent && (
        <form onSubmit={sendCode} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-navy-400">
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="mt-1.5 w-full rounded-lg border border-navy-800 bg-navy-900 px-3 py-2.5 text-sm text-navy-100 placeholder:text-navy-500 outline-none ring-gold-500/30 focus:ring-2"
              placeholder="you@company.com"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-gold-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
          >
            Send reset code
          </button>
        </form>
      )}

      {codeSent && signIn?.status !== "needs_new_password" && (
        <form onSubmit={verifyCode} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-navy-400">
              Code from email
            </span>
            <input
              type="text"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(ev) => setCode(ev.target.value)}
              className="mt-1.5 w-full rounded-lg border border-navy-800 bg-navy-900 px-3 py-2.5 text-sm text-navy-100 outline-none ring-gold-500/30 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-gold-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
          >
            Verify code
          </button>
        </form>
      )}

      {signIn?.status === "needs_new_password" && (
        <form onSubmit={submitNewPassword} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-navy-400">
              New password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="mt-1.5 w-full rounded-lg border border-navy-800 bg-navy-900 px-3 py-2.5 text-sm text-navy-100 outline-none ring-gold-500/30 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-gold-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-600 disabled:opacity-60"
          >
            Save password
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-navy-400">
        <Link href="/login" className="font-medium text-gold-600 hover:text-gold-700">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
