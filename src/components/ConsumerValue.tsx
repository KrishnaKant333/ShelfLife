import Link from "next/link";
import {
  Utensils,
  Clock,
  BarChart3,
  Zap,
} from "lucide-react";

export default function ConsumerValue() {
  const features = [
    {
      icon: Utensils,
      title: "AI Recipe Suggestions",
      description:
        "Get personalized recipe ideas based on what's expiring soon in your kitchen.",
    },
    {
      icon: Clock,
      title: "Smart Expiry Tracking",
      description:
        "Never wonder if something has gone bad. Real-time expiry alerts keep you informed.",
    },
    {
      icon: BarChart3,
      title: "Personal Analytics",
      description:
        "Understand your consumption patterns and plan smarter shopping trips.",
    },
    {
      icon: Zap,
      title: "AI Label Scanning",
      description:
        "Upload product labels to extract useful inventory details without retyping them.",
    },
  ];

  return (
    <section id="consumer" className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--shelf-forest)]">
              For Your Kitchen
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--shelf-dark)]">
              Food inventory for everyday life
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-[var(--shelf-muted)]">
            Know what's in your fridge, eat what you have, and waste less without overthinking it.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[2rem] border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-8 md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
              <Utensils className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shelf-forest)]">
              Smart pantry management
            </p>
            <h3 className="mt-3 text-3xl font-bold text-[var(--shelf-dark)]">
              AI recipe suggestions built around what you already have
            </h3>
            <p className="mt-4 max-w-lg text-base leading-7 text-[var(--shelf-muted)]">
              Get personalized ideas based on what's expiring soon, reduce duplicate purchases, and turn your inventory into useful meals instead of waste.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--shelf-dark)]">
              <span className="rounded-full border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3 py-1.5">Expiry-led recipes</span>
              <span className="rounded-full border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3 py-1.5">Smart reminders</span>
              <span className="rounded-full border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3 py-1.5">Pantry visibility</span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {features.slice(1).map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-[1.5rem] border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[var(--shelf-dark)]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--shelf-muted)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/get-started"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--shelf-forest)] px-7 py-3.5 font-semibold text-white transition hover:opacity-90"
          >
            Start Free for Consumers
          </Link>
        </div>
      </div>
    </section>
  );
}
