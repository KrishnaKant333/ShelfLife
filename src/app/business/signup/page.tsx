import Link from "next/link";
import Image from "next/image";

import BusinessSignupForm from "@/components/auth/BusinessSignupForm";

export default function BusinessSignupPage() {
  return (
    <main className="min-h-screen bg-[var(--sl-color-canvas)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface-raised)] shadow-[var(--sl-shadow-lg)]">
        <div className="grid min-h-[820px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="auth-contrast-panel order-2 flex flex-col justify-between p-8 md:p-12 lg:order-1">
            <div>
              <Link href="/" className="inline-block">
                <Image src="/logo/shelflife.png" alt="ShelfLife" width={150} height={150} className="h-12 w-auto object-contain" priority />
              </Link>
              <p className="auth-panel-muted mt-8 text-sm font-semibold uppercase tracking-[0.2em]">
                Business account
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                Run smarter, lower-waste operations.
              </h1>
              <p className="auth-panel-muted mt-5 max-w-md text-base leading-7">
                Track inventory, prioritize FIFO, reduce waste risk, and keep stock decisions grounded in real operational data.
              </p>
            </div>

            <div className="auth-panel-border auth-panel-soft mt-10 rounded-[1.5rem] border p-5 backdrop-blur-sm">
              <p className="auth-panel-muted text-sm font-medium">Built for operations</p>
              <ul className="auth-panel-muted mt-4 space-y-3 text-sm">
                <li>• FIFO inventory prioritization</li>
                <li>• Expiry and waste visibility</li>
                <li>• Stock intelligence for better decisions</li>
              </ul>
            </div>
          </section>

          <section className="order-1 flex items-center justify-center bg-[var(--sl-color-surface)] p-6 md:p-10 lg:order-2">
            <div className="w-full max-w-md">
              <Link href="/get-started" className="text-sm font-medium text-[var(--sl-color-text-muted)] transition hover:text-[var(--sl-color-text)]">
                ← Choose another account type
              </Link>

              <div className="mt-8">
                <h2 className="text-3xl font-bold tracking-tight text-[var(--sl-color-text)]">Set up your business</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--sl-color-text-muted)]">
                  Manage inventory, expiry dates, stock levels, and business operations with ShelfLife.
                </p>
              </div>

              <div className="mt-8">
                <BusinessSignupForm />
              </div>

              <div className="mt-8 rounded-2xl border border-[var(--sl-color-border)] bg-[var(--sl-color-surface-raised)] p-4 text-center text-sm text-[var(--sl-color-text-muted)]">
                Managing your personal inventory?{" "}
                <Link href="/consumer/signup" className="font-semibold text-[var(--sl-color-text)] underline underline-offset-4">
                  Create a consumer account
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}