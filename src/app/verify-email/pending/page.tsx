import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

export default async function VerificationPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="dark min-h-screen bg-[#0c120e] text-[#edf3ea] selection:bg-[#2d6042] selection:text-white flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0c120e]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo/shelflife.png" alt="ShelfLife" width={140} height={40} className="h-9 w-auto object-contain brightness-110" priority />
          </Link>

          <Link
            href="/"
            className="sl-focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-[#aab7ab] transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-white/10 bg-[#151a16] p-7 sm:p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-[#22c55e]">
            <Mail className="h-7 w-7" />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#92c69b]">
            <Sparkles className="h-3.5 w-3.5 text-[#22c55e]" />
            <span>Almost there</span>
          </div>

          <h1 className="sl-display-serif mt-4 text-3xl font-normal tracking-tight text-white sm:text-4xl">
            Check your inbox
          </h1>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#aab7ab]">
            We sent a verification link to{" "}
            <span className="font-semibold text-white">
              {email || "your registered email"}
            </span>
            . Open the link to finish setting up your account.
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-[#0e1410] p-4 text-left">
            <p className="text-xs font-medium text-white/90">What happens next?</p>
            <p className="mt-1 text-xs text-[#aab7ab] leading-relaxed">
              Clicking the link in your email will automatically verify your address, sign you in, and route you directly to your personalized workspace.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/"
              className="sl-focus-ring flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#2d6042] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#36704d]"
            >
              <span>Return to ShelfLife</span>
            </Link>

            <p className="text-xs text-[#aab7ab]">
              Did not receive the email? Check your spam or junk folder.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-white/40">
        &copy; {new Date().getFullYear()} ShelfLife. All rights reserved.
      </footer>
    </div>
  );
}
