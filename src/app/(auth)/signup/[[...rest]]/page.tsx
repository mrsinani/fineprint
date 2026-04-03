import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div>
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
      />
      <p
        className="mt-8 text-center text-sm text-navy-400 opacity-0"
        style={{
          animation: "fp-fade-in-up 0.5s ease-out 0.12s forwards",
        }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-gold-600 transition-colors hover:text-gold-700"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
