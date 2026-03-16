import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero */}
      <section
        className="relative flex h-screen w-full flex-col"
        style={{
          backgroundImage: "url(/hero-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-6 sm:px-12 lg:px-20">
          <div className="flex items-center gap-10">
            <Link
              href="#about"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="#services"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              Our Services
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              How It Works
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            Sign Up
          </Link>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <Image
            src="/logo.png"
            alt="FinePrint owl logo"
            width={120}
            height={96}
            className="mb-8"
            priority
          />

          <h1 className="max-w-3xl text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
            AI-powered contract analysis
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
            Summarize, analyze, and review your contracts with full confidence
          </p>

          <ChevronDown
            size={32}
            strokeWidth={1.5}
            className="mt-10 animate-bounce text-white/60"
            aria-hidden
          />

          <Link
            href="/dashboard"
            className="mt-6 rounded-full border border-white/40 px-10 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:border-white/70 hover:bg-white/10"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* What we do */}
      <section id="about" className="bg-white px-8 py-24 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-right text-3xl font-light text-navy-300 sm:text-4xl">
            What we do
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Contract Summaries",
                desc: "Get plain-English summaries of any contract in seconds, highlighting what matters most.",
              },
              {
                title: "Risk Analysis",
                desc: "Identify unfavorable clauses, hidden obligations, and potential risks before you sign.",
              },
              {
                title: "Clause Review",
                desc: "Break down every section so you understand exactly what you're agreeing to.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-navy-800 p-6">
                <h3 className="text-base font-semibold text-navy-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800 bg-white px-8 py-8 sm:px-12 lg:px-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <p className="text-sm text-navy-500">
            &copy; {new Date().getFullYear()} FinePrint
          </p>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
          >
            Get Started &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
