import Link from "next/link";
import Image from "next/image";
import { createHash } from "node:crypto";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { db } from "@/prisma/db";
import VerificationForm from "@/components/auth/VerificationForm";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="dark min-h-screen bg-[#0c120e] text-[#edf3ea] selection:bg-[#2d6042] selection:text-white flex flex-col justify-between">
        <header className="border-b border-white/10 bg-[#0c120e]/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo/shelflife.png" alt="ShelfLife" width={140} height={40} className="h-9 w-auto object-contain brightness-110" priority />
            </Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-12">
          <div className="w-full rounded-2xl border border-white/10 bg-[#151a16] p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="sl-display-serif mt-5 text-2xl font-normal tracking-tight text-white sm:text-3xl">
              Invalid verification link
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#aab7ab]">
              This link is missing its verification token. Please use the original link sent to your email.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="sl-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#2d6042] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#36704d]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return home</span>
              </Link>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/5 py-4 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} ShelfLife. All rights reserved.
        </footer>
      </div>
    );
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const user = await db.orm.public.User.first({
    emailVerificationTokenHash: tokenHash,
  });

  if (!user || !user.emailVerificationExpiresAt || new Date(user.emailVerificationExpiresAt).getTime() < Date.now()) {
    return (
      <div className="dark min-h-screen bg-[#0c120e] text-[#edf3ea] selection:bg-[#2d6042] selection:text-white flex flex-col justify-between">
        <header className="border-b border-white/10 bg-[#0c120e]/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo/shelflife.png" alt="ShelfLife" width={140} height={40} className="h-9 w-auto object-contain brightness-110" priority />
            </Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-12">
          <div className="w-full rounded-2xl border border-white/10 bg-[#151a16] p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="sl-display-serif mt-5 text-2xl font-normal tracking-tight text-white sm:text-3xl">
              Verification link expired
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#aab7ab]">
              This verification link has expired or has already been used. Please sign up or request a new verification email.
            </p>
            <div className="mt-8 space-y-3">
              <Link
                href="/get-started"
                className="sl-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#2d6042] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#36704d]"
              >
                <span>Get Started</span>
              </Link>
              <Link
                href="/"
                className="inline-block text-xs font-medium text-[#aab7ab] hover:text-white transition"
              >
                Return to home
              </Link>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/5 py-4 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} ShelfLife. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#0c120e] text-[#edf3ea] selection:bg-[#2d6042] selection:text-white flex flex-col justify-between">
      <header className="border-b border-white/10 bg-[#0c120e]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo/shelflife.png" alt="ShelfLife" width={140} height={40} className="h-9 w-auto object-contain brightness-110" priority />
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-white/10 bg-[#151a16] p-8 text-center shadow-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#92c69b]">
            Account Verification
          </span>
          <h1 className="sl-display-serif mt-2 text-2xl font-normal tracking-tight text-white sm:text-3xl">
            Confirming your email
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#aab7ab]">
            Finalizing your ShelfLife account creation and establishing your secure session.
          </p>

          <div className="mt-8">
            <VerificationForm token={token} accountType={user.accountType} />
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#aab7ab] transition hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return home</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-white/40">
        &copy; {new Date().getFullYear()} ShelfLife. All rights reserved.
      </footer>
    </div>
  );
}