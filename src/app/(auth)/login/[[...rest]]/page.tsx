import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      {error && (
        <p
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-fp-red"
          role="alert"
        >
          {error === "auth"
            ? "Authentication failed. Please sign in again."
            : "Something went wrong. Please try again."}
        </p>
      )}
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
      />
      <p
        className="mt-8 text-center text-sm text-navy-400 opacity-0"
        style={{
          animation: "fp-fade-in-up 0.5s ease-out 0.12s forwards",
        }}
      >
        <Link
          href="/reset-password"
          className="font-medium text-gold-600 transition-colors hover:text-gold-700"
        >
          Forgot password?
        </Link>
        <span className="mx-2 text-navy-600" aria-hidden>
          ·
        </span>
        <Link
          href="/signup"
          className="font-medium text-gold-600 transition-colors hover:text-gold-700"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
