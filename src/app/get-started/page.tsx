import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, UserRound } from "lucide-react";

const accountOptions = [
  {
    title: "I’m a Consumer",
    description: "Manage your personal food inventory, expiry dates and recipes.",
    href: "/consumer/signup",
    icon: UserRound,
    accent: "from-emerald-50 to-white",
    badge: "Personal",
  },
  {
    title: "I’m a Business",
    description:
      "Manage business inventory, FIFO priorities, waste and stock intelligence.",
    href: "/business/signup",
    icon: BriefcaseBusiness,
    accent: "from-amber-50 to-white",
    badge: "Business",
  },
];

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-[var(--shelf-cream)]/30 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--shelf-dark)]/70 transition hover:text-[var(--shelf-dark)]"
        >
          <span aria-hidden="true">←</span>
          Back to ShelfLife
        </Link>

        <div className="mt-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--shelf-forest)]">
            Get started
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--shelf-dark)] md:text-5xl">
            Choose how you&apos;ll use ShelfLife
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--shelf-muted)] md:text-lg">
            Pick the home that matches your inventory needs and we&apos;ll take you to the right setup flow.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {accountOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Link
                key={option.title}
                href={option.href}
                className="group block rounded-[2rem] border border-[var(--shelf-border)] bg-gradient-to-br p-[1px] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`flex h-full flex-col rounded-[calc(2rem-1px)] bg-gradient-to-br ${option.accent} dark:from-[var(--shelf-surface)] dark:to-[var(--shelf-cream)] p-8 text-left md:p-10`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--shelf-forest)] shadow-sm ring-1 ring-[var(--shelf-border)] dark:bg-[var(--shelf-surface)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-[var(--shelf-border)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--shelf-dark)] dark:bg-[var(--shelf-surface)]/80">
                      {option.badge}
                    </span>
                  </div>

                  <h2 className="mt-8 text-2xl font-bold tracking-tight text-[var(--shelf-dark)]">
                    {option.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-[var(--shelf-muted)]">
                    {option.description}
                  </p>

                  <div className="mt-8 inline-flex items-center gap-2 font-semibold text-[var(--shelf-forest)]">
                    Continue
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-[var(--shelf-muted)] md:flex-row">
          <span>Already have an account?</span>
          <div className="flex gap-4">
            <Link href="/consumer/login" className="font-semibold text-[var(--shelf-dark)] underline-offset-4 hover:underline">
              Consumer sign in
            </Link>
            <Link href="/business/login" className="font-semibold text-[var(--shelf-dark)] underline-offset-4 hover:underline">
              Business sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
