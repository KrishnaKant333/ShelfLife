import { AlertTriangle, Package } from "lucide-react";

import { getInventory } from "@/lib/inventory";
import { getInventoryStatus } from "@/lib/inventory-status";
import { formatExpiry } from "@/lib/format-expiry";

export default async function AlertsPage() {
  const inventory = await getInventory();

  const alerts = inventory.filter((item) => {
    const status = getInventoryStatus(
      item.quantity,
      item.expiryDate
    );

    return status === "Expiring" || status === "Low Stock";
  });

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-5xl">

        <p className="text-sm font-medium text-[var(--shelf-amber)]">
          Alerts
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-[var(--shelf-dark)]">
          Needs Attention
        </h1>

        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Products that may require action.
        </p>

        <div className="mt-8 space-y-3">
          {alerts.length === 0 ? (
            <div className="rounded-2xl bg-[var(--shelf-surface)] p-8 text-center shadow-lg">
              <p className="font-medium text-[var(--shelf-dark)]">
                Everything looks good!
              </p>

              <p className="mt-2 text-sm text-[var(--shelf-muted)]">
                You currently have no products that need attention.
              </p>
            </div>
          ) : (
            alerts.map((item) => {
              const status = getInventoryStatus(
                item.quantity,
                item.expiryDate
              );

              const isLowStock = status === "Low Stock";

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl bg-[var(--shelf-surface)] p-5 shadow-lg"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isLowStock
                        ? "bg-[var(--shelf-terracotta)]/10 text-[var(--shelf-terracotta)]"
                        : "bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)]"
                    }`}
                  >
                    {isLowStock ? (
                      <Package size={19} />
                    ) : (
                      <AlertTriangle size={19} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--shelf-dark)]">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm text-[var(--shelf-muted)]">
                      {isLowStock
                        ? `${item.quantity} ${item.unit} remaining`
                        : `Expires ${formatExpiry(item.expiryDate)}`}
                    </p>
                  </div>

                  <span className="rounded-full bg-[var(--shelf-cream)] px-3 py-1 text-xs text-[var(--shelf-dark)]">
                    {status}
                  </span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </main>
  );
}