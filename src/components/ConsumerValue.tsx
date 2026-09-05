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
    <section id="consumer" className="border-b border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="sl-eyebrow">
              For Your Kitchen
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold text-[var(--sl-color-text)] md:text-5xl">
              Food inventory for everyday life
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-[var(--sl-color-text-muted)]">
            Know what&apos;s in your fridge, eat what you have, and waste less without overthinking it.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[var(--sl-radius-xl)] border border-[var(--sl-color-border)] bg-[var(--sl-color-canvas)] p-8 md:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)]">
              <Utensils className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--sl-color-action)]">
              Smart pantry management
            </p>
            <h3 className="mt-3 max-w-xl text-3xl font-semibold text-[var(--sl-color-text)] md:text-4xl">
              AI recipe suggestions built around what you already have
            </h3>
            <p className="mt-4 max-w-lg text-base leading-7 text-[var(--sl-color-text-muted)]">
              Get personalized ideas based on what&apos;s expiring soon, reduce duplicate purchases, and turn your inventory into useful meals instead of waste.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-[var(--sl-color-text)]">
              <span className="rounded-full border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-3 py-1.5">Expiry-led recipes</span>
              <span className="rounded-full border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-3 py-1.5">Smart reminders</span>
              <span className="rounded-full border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-3 py-1.5">Pantry visibility</span>
            </div>
          </div>

          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-1">
            {features.slice(1).map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="min-w-[82vw] snap-start rounded-[var(--sl-radius-lg)] border border-[var(--sl-color-border)] bg-[var(--sl-color-canvas)] p-6 transition hover:-translate-y-1 hover:shadow-[var(--sl-shadow-md)] sm:min-w-0"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--sl-color-text)]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--sl-color-text-muted)]">
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
            className="sl-focus-ring inline-flex min-h-12 items-center gap-2 rounded-[var(--sl-radius-pill)] bg-[var(--sl-color-action)] px-7 py-3.5 font-semibold text-[var(--sl-color-on-action)] transition hover:bg-[var(--sl-color-action-hover)]"
          >
            Start Free for Consumers
          </Link>
        </div>
      </div>
    </section>
  );
}
