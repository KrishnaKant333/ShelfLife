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
    <section id="business" className="px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--shelf-forest)]">
              For Food Businesses
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--shelf-dark)]">
              Turn inventory data into smarter decisions
            </h2>
          </div>

          <p className="max-w-md text-base leading-7 text-[var(--shelf-muted)]">
            Reduce waste, optimize stock, and improve profitability with clear operational visibility.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-8 md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--shelf-forest)]">
              Inventory strategy
            </p>
            <h3 className="mt-3 text-3xl font-bold text-[var(--shelf-dark)]">
              Prioritize stock by expiry, then act before stock becomes waste
            </h3>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--shelf-muted)]">
              ShelfLife gives operations teams a structured view of what should move first, what needs attention, and where waste risk is creeping in.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--shelf-forest)]">Priority</p>
                <p className="mt-2 text-base font-semibold text-[var(--shelf-dark)]">FIFO across inventory</p>
              </div>
              <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--shelf-forest)]">Action</p>
                <p className="mt-2 text-base font-semibold text-[var(--shelf-dark)]">Real-time expiry alerts</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {features.filter((feature) => feature.title !== "Inventory Strategy").map((feature) => {
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
            Start Free for Businesses
          </Link>
        </div>
      </div>
    </section>
  );
}
