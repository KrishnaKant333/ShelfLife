"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Utensils,
  Sparkles,
  Clock,
  TrendingDown,
  X,
  Filter,
} from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";
import { formatExpiry } from "@/lib/format-expiry";
import { isIntegerUnit } from "@/lib/normalization";
import { consumeIngredientsAction } from "@/lib/actions/recipes";
import { deleteInventoryItem, discardExpiredItemsAction } from "@/lib/actions/inventory";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import AlertActionCard, { AlertCardData, AlertSeverity } from "@/components/alerts/AlertActionCard";

export interface RawInventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
}

interface AlertsViewProps {
  inventory: RawInventoryItem[];
  isBusiness?: boolean;
}

function AlertsViewInner({ inventory, isBusiness = false }: AlertsViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"ALL" | AlertSeverity>("ALL");
  const [consumeItem, setConsumeItem] = useState<AlertCardData | null>(null);
  const [useQuantity, setUseQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [singleDiscardItem, setSingleDiscardItem] = useState<AlertCardData | null>(null);

  const currentDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Derive alert cards strictly from verified status logic
  const allAlerts = useMemo(() => {
    const alerts: AlertCardData[] = [];
    inventory.forEach((item) => {
      const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
      if (status === "Expired") {
        alerts.push({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expiryDate,
          status: "Expired",
          urgencyText: `Expired ${formatExpiry(item.expiryDate)}`,
        });
      } else if (status === "Expiring") {
        alerts.push({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expiryDate,
          status: "Expiring",
          urgencyText: `Expires in ${formatExpiry(item.expiryDate)}`,
        });
      } else if (status === "Low Stock") {
        alerts.push({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expiryDate,
          status: "Low Stock",
          urgencyText: "Depleted stock",
        });
      }
    });

    // Priority sort: Expired first, then Expiring, then Low Stock
    return alerts.sort((a, b) => {
      const rank = { Expired: 1, Expiring: 2, "Low Stock": 3 };
      return rank[a.status] - rank[b.status];
    });
  }, [inventory]);

  const expiredCount = allAlerts.filter((a) => a.status === "Expired").length;
  const expiringCount = allAlerts.filter((a) => a.status === "Expiring").length;
  const lowStockCount = allAlerts.filter((a) => a.status === "Low Stock").length;

  const filteredAlerts = useMemo(() => {
    if (activeTab === "ALL") return allAlerts;
    return allAlerts.filter((a) => a.status === activeTab);
  }, [allAlerts, activeTab]);

  // Handlers
  const handleOpenConsume = (item: AlertCardData) => {
    setConsumeItem(item);
    setUseQuantity(isIntegerUnit(item.unit) ? 1 : Math.min(item.quantity, 1));
  };

  const handleConfirmConsume = async () => {
    if (!consumeItem) return;
    setLoading(true);
    try {
      const res = await consumeIngredientsAction([
        { itemId: consumeItem.id, quantityUsed: useQuantity },
      ]);
      if (res.success) {
        showToast(`${consumeItem.name} logged as consumed.`, "success");
        setConsumeItem(null);
        router.refresh();
      } else {
        showToast(res.error || "Failed to update item.", "error");
      }
    } catch {
      showToast("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSingleDiscard = async () => {
    if (!singleDiscardItem) return;
    setLoading(true);
    try {
      await deleteInventoryItem(singleDiscardItem.id);
      showToast(`${singleDiscardItem.name} discarded and logged.`, "success");
      setSingleDiscardItem(null);
      router.refresh();
    } catch {
      showToast("Failed to discard product.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBulkDiscard = async () => {
    setLoading(true);
    try {
      const res = await discardExpiredItemsAction();
      if (res.success) {
        showToast(
          res.count && res.count > 0
            ? `Discarded ${res.count} expired item${res.count > 1 ? "s" : ""} and updated audit register.`
            : "No expired items to discard.",
          "success"
        );
        setConfirmBulkOpen(false);
        router.refresh();
      } else {
        showToast(res.error || "Failed to purge expired items.", "error");
      }
    } catch {
      showToast("Failed to purge expired items.", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs: Array<{ id: "ALL" | AlertSeverity; label: string; count: number }> = [
    { id: "ALL", label: "All Risks", count: allAlerts.length },
    { id: "Expired", label: "Critical / Expired", count: expiredCount },
    { id: "Expiring", label: "Impending Expiry", count: expiringCount },
    { id: "Low Stock", label: "Low Stock", count: lowStockCount },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* 1. Editorial Masthead identical to Analytics, Recipes, and Waste */}
      <header className="border-b border-[var(--shelf-border)]/60 pb-6 pt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--shelf-terracotta)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--shelf-terracotta)]">
                <AlertTriangle size={12} />
                Actionable Inventory Safeguards
              </span>
              <span className="text-xs text-[var(--shelf-muted)]">
                {isBusiness ? "Commercial Kitchen Pro" : "Household Pantry"} • {currentDate}
              </span>
            </div>

            <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-4xl">
              Urgent Inventory Alerts
            </h1>
            <p className="mt-1 text-sm text-[var(--shelf-muted)]">
              Real-time risk warnings requiring direct consumption, meal preparation, or food safety discard.
            </p>
          </div>

          {/* Bulk Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:self-end">
            {!isBusiness && expiringCount > 0 && (
              <Link
                href="/dashboard/recipes"
                className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--shelf-dark)] shadow-xs transition hover:bg-[var(--shelf-cream)]/40 cursor-pointer"
              >
                <Sparkles size={13} className="text-[var(--shelf-forest)]" />
                Cook With Expiring Items
              </Link>
            )}

            {expiredCount > 0 && (
              <button
                type="button"
                onClick={() => setConfirmBulkOpen(true)}
                className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl bg-[var(--shelf-terracotta)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 cursor-pointer"
              >
                <Trash2 size={13} />
                Discard All Expired ({expiredCount})
              </button>
            )}
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--shelf-border)]/50 bg-[var(--shelf-cream)]/30 px-3 py-1 text-xs font-medium text-[var(--shelf-dark)]">
            <span
              className={`h-2 w-2 rounded-full ${
                expiredCount > 0
                  ? "bg-[var(--shelf-terracotta)] animate-pulse"
                  : expiringCount > 0
                  ? "bg-[var(--shelf-amber)]"
                  : "bg-[var(--shelf-forest)]"
              }`}
            />
            <span>
              <strong>Safeguard Status:</strong> {allAlerts.length} Actionable Risk{allAlerts.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[var(--shelf-muted)]">•</span>
            <span>{expiredCount} expired</span>
            <span className="text-[var(--shelf-muted)]">•</span>
            <span>{expiringCount} impending</span>
            <span className="text-[var(--shelf-muted)]">•</span>
            <span>{lowStockCount} low stock</span>
          </div>
        </div>
      </header>

      {/* 2. Urgency Filter Navigation Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sl-focus-ring inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                active
                  ? "bg-[var(--shelf-forest)] text-white shadow-xs"
                  : "border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)]/40"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-[var(--shelf-cream)] text-[var(--shelf-dark)]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Alerts Card Feed */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="sl-editorial-card flex flex-col items-center justify-center p-12 text-center shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="mt-4 font-serif text-xl font-normal text-[var(--shelf-dark)]">
              Pristine Shelf Safeguard
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-[var(--shelf-muted)] sm:text-sm">
              Zero actionable risks detected in this filter. All inventory items are within safe freshness horizons and optimal replenishment levels.
            </p>
            <div className="mt-5">
              <Link
                href={isBusiness ? "/business/dashboard/inventory" : "/dashboard/inventory"}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] shadow-xs transition hover:bg-[var(--shelf-cream)]/40"
              >
                View Full Inventory Catalog →
              </Link>
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertActionCard
              key={alert.id}
              alert={alert}
              onConsume={handleOpenConsume}
              onDiscard={(item) => setSingleDiscardItem(item)}
              isBusiness={isBusiness}
            />
          ))
        )}
      </div>

      {/* Interactive Modal: Consume Item */}
      {consumeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="use-product-title"
            className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-2xl"
          >
            <div className="p-5 border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40">
              <h3 id="use-product-title" className="font-serif text-lg font-bold text-[var(--shelf-dark)]">
                Consume Product
              </h3>
              <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                Mark {consumeItem.name} as prepared or consumed.
              </p>
              <button
                onClick={() => setConsumeItem(null)}
                aria-label="Close dialog"
                className="absolute top-5 right-5 text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)] mb-2">
                  Quantity to Use ({consumeItem.unit})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step={isIntegerUnit(consumeItem.unit) ? "1" : "any"}
                    min={isIntegerUnit(consumeItem.unit) ? "1" : "0.01"}
                    max={consumeItem.quantity}
                    value={useQuantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setUseQuantity(Math.min(consumeItem.quantity, Math.max(0.01, val)));
                      }
                    }}
                    className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 p-2.5 text-center font-mono text-sm font-bold outline-none"
                  />
                  <span className="text-xs font-mono font-semibold text-[var(--shelf-dark)] shrink-0">
                    / {consumeItem.quantity} {consumeItem.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2.5 border-t border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 p-4 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConsumeItem(null)}
                className="sl-focus-ring rounded-xl border border-[var(--shelf-border)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] bg-[var(--shelf-surface)] hover:bg-[var(--shelf-cream)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConsume}
                disabled={loading}
                className="sl-focus-ring inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? "Updating..." : "Confirm Consumption"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Discard Confirmation Modal */}
      {singleDiscardItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="single-discard-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-2xl">
            <div className="p-6 border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-[var(--shelf-terracotta)]/15 p-2.5 text-[var(--shelf-terracotta)]">
                  <Trash2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 id="single-discard-title" className="font-serif text-lg font-bold text-[var(--shelf-dark)]">
                    Discard {singleDiscardItem.name}
                  </h3>
                  <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                    Remove {singleDiscardItem.quantity} {singleDiscardItem.unit} and register discard in audit log.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 text-xs text-[var(--shelf-muted)] leading-relaxed">
              This product will be purged from active inventory and archived as an avoidable discard event. Are you sure you want to proceed?
            </div>

            <div className="flex flex-col-reverse gap-2.5 border-t border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 p-4 sm:flex-row sm:justify-end">
              <button
                onClick={() => setSingleDiscardItem(null)}
                disabled={loading}
                className="sl-focus-ring rounded-xl border border-[var(--shelf-border)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] bg-[var(--shelf-surface)] hover:bg-[var(--shelf-cream)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSingleDiscard}
                disabled={loading}
                className="sl-focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--shelf-terracotta)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {loading ? "Discarding..." : "Confirm Discard"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Purge Expired Confirmation Modal */}
      {confirmBulkOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-discard-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-2xl">
            <div className="p-6 border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-[var(--shelf-terracotta)]/15 p-2.5 text-[var(--shelf-terracotta)]">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 id="bulk-discard-title" className="font-serif text-lg font-bold text-[var(--shelf-dark)]">
                    Discard All Expired Items
                  </h3>
                  <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                    Purge all {expiredCount} expired products from your shelf.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 text-xs text-[var(--shelf-muted)] leading-relaxed">
              All items currently past their expiration date will be permanently removed from inventory and registered in the loss audit log.
            </div>

            <div className="flex flex-col-reverse gap-2.5 border-t border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 p-4 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConfirmBulkOpen(false)}
                disabled={loading}
                className="sl-focus-ring rounded-xl border border-[var(--shelf-border)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] bg-[var(--shelf-surface)] hover:bg-[var(--shelf-cream)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDiscard}
                disabled={loading}
                className="sl-focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--shelf-terracotta)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {loading ? "Purging..." : `Purge ${expiredCount} Items`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AlertsView(props: AlertsViewProps) {
  return (
    <ToastProvider>
      <AlertsViewInner {...props} />
    </ToastProvider>
  );
}
