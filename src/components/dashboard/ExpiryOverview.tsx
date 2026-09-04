import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getInventoryStatus } from "@/lib/inventory-status";
import type { InventoryItem } from "@/lib/inventory";


interface ExpiryOverviewProps {
  inventory: InventoryItem[];
}


export default function ExpiryOverview({
  inventory,
}: ExpiryOverviewProps) {
  const expiringItems = inventory.filter(
    (item) => getInventoryStatus(
      item.quantity,
      item.expiryDate,
      item.unit
    ) === "Expiring"
  );

  return (
    <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--shelf-dark)]">
            Expiring Soon
          </h2>

          <p className="mt-1 text-sm text-[var(--shelf-muted)]">
            Products that need your attention.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)]">
          <AlertTriangle size={18} />
        </div>
      </div>

      <div className="mt-6 divide-y divide-[var(--shelf-border)]">
        {expiringItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--shelf-dark)]">
                {item.name}
              </p>

              <p className="mt-1 text-xs text-[var(--shelf-muted)]">
                {item.category} · {item.quantity} remaining
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-[var(--shelf-amber)]/10 px-3 py-1 text-xs font-medium text-[var(--shelf-amber)]">
              {new Date(item.expiryDate).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/inventory"
        className="mt-6 flex items-center gap-2 text-sm font-medium text-[var(--shelf-forest)] transition-all hover:gap-3"
      >
        View inventory
        <ArrowRight size={15} />
      </Link>
    </section>
  );
}