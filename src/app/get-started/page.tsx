import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, Sparkles, UserRound } from "lucide-react";

const options = [
  {
    title: "Consumer Kitchen",
    subtitle: "Personal & Household",
    badge: "Consumer",
    description: "Manage your household groceries, spot expiry dates early, and turn ingredients you have into zero-waste meals.",
    href: "/consumer/signup",
    loginHref: "/consumer/login",
    icon: UserRound,
    highlights: [
      "Smart expiration alerts and pantry visibility",
      "AI recipe matching from ingredients on hand",
      "Instant receipt and label scanning",
    ],
    ctaText: "Start as Consumer",
  },
  {
    title: "Commercial Operations",
    subtitle: "Food Service & Hospitality",
    badge: "Business",
    description: "Enforce FIFO stock rotation, track spoilage risk, and eliminate shrinkage across your commercial kitchen.",
    href: "/business/signup",
    loginHref: "/business/login",
    icon: BriefcaseBusiness,
    highlights: [
      "FIFO batch rotation and stock priority tracking",
      "Comprehensive waste analytics and cost exposure",
      "High-throughput inventory capture and audits",
    ],
    ctaText: "Start as Business",
  },
];

export default function GetStartedPage() {
  return (
    <div className="dark min-h-screen bg-[#0c120e] text-[#edf3ea] selection:bg-[#2d6042] selection:text-white flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0c120e]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="sl-focus-ring flex items-center gap-2 rounded-lg py-1 transition opacity-90 hover:opacity-100"
          >
            <Image
              src="/logo/shelflife.png"
              alt="ShelfLife"
              width={140}
              height={40}
              className="h-9 w-auto object-contain brightness-110"
              priority
            />
          </Link>

          <Link
            href="/"
            className="sl-focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-[#aab7ab] transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to ShelfLife</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#92c69b]">
            <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
            <span>Get Started with ShelfLife</span>
          </div>

          <h1 className="sl-display-serif mt-5 text-3xl font-normal tracking-tight text-white sm:text-4xl md:text-5xl">
            Choose your workspace
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-[#aab7ab]">
            Select the environment tailored to your kitchen scale — personal household pantry or commercial food operations.
          </p>
        </div>

        {/* Options Grid */}
        <div className="mt-8 sm:mt-12 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {options.map((option) => {
            const Icon = option.icon;

            return (
              <div
                key={option.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#151a16] p-6 sm:p-8 md:p-9 shadow-xl transition duration-300 hover:border-[#22c55e]/40 hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2d6042]/20 border border-[#22c55e]/30 text-[#92c69b] shadow-sm transition group-hover:bg-[#2d6042]/30 group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#92c69b]">
                      {option.badge}
                    </span>
                  </div>

                  <div className="mt-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#aab7ab]">
                      {option.subtitle}
                    </span>
                    <h2 className="sl-display-serif mt-1 text-2xl font-normal tracking-tight text-white sm:text-3xl">
                      {option.title}
                    </h2>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[#aab7ab]">
                    {option.description}
                  </p>

                  <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
                    {option.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22c55e] mt-0.5" />
                        <span className="text-xs sm:text-sm text-[#edf3ea]/90 leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                  <Link
                    href={option.href}
                    className="sl-focus-ring flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#2d6042] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#36704d] active:scale-[0.99]"
                  >
                    <span>{option.ctaText}</span>
                    <ArrowRight size={16} />
                  </Link>

                  <p className="text-center text-xs text-[#aab7ab]">
                    Already registered?{" "}
                    <Link
                      href={option.loginHref}
                      className="font-medium text-white underline underline-offset-4 transition hover:text-[#92c69b]"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-white/40">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} ShelfLife. All rights reserved.</span>
          <div className="flex items-center gap-4 text-white/50">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/#how-it-works" className="hover:text-white transition">How it Works</Link>
            <Link href="/#pricing" className="hover:text-white transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
