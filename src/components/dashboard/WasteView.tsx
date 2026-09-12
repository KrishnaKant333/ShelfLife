"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  Utensils,
  Sparkles,
  X,
} from "lucide-react";
import { getDaysUntilExpiry, formatExpiry } from "@/lib/format-expiry";
import { isIntegerUnit } from "@/lib/normalization";
import { consumeIngredientsAction } from "@/lib/actions/recipes";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import {
  RawInventoryItem,
  RawConsumptionRecord,
  RawActivityRecord,
  WasteTimeframeScope,
  computeWasteReport,
} from "@/lib/waste";
import WasteImpactHeader from "@/components/waste/WasteImpactHeader";
import LifecycleJourneyPipeline from "@/components/waste/LifecycleJourneyPipeline";
import WasteRootCauseAnalysis from "@/components/waste/WasteRootCauseAnalysis";
import AIPreventionAdvisory from "@/components/waste/AIPreventionAdvisory";
import DiscardLogTable from "@/components/waste/DiscardLogTable";

export interface WasteViewProps {
  inventory: RawInventoryItem[];
  consumptions?: RawConsumptionRecord[];
  activities?: RawActivityRecord[];
  isBusiness?: boolean;
}

function WasteViewInner({
  inventory,
  consumptions = [],
  activities = [],
  isBusiness = false,
}: WasteViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [timeframe, setTimeframe] = useState<WasteTimeframeScope>("30D");
  const [selectedItem, setSelectedItem] = useState<RawInventoryItem | null>(null);
  const [useQuantity, setUseQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Compute the comprehensive Stage G report dynamically based on active timeframe
  const report = useMemo(() => {
    return computeWasteReport(inventory, consumptions, activities, timeframe);
  }, [inventory, consumptions, activities, timeframe]);

  // Group items by urgency for FIFO and At-Risk actions
  const itemsWithDays = useMemo(() => {
    return inventory.map((item) => {
      const days = getDaysUntilExpiry(item.expiryDate);
      return { ...item, days };
    });
  }, [inventory]);

  const expiredItems = itemsWithDays.filter((x) => x.days < 0);
  const criticalItems = itemsWithDays.filter((x) => x.days >= 0 && x.days <= 3);
  const warningItems = itemsWithDays.filter((x) => x.days > 3 && x.days <= 7);
  const lowStockItems = itemsWithDays.filter((x) => x.quantity <= 2 && x.days > 7);

  // Sort strictly for "Use First" list
  const useFirstList = useMemo(() => {
    return [...itemsWithDays].sort((a, b) => a.days - b.days);
  }, [itemsWithDays]);

  const atRiskList = [
    ...expiredItems.map((x) => ({
      ...x,
      statusLabel: "Expired",
      statusColor:
        "text-[var(--shelf-terracotta)] bg-[var(--shelf-terracotta)]/10 border-[var(--shelf-terracotta)]/20",
    })),
    ...criticalItems.map((x) => ({
      ...x,
      statusLabel: `Expiring in ${formatExpiry(x.expiryDate)}`,
      statusColor:
        "text-[var(--shelf-amber)] bg-[var(--shelf-amber)]/10 border-[var(--shelf-amber)]/20",
    })),
    ...warningItems.map((x) => ({
      ...x,
      statusLabel: `Expires in ${formatExpiry(x.expiryDate)}`,
      statusColor:
        "text-[var(--shelf-blue)] bg-[var(--shelf-blue)]/10 border-[var(--shelf-blue)]/20",
    })),
    ...lowStockItems.map((x) => ({
      ...x,
      statusLabel: "Low Stock",
      statusColor:
        "text-[var(--shelf-muted)] bg-[var(--shelf-cream)] border-[var(--shelf-border)]",
    })),
  ];

  const handleOpenUseFirst = (item: RawInventoryItem) => {
    setSelectedItem(item);
    setUseQuantity(isIntegerUnit(item.unit) ? 1 : Math.min(item.quantity, 1));
  };

  const handleConfirmUse = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      const res = await consumeIngredientsAction([
        { itemId: selectedItem.id, quantityUsed: useQuantity },
      ]);
      if (res.success) {
        showToast(`${selectedItem.name} logged as consumed.`, "success");
        setSelectedItem(null);
        router.refresh();
      } else {
        showToast(res.error || "Failed to update item.", "error");
      }
    } catch {
      showToast("Failed to consume item.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeRedirect = () => {
    router.push("/dashboard/recipes");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
      {/* 1. Hero Impact & Preservation Header */}
      <WasteImpactHeader
        report={report}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        isBusiness={isBusiness}
      />

      {/* 2. Food Lifecycle Journey Pipeline */}
      <LifecycleJourneyPipeline lifecycle={report.lifecycle} />

      {/* 3. Root-Cause & Category Analysis */}
      <WasteRootCauseAnalysis
        categories={report.categories}
        reasons={report.reasons}
      />

      {/* 4. AI Prevention Advisory */}
      <AIPreventionAdvisory
        advisories={report.advisories}
        isBusiness={isBusiness}
      />

      {/* 5. FIFO Use-First Priority & Items at Risk Panel */}
      <section aria-labelledby="fifo-heading" className="sl-editorial-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--shelf-forest)] bg-[var(--shelf-cream)] border border-[var(--shelf-border)] px-2.5 py-0.5 rounded-md">
                <Flame size={12} /> FIFO Priority
              </span>
              <span className="text-xs text-[var(--shelf-muted)] font-mono">
                {itemsWithDays.length} items evaluated
              </span>
            </div>
            <h2 id="fifo-heading" className="mt-2 font-serif text-xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-2xl">
              Imminent Expiry & Priority Consumption
            </h2>
            <p className="mt-1 text-xs text-[var(--shelf-muted)] sm:text-sm">
              Sequence consumption using First-In, First-Out (FIFO) discipline to intercept waste before it starts.
            </p>
          </div>

          {!isBusiness && inventory.length > 0 && (
            <button
              onClick={handleRecipeRedirect}
              className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles size={14} />
              Cook With Expiring Items
            </button>
          )}
        </div>

        {/* Priority Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {useFirstList.slice(0, 6).map((item, idx) => {
            let badge =
              "text-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10 border border-[var(--shelf-forest)]/20";
            if (item.days < 0) {
              badge =
                "text-[var(--shelf-terracotta)] bg-[var(--shelf-terracotta)]/10 border border-[var(--shelf-terracotta)]/20";
            } else if (item.days <= 3) {
              badge =
                "text-[var(--shelf-amber)] bg-[var(--shelf-amber)]/10 border border-[var(--shelf-amber)]/20";
            }

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--app-border-subtle)] hover:bg-[var(--shelf-cream)]/20 transition text-sm bg-[var(--app-surface-elevated)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--shelf-cream)] font-mono font-bold text-xs text-[var(--shelf-dark)]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-[var(--shelf-dark)]">{item.name}</p>
                    <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${badge}`}>
                    {formatExpiry(item.expiryDate)}
                  </span>
                  <button
                    onClick={() => handleOpenUseFirst(item)}
                    className="sl-focus-ring text-xs font-bold text-[var(--shelf-forest)] hover:underline px-2.5 py-1 bg-[var(--shelf-cream)] rounded-lg cursor-pointer transition"
                  >
                    Use
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Archival Discard Audit Log */}
      <DiscardLogTable
        logs={report.discardLogs}
        hasActiveExpired={expiredItems.length > 0}
        onRefresh={() => router.refresh()}
      />

      {/* Interactive Modal: Consume Item */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="use-product-title"
            className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-2xl"
          >
            <div className="p-5 border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40">
              <h3 id="use-product-title" className="font-serif text-lg font-bold text-[var(--shelf-dark)]">
                Log Consumption
              </h3>
              <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                Mark {selectedItem.name} as used or consumed.
              </p>
              <button
                onClick={() => setSelectedItem(null)}
                aria-label="Close use product dialog"
                className="absolute top-5 right-5 text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)] mb-2">
                  Quantity to Consume ({selectedItem.unit})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step={isIntegerUnit(selectedItem.unit) ? "1" : "any"}
                    min={isIntegerUnit(selectedItem.unit) ? "1" : "0.01"}
                    max={selectedItem.quantity}
                    aria-label={`Quantity of ${selectedItem.name} to consume`}
                    value={useQuantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setUseQuantity(Math.min(selectedItem.quantity, Math.max(0.01, val)));
                      }
                    }}
                    className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 p-2.5 text-center font-mono text-sm font-bold outline-none"
                  />
                  <span className="text-xs font-mono font-semibold text-[var(--shelf-dark)] shrink-0">
                    / {selectedItem.quantity} {selectedItem.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2.5 border-t border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 p-4 sm:flex-row sm:justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="sl-focus-ring rounded-xl border border-[var(--shelf-border)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] bg-[var(--shelf-surface)] hover:bg-[var(--shelf-cream)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUse}
                disabled={loading}
                className="sl-focus-ring inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? "Updating..." : "Confirm Consumption"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WasteView(props: WasteViewProps) {
  return (
    <ToastProvider>
      <WasteViewInner {...props} />
    </ToastProvider>
  );
}
