"use client";

import { useState } from "react";
import { X, Utensils, Loader2, Check } from "lucide-react";
import type { InventoryItem } from "@/lib/inventory";

interface QuickConsumeModalProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

export default function QuickConsumeModal({
  item,
  isOpen,
  onClose,
  onConfirm,
}: QuickConsumeModalProps) {
  const [quantity, setQuantity] = useState<number>(() => Math.min(1, item.quantity));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePercentage = (percent: number) => {
    const computed = Math.max(1, Math.round((item.quantity * percent) / 100));
    setQuantity(Math.min(item.quantity, computed));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0 || quantity > item.quantity) return;
    setIsSubmitting(true);
    try {
      await onConfirm(quantity);
      onClose();
    } catch {
      // Error handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-consume-title"
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent-emerald)]/10 text-[var(--app-accent-emerald)]">
              <Utensils size={18} />
            </div>
            <div>
              <h3 id="quick-consume-title" className="sl-display-serif text-lg font-bold text-[var(--app-text-display)]">
                Log Consumption
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                {item.name} · Available: {item.quantity} {item.unit}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-display)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Portion Selector */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[var(--app-text-muted)]">
              <span>Portion to deduct:</span>
              <span className="font-bold text-[var(--app-accent-emerald)] text-sm">
                {quantity} {item.unit} ({Math.round((quantity / item.quantity) * 100)}%)
              </span>
            </div>

            {/* Quick Percentage Chips */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentage(pct)}
                  className={`rounded-lg py-1.5 text-xs font-semibold border transition ${
                    Math.round((quantity / item.quantity) * 100) === pct
                      ? "bg-[var(--app-accent-emerald)] text-white border-[var(--app-accent-emerald)] shadow-2xs"
                      : "bg-[var(--app-surface-base)] text-[var(--app-text-body)] border-[var(--app-border-subtle)] hover:border-[var(--app-border-strong)]"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Range Slider for Touch & Precision */}
            <div className="pt-2">
              <input
                type="range"
                min={1}
                max={item.quantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full accent-[var(--app-accent-emerald)] cursor-pointer"
                aria-label={`Quantity slider for ${item.name}`}
              />
            </div>

            {/* Direct Numerical Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min={1}
                max={item.quantity}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(item.quantity, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="sl-focus-ring flex-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-3.5 py-2 text-sm font-semibold text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                aria-label={`Exact quantity for ${item.name}`}
              />
              <span className="text-sm font-semibold text-[var(--app-text-muted)] min-w-[50px]">
                {item.unit}
              </span>
            </div>
          </div>

          {/* Subtext info */}
          <p className="text-[11px] text-[var(--app-text-muted)]">
            {quantity >= item.quantity
              ? "All remaining inventory of this item will be consumed and recorded in your historical ledger."
              : `Remaining stock after deduction: ${item.quantity - quantity} ${item.unit}.`}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="sl-focus-ring rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-4 py-2.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-border-subtle)]/40 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="sl-focus-ring flex items-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-105 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Confirm Portion ({quantity} {item.unit})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
