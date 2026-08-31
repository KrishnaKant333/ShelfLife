import Link from "next/link";
import Image from "next/image";

import ConsumerSignupForm from "@/components/auth/ConsumerSignupForm";

export default function ConsumerSignupPage() {
  return (
    <main className="min-h-screen bg-[var(--shelf-cream)]/30 px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--shelf-border)] bg-[var(--background)] shadow-[0_20px_50px_rgba(12,40,26,0.08)]">
        <div className="grid min-h-[760px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-between bg-gradient-to-br from-[var(--shelf-forest)] via-[var(--shelf-green)] to-[var(--shelf-dark)] p-8 text-white md:p-12">
            <div>
              <Link href="/" className="inline-block">
                <Image src="/logo/shelflife.png" alt="ShelfLife" width={150} height={150} className="h-12 w-auto object-contain brightness-0 invert" priority />
              </Link>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100/80">
                Consumer account
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                Keep your kitchen stocked and waste-aware.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-emerald-50/85">
                Track what you have, spot expiration dates early, and turn your inventory into smarter meals.
              </p>
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-emerald-50/80">What you&apos;ll manage</p>
              <ul className="mt-4 space-y-3 text-sm text-emerald-50">
                <li>• Expiry tracking and alerts</li>
                <li>• Personal inventory and pantry visibility</li>
                <li>• AI recipe suggestions based on what you have</li>
              </ul>
            </div>
          </section>

          <section className="flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
              <Link href="/get-started" className="text-sm font-medium text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)]">
                ← Choose another account type
              </Link>

              <div className="mt-8">
                <h2 className="text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">Create your account</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--shelf-muted)]">
                  Keep track of what you have, what is expiring, and what you can use next.
                </p>
              </div>

              <div className="mt-8">
                <ConsumerSignupForm />
              </div>

              <div className="mt-8 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 text-center text-sm text-[var(--shelf-muted)]">
                Running a business?{" "}
                <Link href="/business/signup" className="font-semibold text-[var(--shelf-dark)] underline underline-offset-4">
                  Create a business account
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}