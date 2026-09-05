import Link from "next/link";
import {
  Package,
  TrendingUp,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

export default function BusinessValue() {
  const features = [
    {
      icon: Package,
      title: "FIFO Prioritization",
      description:
        "Automatically prioritize stock by expiry date. First in, first out — every time.",
    },
    {
      icon: TrendingUp,
      title: "Inventory Strategy",
      description:
        "Get AI-powered insights on stock levels, expiry exposure, and restocking needs.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Track consumption patterns, waste trends, and make data-driven decisions.",
    },
    {
      icon: AlertTriangle,
      title: "Waste Management",
      description:
        "Monitor expiry exposure and get alerts before stock becomes unsaleable.",
    },
  ];

  return (
    <section id="business" className="sl-scroll-reveal border-b border-[var(--sl-color-border)] bg-[var(--sl-color-canvas)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="sl-enter mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="sl-eyebrow">
              For Food Businesses
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold text-[var(--sl-color-text)] md:text-5xl">
              Turn inventory data into smarter decisions
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-[var(--sl-color-text-muted)]">
            Reduce waste, optimize stock, and improve profitability with clear operational visibility.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="sl-enter sl-enter-delay-1 rounded-[var(--sl-radius-xl)] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] p-8 md:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--sl-color-action)]">
              Inventory strategy
            </p>
            <h3 className="mt-3 max-w-xl text-3xl font-semibold text-[var(--sl-color-text)] md:text-4xl">
              Prioritize stock by expiry, then act before stock becomes waste
            </h3>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--sl-color-text-muted)]">
              ShelfLife gives operations teams a structured view of what should move first, what needs attention, and where waste risk is creeping in.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--sl-color-action)]">Priority</p>
                <p className="mt-2 text-base font-semibold text-[var(--sl-color-text)]">FIFO across inventory</p>
              </div>
              <div className="rounded-2xl border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--sl-color-action)]">Action</p>
                <p className="mt-2 text-base font-semibold text-[var(--sl-color-text)]">Real-time expiry alerts</p>
              </div>
            </div>
          </div>

          <div className="sl-enter sl-enter-delay-2 -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-1">
            {features.filter((feature) => feature.title !== "Inventory Strategy").map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="min-w-[82vw] snap-start rounded-[var(--sl-radius-lg)] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] p-6 transition hover:-translate-y-1 hover:shadow-[var(--sl-shadow-md)] sm:min-w-0"
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
            Start Free for Businesses
          </Link>
        </div>
      </div>
    </section>
  );
}
