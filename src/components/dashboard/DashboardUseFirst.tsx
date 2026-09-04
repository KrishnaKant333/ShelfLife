"use client";

import { ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import { getDaysUntilExpiry, formatExpiry } from "@/lib/format-expiry";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface DashboardUseFirstProps {
  inventory: InventoryItem[];
  isBusiness?: boolean;
}

export default function DashboardUseFirst({ inventory, isBusiness = false }: DashboardUseFirstProps) {
  // Sort items strictly by closest expiry
  const sorted = [...inventory]
    .map(item => ({
      ...item,
      days: getDaysUntilExpiry(item.expiryDate)
    }))
    .sort((a, b) => a.days - b.days);

  const topItems = sorted.slice(0, 4);
  const redirectUrl = isBusiness ? "/business/dashboard/waste" : "/dashboard/waste";

  return (
    <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider flex items-center gap-1.5">
            <Flame size={16} className="text-[var(--shelf-terracotta)] animate-pulse" />
            Use First Priorities
          </h3>
          <span className="text-[10px] font-bold text-[var(--shelf-muted)] uppercase">
            FIFO Order
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--shelf-muted)]">
          Consume these items next to reduce wastage.
        </p>

        <div className="mt-4 space-y-2">
          {topItems.length === 0 ? (
            <p className="text-xs text-[var(--shelf-muted)] text-center py-6">
              No expiring items to display.
            </p>
          ) : (
            topItems.map((item, idx) => {
              let textStyle = "text-[var(--shelf-dark)]";
              let badgeStyle = "bg-green-50 text-green-700 border-green-200";

              if (item.days < 0) {
                badgeStyle = "bg-red-50 text-[var(--shelf-terracotta)] border-red-200";
              } else if (item.days <= 3) {
                badgeStyle = "bg-amber-50 text-[var(--shelf-amber)] border-amber-200";
              }

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs p-2 rounded-lg border border-[var(--shelf-border)]/40 bg-[var(--shelf-surface)]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-[var(--shelf-muted)]">{idx + 1}.</span>
                    <span className="font-bold text-[var(--shelf-dark)] truncate">{item.name}</span>
                    <span className="text-[var(--shelf-muted)] shrink-0">({item.quantity} {item.unit})</span>
                  </div>
                  <span className={`rounded-md border px-2 py-0.5 font-semibold text-[10px] ${badgeStyle}`}>
                    {formatExpiry(item.expiryDate)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {inventory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--shelf-border)]/50 flex justify-end">
          <Link
            href={redirectUrl}
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--shelf-forest)] hover:underline"
          >
            Manage Waste <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </section>
  );
}
