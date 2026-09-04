"use client";

import { AlertTriangle, Package, CheckCircle2 } from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";
import { formatExpiry } from "@/lib/format-expiry";
import Link from "next/link";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface AlertsViewProps {
  inventory: InventoryItem[];
  isBusiness?: boolean;
}

export default function AlertsView({ inventory, isBusiness = false }: AlertsViewProps) {
  const alerts = inventory.filter((item) => {
    const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
    return status === "Expired" || status === "Expiring" || status === "Low Stock";
  });

  const dashboardUrl = isBusiness ? "/business/dashboard" : "/dashboard";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--shelf-amber)]">
          Needs Attention
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--shelf-dark)]">
          System Alerts
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Products that are expiring soon or running low in quantity.
        </p>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[var(--shelf-dark)]">
              You&apos;re all clear!
            </h3>
            <p className="mt-2 text-sm text-[var(--shelf-muted)]">
              No products currently need attention. Your inventory looks healthy.
            </p>
            <div className="mt-6">
              <Link
                href={`${dashboardUrl}/inventory`}
                className="rounded-xl bg-[var(--shelf-forest)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                View Inventory
              </Link>
            </div>
          </div>
        ) : (
          alerts.map((item) => {
            const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
            const isLowStock = status === "Low Stock";
            const isExpired = status === "Expired";

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-sm hover:border-[var(--shelf-sage)] transition duration-200"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    isExpired || isLowStock
                      ? "bg-[var(--shelf-terracotta)]/10 text-[var(--shelf-terracotta)]"
                      : "bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)]"
                  }`}
                >
                  {isExpired || isLowStock ? <AlertTriangle size={22} /> : <AlertTriangle size={22} />}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-[var(--shelf-dark)] truncate">
                    {item.name}
                  </h4>
                  <p className="mt-1 text-sm text-[var(--shelf-muted)]">
                    {isExpired
                      ? "Expired (immediate action required)"
                      : isLowStock
                      ? `${item.quantity} ${item.unit} remaining (Low Stock threshold reached)`
                      : `Expires ${formatExpiry(item.expiryDate)}`}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                      isExpired || isLowStock
                        ? "bg-[var(--shelf-terracotta)]/10 text-[var(--shelf-terracotta)] border border-[var(--shelf-terracotta)]/20"
                        : "bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)] border border-[var(--shelf-amber)]/20"
                    }`}
                  >
                    {status}
                  </span>
                  <Link
                    href={`${dashboardUrl}/inventory/${item.id}/edit`}
                    className="text-xs font-semibold text-[var(--shelf-forest)] hover:underline"
                  >
                    Resolve
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
