import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Package,
  Search,
} from "lucide-react";
import { inventory } from "@/data/inventory";

const expiringItems = inventory.filter(
  (item) => item.status === "Expiring"
);

const stats = [
  {
    label: "Total Items",
    value: "128",
    icon: Package,
  },
  {
    label: "Expiring Soon",
    value: String(expiringItems.length),
    icon: AlertTriangle,
  },
  {
    label: "Waste Reduced",
    value: "18%",
    icon: BarChart3,
  },
];

export default function ProductPreview() {
  return (
    <section id="product" className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--shelf-green)]">
            Inside ShelfLife
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--shelf-dark)] md:text-5xl">
            Your inventory, at a glance.
          </h2>

          <p className="mt-5 text-lg leading-8 text-[var(--shelf-muted)]">
            See what&apos;s in stock, what needs attention and where your
            inventory can become more efficient.
          </p>
        </div>

        {/* Dashboard */}
        <div className="mx-auto mt-16 max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--shelf-border)]  shadow-2xl">

          {/* Browser header */}
          <div className="flex items-center justify-between border-b border-[var(--shelf-border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            </div>

            <div className="hidden text-xs text-[var(--shelf-muted)] sm:block">
              app.shelflife
            </div>

            <div className="w-12" />
          </div>

          {/* Dashboard */}
          <div className="grid md:grid-cols-[190px_1fr]">

            {/* Sidebar */}
            <aside className="hidden border-r border-[var(--shelf-border)] bg-[var(--shelf-light)] p-5 md:block">

              <div className="text-xl font-semibold text-[var(--shelf-dark)]">
                shelflife
              </div>

              <nav className="mt-10 space-y-2">
                {[
                  "Overview",
                  "Inventory",
                  "Expiring Soon",
                  "Analytics",
                  "Pantry",
                ].map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-xl px-3 py-2.5 text-sm ${
                      index === 0
                        ? "bg-white font-medium text-[var(--shelf-dark)] shadow-sm"
                        : "text-[var(--shelf-muted)]"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </nav>
            </aside>

            {/* Main */}
            <div className="p-6 md:p-8">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-[var(--shelf-muted)]">
                    Overview
                  </p>

                  <h3 className="mt-1 text-2xl font-semibold text-[var(--shelf-dark)]">
                    Good morning.
                  </h3>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-[var(--shelf-border)] px-3 py-2">
                  <Search size={16} className="text-[var(--shelf-muted)]" />

                  <span className="text-sm text-[var(--shelf-muted)]">
                    Search inventory
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[var(--shelf-border)] p-5 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--shelf-muted)]">
                          {stat.label}
                        </span>

                        <Icon
                          size={17}
                          className="text-[var(--shelf-green)]"
                        />
                      </div>

                      <p className="mt-5 text-3xl font-semibold text-[var(--shelf-dark)]">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Expiring inventory */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[var(--shelf-dark)]">
                    Expiring soon
                  </h4>

                  <span className="text-xs text-[var(--shelf-green)]">
                    View all
                  </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--shelf-border)]">
                  {inventory.slice(0, 3).map((item, index) => (
                    <div
                      key={item.name}
                      className={`flex items-center justify-between gap-4 px-5 py-4 ${
                        index !== 2
                          ? "border-b border-[var(--shelf-border)]"
                          : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--shelf-dark)]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-[var(--shelf-muted)]">
                          {item.category} · Qty {item.quantity}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          item.status === "Expiring"
                            ? "bg-red-50 text-red-600"
                            : "bg-[var(--shelf-light)] text-[var(--shelf-green)]"
                        }`}
                      >
                        {item.expiry}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
<div className="mt-8 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
  <p className="text-sm text-[var(--shelf-muted)]">
    Want to see the full experience?
  </p>

  <Link
    href="/dashboard"
    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--shelf-green)] transition hover:gap-3"
  >
    Open the dashboard
    <ArrowRight size={15} />
  </Link>
</div>
      </div>
    </section>
  );
}