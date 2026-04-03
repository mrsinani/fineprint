import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div>
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
