"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID;

export default function ExtensionAuthPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<"loading" | "sending" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function sendToken() {
      setStatus("sending");
      try {
        const token = await getToken({ template: "fineprint-extension" });
        if (!token) {
          setErrorMsg("Failed to generate token. Please try again.");
          setStatus("error");
          return;
        }

        const chromeRef = (globalThis as unknown as Record<string, unknown>).chrome as
          | { runtime?: { sendMessage?: (id: string, msg: unknown) => Promise<unknown> } }
          | undefined;

        if (EXTENSION_ID && chromeRef?.runtime?.sendMessage) {
          try {
            await chromeRef.runtime.sendMessage(EXTENSION_ID, {
              type: "AUTH_TOKEN",
              payload: { token },
            });
            setStatus("done");
            return;
          } catch {
            // Extension messaging failed, fall back to postMessage
          }
        }

        window.postMessage(
          { source: "fineprint-auth", type: "AUTH_TOKEN", token },
          "*",
        );
        setStatus("done");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Authentication failed");
        setStatus("error");
      }
    }

    sendToken();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
          <p className="mt-4 text-navy-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900">
        <div className="mx-auto max-w-sm rounded-xl border border-navy-700 bg-navy-850 p-8 text-center">
          <h1 className="font-display text-xl font-bold text-navy-100">
            Sign in to FinePrint
          </h1>
          <p className="mt-2 text-sm text-navy-400">
            Sign in to connect the Chrome extension to your account.
          </p>
          <a
            href="/login?redirect_url=/extension/auth"
            className="mt-6 inline-block rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-navy-50 transition-colors hover:bg-gold-400"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900">
      <div className="mx-auto max-w-sm rounded-xl border border-navy-700 bg-navy-850 p-8 text-center">
        {status === "sending" && (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
            <p className="mt-4 text-navy-400">Connecting extension...</p>
          </>
        )}
        {status === "done" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-navy-100">
              Connected!
            </h2>
            <p className="mt-2 text-sm text-navy-400">
              Signed in as {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "user"}.
              You can close this tab and return to the extension.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-navy-100">
              Connection Failed
            </h2>
            <p className="mt-2 text-sm text-navy-400">{errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-navy-50 transition-colors hover:bg-gold-400"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
