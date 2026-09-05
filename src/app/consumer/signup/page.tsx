import Link from "next/link";
import Image from "next/image";

import ConsumerSignupForm from "@/components/auth/ConsumerSignupForm";

export default function ConsumerSignupPage() {
  return (
    <main className="min-h-screen bg-[var(--sl-color-canvas)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface-raised)] shadow-[var(--sl-shadow-lg)]">
        <div className="grid min-h-[760px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="auth-contrast-panel order-2 flex flex-col justify-between p-8 md:p-12 lg:order-1">
            <div>
              <Link href="/" className="inline-block">
                <Image src="/logo/shelflife.png" alt="ShelfLife" width={150} height={150} className="h-12 w-auto object-contain" priority />
              </Link>
              <p className="auth-panel-muted mt-8 text-sm font-semibold uppercase tracking-[0.2em]">
                Consumer account
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                Keep your kitchen stocked and waste-aware.
              </h1>
              <p className="auth-panel-muted mt-5 max-w-md text-base leading-7">
                Track what you have, spot expiration dates early, and turn your inventory into smarter meals.
              </p>
            </div>

            <div className="auth-panel-border auth-panel-soft mt-10 rounded-[1.5rem] border p-5 backdrop-blur-sm">
              <p className="auth-panel-muted text-sm font-medium">What you&apos;ll manage</p>
              <ul className="auth-panel-muted mt-4 space-y-3 text-sm">
                <li>• Expiry tracking and alerts</li>
                <li>• Personal inventory and pantry visibility</li>
                <li>• AI recipe suggestions based on what you have</li>
              </ul>
            </div>
          </section>

          <section className="order-1 flex items-center justify-center bg-[var(--sl-color-surface)] p-6 md:p-10 lg:order-2">
            <div className="w-full max-w-md">
              <Link href="/get-started" className="text-sm font-medium text-[var(--sl-color-text-muted)] transition hover:text-[var(--sl-color-text)]">
                ← Choose another account type
              </Link>

              <div className="mt-8">
                <h2 className="text-3xl font-bold tracking-tight text-[var(--sl-color-text)]">Create your account</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--sl-color-text-muted)]">
                  Keep track of what you have, what is expiring, and what you can use next.
                </p>
              </div>

              <div className="mt-8">
                <ConsumerSignupForm />
              </div>

              <div className="mt-8 rounded-2xl border border-[var(--sl-color-border)] bg-[var(--sl-color-surface-raised)] p-4 text-center text-sm text-[var(--sl-color-text-muted)]">
                Running a business?{" "}
                <Link href="/business/signup" className="font-semibold text-[var(--sl-color-text)] underline underline-offset-4">
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