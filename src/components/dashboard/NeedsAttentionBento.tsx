"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Flame,
  ArrowRight,
  Check,
  Trash2,
  Utensils,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";
import { getDaysUntilExpiry, formatExpiry } from "@/lib/format-expiry";
import { bulkDeleteAction } from "@/lib/actions/inventory";
import { consumeIngredientsAction } from "@/lib/actions/recipes";
import { useRouter } from "next/navigation";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface NeedsAttentionBentoProps {
  inventory: InventoryItem[];
  isBusiness?: boolean;
}

export default function NeedsAttentionBento({
  inventory,
  isBusiness = false,
}: NeedsAttentionBentoProps) {
  const router = useRouter();
  const [actionPendingId, setActionPendingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"use" | "discard" | null>(null);

  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  // Filter items needing attention: Expired, Expiring (<= 3 days), or Low Stock
  const urgentItems = inventory
    .map((item) => {
      const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
      const days = getDaysUntilExpiry(item.expiryDate);
      return { ...item, status, days };
    })
    .filter(
      (item) =>
        item.status === "Expired" ||
        item.status === "Expiring" ||
        item.status === "Low Stock" ||
        item.days <= 3
    )
    .sort((a, b) => {
      // Prioritize expired items first, then closest days
      if (a.status === "Expired" && b.status !== "Expired") return -1;
      if (b.status === "Expired" && a.status !== "Expired") return 1;
      return a.days - b.days;
    });

  const displayItems = urgentItems.slice(0, 5);
  const totalUrgent = urgentItems.length;

  async function handleQuickUse(item: InventoryItem) {
    setActionPendingId(item.id);
    setActionType("use");
    try {
      await consumeIngredientsAction([
        {
          itemId: item.id,
          quantityUsed: item.quantity,
        },
      ]);
      router.refresh();
    } catch (err) {
      console.error("Quick use failed:", err);
    } finally {
      setActionPendingId(null);
      setActionType(null);
    }
  }

  async function handleQuickDiscard(item: InventoryItem) {
    setActionPendingId(item.id);
    setActionType("discard");
    try {
      await bulkDeleteAction([item.id]);
      router.refresh();
    } catch (err) {
      console.error("Discard failed:", err);
    } finally {
      setActionPendingId(null);
      setActionType(null);
    }
  }

  return (
    <section
      aria-labelledby="needs-attention-title"
      className="sl-editorial-card flex flex-col justify-between p-5 sm:p-6"
    >
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[var(--app-border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent-terracotta)]/10 text-[var(--app-accent-terracotta)]">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="needs-attention-title"
                  className="text-base font-bold tracking-tight text-[var(--app-text-display)]"
                >
                  Needs Immediate Attention
                </h2>
                {totalUrgent > 0 && (
                  <span className="inline-flex items-center rounded-full bg-[var(--app-accent-terracotta)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--app-accent-terracotta)]">
                    {totalUrgent} item{totalUrgent === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--app-text-muted)]">
                {isBusiness
                  ? "Items approaching shelf-life threshold requiring FIFO priority dispatch."
                  : "Items expiring soon or requiring immediate consumption."}
              </p>
            </div>
          </div>

          <Link
            href={`${prefix}/alerts`}
            className="sl-focus-ring hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[var(--app-accent-emerald)] hover:underline"
          >
            <span>All Alerts</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Urgent Items List */}
        <div className="mt-4 divide-y divide-[var(--app-border-subtle)]">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-accent-emerald)]/10 text-[var(--app-accent-emerald)]">
                <Check size={22} strokeWidth={2.5} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-[var(--app-text-display)]">
                Pantry is in Optimal Health
              </h3>
              <p className="mt-1 max-w-sm text-xs text-[var(--app-text-muted)]">
                No items are currently expired or within critical expiration window.
              </p>
            </div>
          ) : (
            displayItems.map((item, index) => {
              const isExpired = item.status === "Expired" || item.days < 0;
              const isUrgent = item.days <= 1;
              const isPending = actionPendingId === item.id;

              // Status badge styling
              const badgeClass = isExpired
                ? "bg-[var(--app-accent-terracotta)]/15 text-[var(--app-accent-terracotta)] border-[var(--app-accent-terracotta)]/30"
                : isUrgent
                ? "bg-[var(--app-accent-amber)]/15 text-[var(--app-accent-amber)] border-[var(--app-accent-amber)]/30"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 transition-colors hover:bg-[var(--app-surface-base)]/40 rounded-lg px-2 -mx-2"
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] text-xs font-bold text-[var(--app-text-muted)]">
                      {isBusiness ? (
                        <span className="text-[10px] font-mono text-[var(--app-accent-amber)]">
                          #{index + 1}
                        </span>
                      ) : (
                        <span>{item.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--app-text-display)]">
                          {item.name}
                        </p>
                        {isBusiness && index === 0 && (
                          <span className="hidden sm:inline-flex items-center gap-1 rounded border border-[var(--app-accent-amber)]/30 bg-[var(--app-accent-amber)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--app-accent-amber)]">
                            <Flame size={10} /> FIFO #1
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span className="sl-tabular-num font-medium">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Expiry badge & Quick actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${badgeClass}`}
                    >
                      <Clock size={12} />
                      <span>{formatExpiry(item.expiryDate)}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Quick Use */}
                      <button
                        type="button"
                        onClick={() => handleQuickUse(item)}
                        disabled={isPending}
                        title="Mark as consumed"
                        aria-label={`Mark ${item.name} as consumed`}
                        className="sl-focus-ring flex h-8 items-center gap-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2.5 text-xs font-medium text-[var(--app-accent-emerald)] hover:bg-[var(--app-accent-emerald)]/10 transition disabled:opacity-50"
                      >
                        {isPending && actionType === "use" ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Utensils size={13} />
                        )}
                        <span className="hidden sm:inline">Use</span>
                      </button>

                      {/* Discard */}
                      <button
                        type="button"
                        onClick={() => handleQuickDiscard(item)}
                        disabled={isPending}
                        title="Discard and log waste"
                        aria-label={`Discard ${item.name}`}
                        className="sl-focus-ring flex h-8 items-center gap-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2.5 text-xs font-medium text-[var(--app-accent-terracotta)] hover:bg-[var(--app-accent-terracotta)]/10 transition disabled:opacity-50"
                      >
                        {isPending && actionType === "discard" ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                        <span className="hidden sm:inline">Discard</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer link */}
      {totalUrgent > 5 && (
        <div className="mt-4 border-t border-[var(--app-border-subtle)] pt-3 text-right">
          <Link
            href={`${prefix}/alerts`}
            className="text-xs font-semibold text-[var(--app-accent-emerald)] hover:underline"
          >
            View all {totalUrgent} urgent items →
          </Link>
        </div>
      )}
    </section>
  );
}
