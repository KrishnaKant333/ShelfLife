"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Trash2, Utensils, RefreshCw } from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";
import { formatExpiry } from "@/lib/format-expiry";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { discardExpiredItemsAction } from "@/lib/actions/inventory";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

type AlertObject = {
  item: InventoryItem;
  status: "Expired" | "Expiring" | "Low Stock";
  priority: string;
  title: string;
  description: string;
  badgeClass: string;
  iconClass: string;
  actionType: "discard" | "recipe" | "restock";
};

interface AlertsViewProps {
  inventory: InventoryItem[];
  isBusiness?: boolean;
}

export default function AlertsView({ inventory, isBusiness = false }: AlertsViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"All" | "Expired" | "Expiring" | "Low Stock">("All");
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const dashboardUrl = isBusiness ? "/business/dashboard" : "/dashboard";

  const allAlerts: AlertObject[] = inventory.flatMap((item): AlertObject[] => {
    const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
    if (status === "Expired") {
      return [{
        item,
        status: "Expired",
        priority: "CRITICAL",
        title: `${item.name} is Expired`,
        description: `Expired on ${formatExpiry(item.expiryDate)}. Discard immediately to keep your shelf safe.`,
        badgeClass: "bg-[var(--shelf-terracotta)]/15 text-[var(--shelf-terracotta)] border-[var(--shelf-terracotta)]/30",
        iconClass: "bg-[var(--shelf-terracotta)]/10 text-[var(--shelf-terracotta)]",
        actionType: "discard",
      }];
    }
    if (status === "Expiring") {
      return [{
        item,
        status: "Expiring",
        priority: "URGENT",
        title: `${item.name} Expires Soon`,
        description: `Expires on ${formatExpiry(item.expiryDate)}. Plan a meal or consume soon to prevent waste.`,
        badgeClass: "bg-[var(--shelf-amber)]/15 text-[var(--shelf-amber)] border-[var(--shelf-amber)]/30",
        iconClass: "bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)]",
        actionType: "recipe",
      }];
    }
    if (status === "Low Stock") {
      return [{
        item,
        status: "Low Stock",
        priority: "WARNING",
        title: `${item.name} Low Stock Alert`,
        description: `Only ${item.quantity} ${item.unit} remaining on shelf. Consider restocking soon.`,
        badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        actionType: "restock",
      }];
    }
    return [];
  });

  const filteredAlerts = allAlerts.filter(a => activeTab === "All" || a.status === activeTab);

  const handleDiscardAllExpired = async () => {
    setIsDiscarding(true);
    setActionFeedback(null);
    try {
      const res = await discardExpiredItemsAction();
      if (res.success) {
        setActionFeedback(res.count ? `${res.count} expired item(s) discarded successfully.` : "No expired items remaining.");
        router.refresh();
      } else {
        setActionFeedback(res.error || "Failed to discard expired items.");
      }
    } catch {
      setActionFeedback("Error occurred while discarding expired items.");
    } finally {
      setIsDiscarding(false);
    }
  };

  const expiredCount = allAlerts.filter(a => a.status === "Expired").length;
  const expiringCount = allAlerts.filter(a => a.status === "Expiring").length;
  const lowStockCount = allAlerts.filter(a => a.status === "Low Stock").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-[var(--sl-color-surface)] via-[var(--sl-color-surface)] to-[var(--shelf-terracotta)]/5 p-6 rounded-2xl border border-[var(--shelf-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-[var(--shelf-terracotta)] animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--shelf-terracotta)]">
              Urgent Inventory Attention
            </p>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
            Actionable System Alerts
          </h1>
          <p className="mt-1 text-sm text-[var(--shelf-muted)]">
            Immediate inventory risks requiring user intervention (Expiring, Expired, Low Stock).
          </p>
        </div>

        {expiredCount > 0 && (
          <button
            type="button"
            onClick={handleDiscardAllExpired}
            disabled={isDiscarding}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--shelf-terracotta)] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:opacity-90 disabled:opacity-50 shrink-0"
          >
            <Trash2 size={16} />
            {isDiscarding ? "Discarding..." : `Discard Expired (${expiredCount})`}
          </button>
        )}
      </div>

      {actionFeedback && (
        <div className="rounded-xl border border-[var(--sl-color-action)]/30 bg-[var(--sl-color-action-soft)] p-3 text-xs font-semibold text-[var(--sl-color-action)] flex justify-between items-center">
          <span>{actionFeedback}</span>
          <button type="button" onClick={() => setActionFeedback(null)} className="hover:underline">Dismiss</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[var(--shelf-surface)] border border-[var(--shelf-border)] p-1.5 rounded-xl shadow-xs">
        {(["All", "Expired", "Expiring", "Low Stock"] as const).map((tab) => {
          const count = tab === "All" ? allAlerts.length : tab === "Expired" ? expiredCount : tab === "Expiring" ? expiringCount : lowStockCount;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === tab
                  ? "bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)] shadow-xs"
                  : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
              }`}
            >
              <span>{tab} Alerts</span>
              {count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === tab ? "bg-[var(--sl-color-action)] text-white" : "bg-[var(--shelf-cream)] text-[var(--shelf-muted)]"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[var(--shelf-dark)]">
              No Actionable Inventory Alerts
            </h3>
            <p className="mt-2 text-sm text-[var(--shelf-muted)] max-w-md mx-auto">
              Your inventory is in great shape! All products are fresh and well-stocked.
            </p>
            <div className="mt-6">
              <Link
                href={`${dashboardUrl}/inventory`}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
              >
                View Inventory
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          filteredAlerts.map(({ item, priority, title, description, badgeClass, iconClass, actionType }) => (
            <div
              key={`${item.id}-${priority}`}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs transition hover:border-[var(--shelf-sage)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                  <AlertTriangle size={22} />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-[var(--shelf-dark)] text-base truncate">
                      {title}
                    </h4>
                    <span className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                      {priority}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--shelf-muted)]">
                    {description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-[var(--shelf-muted)] pt-1">
                    <span>Category: <strong className="text-[var(--shelf-dark)]">{item.category}</strong></span>
                    <span>·</span>
                    <span>Quantity: <strong className="text-[var(--shelf-dark)]">{item.quantity} {item.unit}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
                {actionType === "discard" && (
                  <button
                    type="button"
                    onClick={handleDiscardAllExpired}
                    disabled={isDiscarding}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-[var(--shelf-terracotta)] px-3.5 py-2 text-xs font-bold text-white transition hover:opacity-90"
                  >
                    <Trash2 size={14} />
                    Discard
                  </button>
                )}
                {actionType === "recipe" && (
                  <Link
                    href={`${dashboardUrl}/recipes`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-3.5 py-2 text-xs font-bold text-white transition hover:opacity-90 shadow-xs"
                  >
                    <Utensils size={14} />
                    Cook Recipe
                  </Link>
                )}
                {actionType === "restock" && (
                  <Link
                    href={`${dashboardUrl}/inventory/${item.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--sl-color-action-soft)] border border-[var(--sl-color-action)]/30 px-3.5 py-2 text-xs font-bold text-[var(--sl-color-action)] transition hover:bg-[var(--sl-color-action-soft)]/80"
                  >
                    <RefreshCw size={14} />
                    Restock
                  </Link>
                )}
                <Link
                  href={`${dashboardUrl}/inventory/${item.id}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)] transition"
                >
                  Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
