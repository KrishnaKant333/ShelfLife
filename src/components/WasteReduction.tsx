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
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--shelf-forest)]">
              Impact
            </p>
            
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--shelf-dark)]">
              Use what you have.
              <span className="block text-[var(--shelf-green)]">
                Before it becomes waste.
              </span>
            </h2>

            <p className="mt-6 text-lg text-[var(--shelf-muted)] max-w-xl">
              ShelfLife isn't just about inventory. It's about being smarter with what you have, reducing unnecessary purchases, and making a real impact on food waste.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--shelf-cream)]">
                      <Icon className="h-5 w-5 text-[var(--shelf-forest)]" />
                    </div>
                    <h3 className="mt-3 font-bold text-[var(--shelf-dark)]">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--shelf-muted)]">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10">
              <Link
                href="/consumer/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--shelf-forest)] px-7 py-3 font-semibold text-white hover:opacity-90 transition"
              >
                Start Your Free Account
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 p-8 md:p-12">
            <div className="space-y-6">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-900 uppercase">Food Waste</p>
                <p className="mt-2 text-3xl font-bold text-amber-900">30%</p>
                <p className="mt-1 text-xs text-amber-800">of household food is wasted annually</p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-xs font-semibold text-green-900 uppercase">ShelfLife Impact</p>
                <p className="mt-2 text-lg font-bold text-green-900">Know what you have</p>
                <p className="mt-1 text-xs text-green-800">Track expiry, get alerts, use smarter</p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-900 uppercase">Your Benefit</p>
                <p className="mt-2 text-lg font-bold text-blue-900">Save money & reduce waste</p>
                <p className="mt-1 text-xs text-blue-800">Spend less, consume smarter, help the planet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
