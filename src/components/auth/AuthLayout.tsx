import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface HighlightItem {
  title: string;
  desc: string;
}

interface AuthLayoutProps {
  accountType: "consumer" | "business";
  flowType: "login" | "signup";
  badgeText: string;
  title: string;
  subtitle: string;
  editorialHeadline: string;
  editorialDescription: string;
  highlights: HighlightItem[];
  switchPrompt: {
    text: string;
    linkText: string;
    href: string;
  };
  children: React.ReactNode;
}

export default function AuthLayout({
  accountType,
  flowType,
  badgeText,
  title,
  subtitle,
  editorialHeadline,
  editorialDescription,
  highlights,
  switchPrompt,
  children,
}: AuthLayoutProps) {
  const isBusiness = accountType === "business";

  return (
    <div className="dark min-h-screen bg-[#0c120e] text-[#edf3ea] selection:bg-[#2d6042] selection:text-white flex flex-col justify-between">
      {/* Top Header Bar */}
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
            href="/get-started"
            className="sl-focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-[#aab7ab] transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Switch account type</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-10 md:py-12">
        <div className="grid w-full gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
          
          {/* Desktop Editorial Showcase Panel (Order 2 on mobile / Order 1 on lg) */}
          <section className="order-2 flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121814]/80 p-6 sm:p-8 md:p-10 backdrop-blur-sm lg:order-1 lg:col-span-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#92c69b]">
                <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
                <span>{badgeText}</span>
              </div>

              <h1 className="sl-display-serif mt-5 text-2xl font-normal tracking-tight text-white sm:text-3xl lg:text-4xl leading-snug">
                {editorialHeadline}
              </h1>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#aab7ab]">
                {editorialDescription}
              </p>

              <div className="mt-8 space-y-4">
                {highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2d6042]/30 text-[#22c55e]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-medium text-white/95">{item.title}</h2>
                      <p className="text-xs text-[#aab7ab] leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#aab7ab]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
                <span>Encrypted & secure session</span>
              </div>
              <span className="font-mono text-[11px] text-white/40">
                {isBusiness ? "COMMERCIAL SUITE" : "HOUSEHOLD PANTRY"}
              </span>
            </div>
          </section>

          {/* Form Container (Order 1 on mobile for immediate form-first access) */}
          <section className="order-1 lg:order-2 lg:col-span-7 flex flex-col justify-center">
            <div className="rounded-2xl border border-white/10 bg-[#151a16] p-5 sm:p-8 md:p-10 shadow-2xl">
              <div className="mb-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#92c69b]">
                    {isBusiness ? "Business Operations" : "Consumer Pantry"}
                  </span>
                  <span className="text-xs text-[#aab7ab]">
                    {flowType === "login" ? "Sign In" : "Registration"}
                  </span>
                </div>

                <h2 className="sl-display-serif mt-2 text-2xl font-normal tracking-tight text-white sm:text-3xl">
                  {title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#aab7ab]">
                  {subtitle}
                </p>
              </div>

              {/* Form Element */}
              {children}

              {/* Context Switcher Prompt */}
              <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs sm:text-sm text-[#aab7ab]">
                {switchPrompt.text}{" "}
                <Link
                  href={switchPrompt.href}
                  className="font-semibold text-white underline underline-offset-4 transition hover:text-[#92c69b]"
                >
                  {switchPrompt.linkText}
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-white/40">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} ShelfLife. All rights reserved.</span>
          <div className="flex items-center gap-4 text-white/50">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/get-started" className="hover:text-white transition">Get Started</Link>
            <Link href="/#pricing" className="hover:text-white transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
