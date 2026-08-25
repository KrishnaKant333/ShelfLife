import { inventory } from "@/data/inventory";

export default function AnalyticsPage() {
  const total = inventory.length;

  const fresh = inventory.filter(
    (item) => item.status === "Fresh"
  ).length;

  const expiring = inventory.filter(
    (item) => item.status === "Expiring"
  ).length;

  const lowStock = inventory.filter(
    (item) => item.status === "Low Stock"
  ).length;

  const health = Math.round((fresh / total) * 100);

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl">

        <p className="text-sm font-medium text-[var(--shelf-blue)]">
          Analytics
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-[var(--shelf-dark)]">
          Inventory Health
        </h1>

        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          A quick look at the current state of your inventory.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl bg-[var(--shelf-surface)] p-6 shadow-xl">
            <p className="text-sm text-[var(--shelf-muted)]">
              Inventory Health
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-semibold text-[var(--shelf-dark)]">
                {health}%
              </span>

              <span className="mb-2 text-sm text-[var(--shelf-muted)]">
                fresh
              </span>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
              <div
                className="h-full rounded-full bg-[var(--shelf-forest)]"
                style={{ width: `${health}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--shelf-surface)] p-6 shadow-xl">
            <p className="text-sm text-[var(--shelf-muted)]">
              Status Breakdown
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--shelf-muted)]">
                  Fresh
                </span>

                <span className="font-medium text-[var(--shelf-forest)]">
                  {fresh}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[var(--shelf-muted)]">
                  Expiring
                </span>

                <span className="font-medium text-[var(--shelf-amber)]">
                  {expiring}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-[var(--shelf-muted)]">
                  Low Stock
                </span>

                <span className="font-medium text-[var(--shelf-terracotta)]">
                  {lowStock}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}