import Link from "next/link";
import { Leaf, TrendingDown, BarChart3, Lightbulb } from "lucide-react";

export default function WasteReduction() {
  const benefits = [
    {
      icon: Leaf,
      title: "Reduce Food Waste",
      description: "Track what you have and use it before it goes bad.",
    },
    {
      icon: TrendingDown,
      title: "Lower Costs",
      description: "Stop buying duplicates and wasting money on expired products.",
    },
    {
      icon: BarChart3,
      title: "Understand Patterns",
      description: "See what you consume most and plan better shopping.",
    },
    {
      icon: Lightbulb,
      title: "Smarter Decisions",
      description: "Get AI-powered insights and suggestions tailored to your inventory.",
    },
  ];

  return (
    <section id="waste-impact" className="border-b border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div>
            <p className="sl-eyebrow">
              Impact
            </p>

            <h2 className="mt-4 text-4xl font-semibold text-[var(--sl-color-text)] md:text-5xl">
              Use what you have.
              <span className="mt-2 block text-[var(--sl-color-action)]">
                Before it becomes waste.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg text-[var(--sl-color-text-muted)]">
              ShelfLife isn&apos;t just about inventory. It&apos;s about being smarter with what you have, reducing unnecessary purchases, and making a real impact on food waste.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--sl-color-action-soft)]">
                      <Icon className="h-5 w-5 text-[var(--sl-color-action)]" />
                    </div>
                    <h3 className="mt-3 font-semibold text-[var(--sl-color-text)]">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--sl-color-text-muted)]">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10">
              <Link
                href="/consumer/signup"
                className="sl-focus-ring inline-flex min-h-12 items-center gap-2 rounded-[var(--sl-radius-pill)] bg-[var(--sl-color-action)] px-7 py-3 font-semibold text-[var(--sl-color-on-action)] transition hover:bg-[var(--sl-color-action-hover)]"
              >
                Start Your Free Account
              </Link>
            </div>
          </div>

          <div className="rounded-[var(--sl-radius-xl)] border border-[var(--sl-color-border)] bg-[var(--sl-color-canvas)] p-8 md:p-12">
            <div className="space-y-6">

              <div className="rounded-lg border border-[var(--sl-color-warning)]/30 bg-[var(--sl-color-warning)]/10 p-4">
                <p className="text-xs font-semibold uppercase text-[var(--sl-color-warning)]">
                  Food Waste
                </p>
                <p className="mt-2 text-3xl font-bold text-[var(--sl-color-warning)]">
                  30%
                </p>
                <p className="mt-1 text-xs text-[var(--sl-color-warning)]">
                  of household food is wasted annually
                </p>
              </div>

              <div className="rounded-lg border border-[var(--sl-color-success)]/30 bg-[var(--sl-color-success)]/10 p-4">
                <p className="text-xs font-semibold uppercase text-[var(--sl-color-success)]">
                  ShelfLife Impact
                </p>
                <p className="mt-2 text-lg font-bold text-[var(--sl-color-success)]">
                  Know what you have
                </p>
                <p className="mt-1 text-xs text-[var(--sl-color-success)]">
                  Track expiry, get alerts, use smarter
                </p>
              </div>

              <div className="rounded-lg border border-[var(--sl-color-info)]/30 bg-[var(--sl-color-info)]/10 p-4">
                <p className="text-xs font-semibold uppercase text-[var(--sl-color-info)]">
                  Your Benefit
                </p>
                <p className="mt-2 text-lg font-bold text-[var(--sl-color-info)]">
                  Save money & reduce waste
                </p>
                <p className="mt-1 text-xs text-[var(--sl-color-info)]">
                  Spend less, consume smarter, help the planet
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
