"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  Utensils,
  Play,
  RotateCcw,
  Sparkles,
  Calendar,
  X,
} from "lucide-react";
import { getDaysUntilExpiry, formatExpiry } from "@/lib/format-expiry";
import { consumeIngredientsAction } from "@/lib/actions/recipes";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

interface WasteViewProps {
  inventory: InventoryItem[];
  isBusiness?: boolean;
}

export default function WasteView({ inventory, isBusiness = false }: WasteViewProps) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [useQuantity, setUseQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Group items by urgency
  const itemsWithDays = inventory.map(item => {
    const days = getDaysUntilExpiry(item.expiryDate);
    return { ...item, days };
  });

  const expiredItems = itemsWithDays.filter(x => x.days < 0);
  const criticalItems = itemsWithDays.filter(x => x.days >= 0 && x.days <= 3);
  const warningItems = itemsWithDays.filter(x => x.days > 3 && x.days <= 7);
  const lowStockItems = itemsWithDays.filter(x => x.quantity <= 2 && x.days > 7);

  // Sort strictly for "Use First" list
  const useFirstList = [...itemsWithDays].sort((a, b) => a.days - b.days);

  // Waste risk score calculation (out of 100)
  // Higher score = higher risk of waste
  // Expired item = 15pts, critical item = 10pts, warning item = 5pts
  const rawRiskScore = (expiredItems.length * 20) + (criticalItems.length * 10) + (warningItems.length * 4);
  const riskScore = Math.min(100, rawRiskScore);

  // Get risk rating text
  let riskLevel = "Low Risk";
  let riskColor = "text-green-600 bg-green-50 border-green-200";
  let riskBarColor = "bg-green-600";

  if (riskScore >= 70) {
    riskLevel = "Critical Expiry Exposure";
    riskColor = "text-[var(--shelf-terracotta)] bg-red-50 border-red-200";
    riskBarColor = "bg-[var(--shelf-terracotta)]";
  } else if (riskScore >= 30) {
    riskLevel = "Moderate Waste Risk";
    riskColor = "text-[var(--shelf-amber)] bg-amber-50 border-amber-200";
    riskBarColor = "bg-[var(--shelf-amber)]";
  }

  // Combined "At Risk" list prioritized by urgency
  const atRiskList = [
    ...expiredItems.map(x => ({ ...x, statusLabel: "Expired", statusColor: "text-[var(--shelf-terracotta)] bg-red-50 border-red-200" })),
    ...criticalItems.map(x => ({ ...x, statusLabel: `Expiring in ${formatExpiry(x.expiryDate)}`, statusColor: "text-[var(--shelf-amber)] bg-amber-50 border-amber-200" })),
    ...warningItems.map(x => ({ ...x, statusLabel: `Expires in ${formatExpiry(x.expiryDate)}`, statusColor: "text-blue-700 bg-blue-50 border-blue-200" })),
    ...lowStockItems.map(x => ({ ...x, statusLabel: "Low Stock", statusColor: "text-purple-700 bg-purple-50 border-purple-200" }))
  ];

  const handleOpenUseFirst = (item: InventoryItem) => {
    setSelectedItem(item);
    setUseQuantity(1);
  };

  const handleConfirmUse = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      const res = await consumeIngredientsAction([
        { itemId: selectedItem.id, quantityUsed: useQuantity }
      ]);
      if (res.success) {
        alert(`${selectedItem.name} updated successfully.`);
        setSelectedItem(null);
        router.refresh();
      } else {
        alert(res.error || "Failed to update item.");
      }
    } catch (err: any) {
      alert("Failed to consume item.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeRedirect = () => {
    router.push("/dashboard/recipes");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-sm font-semibold text-[var(--shelf-forest)]">
          Sustainability
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
          Waste & Shelf Insights
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Track expiry risks, manage upcoming stock warnings, and prioritize items needing immediate consumption.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Waste Risk Score Widget */}
        <div className="md:col-span-1 flex flex-col justify-between rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider">
              Waste-Risk Estimate
            </h3>
            <p className="mt-1 text-xs text-[var(--shelf-muted)]">
              Advisory score calculated based on current expiring stock volumes.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-[var(--shelf-cream)]">
                {/* Visual indicator of score */}
                <span className="text-4xl font-extrabold text-[var(--shelf-dark)]">
                  {riskScore}
                </span>
                <span className="absolute bottom-4 text-[10px] font-bold text-[var(--shelf-muted)]">
                  / 100
                </span>
              </div>

              <span className={`mt-6 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${riskColor}`}>
                {riskLevel}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--shelf-border)]/55 pt-4 text-xs text-[var(--shelf-muted)] leading-relaxed">
            {inventory.length === 0 ? (
              "No items in inventory. Add stock to begin monitoring risk levels."
            ) : (
              `Based on ${expiredItems.length} expired and ${criticalItems.length + warningItems.length} items approaching expiry within a week.`
            )}
          </div>
        </div>

        {/* Use First Quick priority list */}
        <div className="md:col-span-2 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider">
                FIFO Use-First Priority
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--shelf-forest)] bg-[var(--shelf-cream)] border border-[var(--shelf-border)] px-2 py-0.5 rounded-md">
                <Flame size={12} /> Expiry Sort
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--shelf-muted)]">
              Consume items in this sequence to optimize freshness and eliminate waste.
            </p>

            <div className="mt-5 space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {useFirstList.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--shelf-muted)]">
                  No active stock to prioritize.
                </div>
              ) : (
                useFirstList.map((item, idx) => {
                  let badge = "text-green-700 bg-green-50 border border-green-100";
                  if (item.days < 0) {
                    badge = "text-[var(--shelf-terracotta)] bg-red-50 border border-red-100";
                  } else if (item.days <= 3) {
                    badge = "text-[var(--shelf-amber)] bg-amber-50 border border-amber-100";
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--shelf-border)]/50 hover:bg-[var(--shelf-cream)]/30 transition text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--shelf-cream)] font-bold text-xs text-[var(--shelf-dark)]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-[var(--shelf-dark)]">{item.name}</p>
                          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">{item.quantity} {item.unit}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${badge}`}>
                          {formatExpiry(item.expiryDate)}
                        </span>
                        <button
                          onClick={() => handleOpenUseFirst(item)}
                          className="text-xs font-bold text-[var(--shelf-forest)] hover:underline px-2 py-1 bg-[var(--shelf-cream)] rounded-lg"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* At Risk List & Action Panel */}
      <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--shelf-dark)]">
              Items At Risk
            </h3>
            <p className="text-xs text-[var(--shelf-muted)]">
              Stock items requiring immediate operational action.
            </p>
          </div>

          {!isBusiness && inventory.length > 0 && (
            <button
              onClick={handleRecipeRedirect}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 shadow-sm"
            >
              <Sparkles size={14} />
              Cook With Expiring Items
            </button>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {atRiskList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--shelf-border)] p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
              <h4 className="mt-3 text-sm font-bold text-[var(--shelf-dark)]">Zero risk detected</h4>
              <p className="mt-1 text-xs text-[var(--shelf-muted)]">
                All inventory items are fresh and have healthy stock levels!
              </p>
            </div>
          ) : (
            atRiskList.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-[var(--shelf-border)] bg-white p-4 hover:border-[var(--shelf-sage)] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[var(--shelf-terracotta)]" />
                  <div>
                    <h4 className="font-bold text-[var(--shelf-dark)]">{item.name}</h4>
                    <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                      Quantity: <span className="font-semibold text-[var(--shelf-dark)]">{item.quantity} {item.unit}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.statusColor}`}>
                    {item.statusLabel}
                  </span>

                  <div className="flex gap-2">
                    {!isBusiness && (
                      <button
                        onClick={handleRecipeRedirect}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--shelf-border)] px-3 py-1.5 text-xs font-semibold text-[var(--shelf-dark)] bg-white hover:bg-[var(--shelf-cream)]"
                      >
                        <Utensils size={13} />
                        Use in Recipe
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenUseFirst(item)}
                      className="rounded-lg bg-[var(--shelf-forest)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Use First
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Consume Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative flex flex-col w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[var(--shelf-border)] overflow-hidden">
            <div className="p-5 border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40">
              <h3 className="text-lg font-bold text-[var(--shelf-dark)]">Use Product</h3>
              <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                Mark {selectedItem.name} as used or consumed.
              </p>
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-5 right-5 text-[var(--shelf-muted)] hover:text-gray-700"
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
                    min={1}
                    max={selectedItem.quantity}
                    value={useQuantity}
                    onChange={(e) => {
                      const val = Math.min(
                        selectedItem.quantity,
                        Math.max(1, parseInt(e.target.value) || 1)
                      );
                      setUseQuantity(val);
                    }}
                    className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 p-2.5 font-bold text-center text-sm outline-none focus:border-[var(--shelf-forest)]"
                  />
                  <span className="text-sm font-semibold text-[var(--shelf-dark)]">
                    / {selectedItem.quantity} {selectedItem.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 flex justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-xl border border-[var(--shelf-border)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] bg-white hover:bg-[var(--shelf-cream)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUse}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Confirm Use
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
