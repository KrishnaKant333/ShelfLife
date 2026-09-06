import { Package } from "lucide-react";

import { getInventoryStatus } from "@/lib/inventory-status";
import type { InventoryItem } from "@/lib/inventory";

interface InventoryOverviewProps {
  inventory: InventoryItem[];
}

export default function InventoryOverview({
  inventory,
}: InventoryOverviewProps) {
  return (
    <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--shelf-dark)]">
            Inventory Overview
          </h2>

          <p className="mt-1 text-sm text-[var(--shelf-muted)]">
            Current products being tracked.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
          <Package size={18} />
        </div>
      </div>

      <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1 md:mt-6 md:space-y-3 md:pr-2">
        {inventory.map((item) => {
          const status = getInventoryStatus(
            item.quantity,
            item.expiryDate,
            item.unit
          );

          const statusStyles = {
            Expired:
              "bg-[var(--shelf-terracotta)]/10 text-[var(--shelf-terracotta)]",
            Fresh:
              "bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]",
            Expiring:
              "bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)]",
            "Low Stock":
              "bg-[var(--shelf-terracotta)]/10 text-[var(--shelf-terracotta)]",
            "Not trackable":
              "bg-[var(--shelf-cream)] text-[var(--shelf-muted)]",
          };

          return (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-xl bg-[var(--shelf-cream)] px-3 py-2.5 md:gap-4 md:px-4 md:py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--shelf-dark)]">
                  {item.name}
                </p>

                <p className="mt-1 text-xs text-[var(--shelf-muted)]">
                  {item.category} · {item.quantity} units
                </p>
              </div>

              <span
                className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[status]}`}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}