"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  FileSearch,
  FileUp,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setOn(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${className} ${
        on ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const navLinkClass =
  "text-sm font-medium text-white/90 transition-colors hover:text-white";

export function LandingView() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero */}
      <section
        className="relative flex min-h-[100dvh] w-full flex-col"
        style={{
          backgroundImage: "url(/hero-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-50/20 to-navy-50/50" aria-hidden />

        <nav className="relative z-10 flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-10 lg:px-16 xl:px-20">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:flex-1 sm:justify-start">
            <a href="#about" className={navLinkClass}>
              About
            </a>
            <a href="#services" className={navLinkClass}>
              Our Services
            </a>
            <a href="#how-it-works" className={navLinkClass}>
              How It Works
            </a>
          </div>
          <div className="flex items-center justify-center gap-x-5 sm:justify-end">
            <Link href="/login" className={navLinkClass}>
              Sign In
            </Link>
            <Link
              href="/signup"
              className="whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/20"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-6 text-center sm:px-8">
          <Image
            src="/logo.png"
            alt="FinePrint owl logo"
            width={120}
            height={96}
            className="mb-6 w-[88px] sm:mb-8 sm:w-[120px]"
            style={{ width: "auto", height: "auto" }}
            priority
          />

          <h1 className="max-w-3xl text-3xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
            AI-powered contract analysis
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/85 sm:mt-5 sm:text-lg">
            Summarize, analyze, and review your contracts with full confidence
          </p>

          <ChevronDown
            size={32}
            strokeWidth={1.5}
            className="mt-8 animate-bounce text-white/60 sm:mt-10"
            aria-hidden
          />

          <Link
            href="/signup"
            className="mt-5 rounded-full border border-white/40 px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:border-white/70 hover:bg-white/10 sm:mt-6 sm:px-10 sm:py-3 sm:text-sm"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* About — What we do */}
      <section
        id="about"
        className="scroll-mt-20 bg-white px-4 py-16 sm:scroll-mt-24 sm:px-6 sm:py-20 md:px-10 lg:px-16 xl:px-20 lg:py-24"
      >
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center text-3xl font-light text-navy-300 sm:text-4xl">
              What we do
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
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
            ].map((item, i) => (
              <Reveal key={item.title} delay={80 + i * 70}>
                <div className="h-full rounded-xl border border-navy-800 p-5 sm:p-6">
                  <h3 className="text-base font-semibold text-navy-100">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-400">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section
        id="services"
        className="scroll-mt-20 border-t border-navy-800 bg-navy-900 px-4 py-16 sm:scroll-mt-24 sm:px-6 sm:py-20 md:px-10 lg:px-16 xl:px-20 lg:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center text-3xl font-light text-navy-100 sm:text-4xl">Our Services</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-navy-400 sm:text-base">
              Everything you need to move from raw PDFs to confident decisions—whether you sign one contract a year or
              dozens.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Core analysis",
                desc: "Upload PDFs and DOCX files for instant structure, summaries, and a clear risk overview.",
              },
              {
                icon: Scale,
                title: "Compliance-ready review",
                desc: "Spot one-sided terms, renewal traps, and liability shifts before they become problems.",
              },
              {
                icon: ShieldCheck,
                title: "Secure workspace",
                desc: "Keep contracts organized in one place with trash recovery and a trail of what you reviewed.",
              },
            ].map((s, i) => (
              <Reveal key={s.title} delay={100 + i * 90}>
                <div className="flex h-full flex-col rounded-xl border border-navy-800 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                    <s.icon size={22} strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-navy-100">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-400">{s.desc}</p>
                  <a
                    href="#how-it-works"
                    className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-gold-600 hover:text-gold-700"
                  >
                    See how it works
                    <ArrowRight size={16} aria-hidden />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 bg-white px-4 py-16 sm:scroll-mt-24 sm:px-6 sm:py-20 md:px-10 lg:px-16 xl:px-20 lg:py-24"
      >
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center text-3xl font-light text-navy-300 sm:text-4xl">How It Works</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-sm text-navy-500 sm:text-base">
              Three steps from upload to clarity—no legal jargon required.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                step: "01",
                icon: FileUp,
                title: "Upload",
                desc: "Drop your contract. We extract text and preserve structure so nothing important is missed.",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "Analyze",
                desc: "Our pipeline summarizes terms, scores risk, and surfaces clauses that need your attention.",
              },
              {
                step: "03",
                icon: FileSearch,
                title: "Review",
                desc: "Read plain-English explanations, compare sections, and decide with confidence before you sign.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} delay={120 + i * 100}>
                <div className="relative text-center md:text-left">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 md:mx-0">
                    <step.icon size={28} strokeWidth={1.5} aria-hidden />
                  </div>
                  <p className="mt-4 font-mono text-xs font-semibold tracking-widest text-gold-600">{step.step}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-navy-100">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-400">{step.desc}</p>
                  {i < 2 && (
                    <div
                      className="absolute right-0 top-8 hidden h-px w-[calc(50%-2rem)] translate-x-1/2 bg-gradient-to-r from-navy-800 to-transparent md:block lg:w-[calc(50%-3rem)]"
                      aria-hidden
                    />
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-14 flex justify-center">
              <Link
                href="/signup"
                className="rounded-full bg-gold-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gold-600"
              >
                Start for free
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-navy-800 bg-white px-4 py-8 sm:px-6 md:px-10 lg:px-16 xl:px-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-navy-500">&copy; {new Date().getFullYear()} FinePrint</p>
          <Link
            href="/signup"
            className="text-sm font-medium text-gold-600 transition-colors hover:text-gold-700"
          >
            Get Started &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
