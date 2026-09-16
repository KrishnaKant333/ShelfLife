"use client";

import { useState } from "react";
import { Plus, Package, Calculator, Check, Building2 } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import { isIntegerUnit } from "@/lib/normalization";
import { restockInventoryItemAction } from "@/lib/actions/inventory";
import { useToast } from "@/components/ui/Toast";
import type { InventoryItem } from "@/lib/inventory";

interface ProductRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  isBusiness?: boolean;
  onSuccess: (newQuantity: number) => void;
}

export default function ProductRestockModal({
  isOpen,
  onClose,
  item,
  isBusiness = false,
  onSuccess,
}: ProductRestockModalProps) {
  const { showToast } = useToast();
  const isInt = isIntegerUnit(item.unit);
  const defaultAmount = isInt ? 1 : 0.5;

  const [amountToAdd, setAmountToAdd] = useState<number>(defaultAmount);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [batchLot, setBatchLot] = useState("");
  const [unitCost, setUnitCost] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cleanAmount = isInt ? Math.round(amountToAdd) : Math.round(amountToAdd * 10000) / 10000;
  const newTotal = Math.max(0, Math.round((item.quantity + (Number.isFinite(cleanAmount) ? cleanAmount : 0)) * 10000) / 10000);

  const quickPills = isInt ? [1, 2, 5, 10] : [0.25, 0.5, 1, 2];

  const handleConfirm = async () => {
    if (!Number.isFinite(amountToAdd) || amountToAdd <= 0) {
      showToast("Please enter an amount greater than 0.", "error");
      return;
    }
    if (isInt && !Number.isInteger(amountToAdd)) {
      showToast(`Quantity must be a whole number for ${item.unit}.`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await restockInventoryItemAction(item.id, cleanAmount, isBusiness ? {
        invoiceNumber: invoiceNumber.trim() || undefined,
        batchLot: batchLot.trim() || undefined,
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
      } : undefined);

      if (res.success && res.newQuantity !== undefined) {
        showToast(
          `Added ${cleanAmount} ${item.unit} to ${item.name}. New total: ${res.newQuantity} ${item.unit}`,
          "success"
        );
        onSuccess(res.newQuantity);
        onClose();
      } else {
        showToast(res.error || "Failed to restock product.", "error");
      }
    } catch {
      showToast("An error occurred while updating stock.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Stock: ${item.name}`}
      description="Record newly acquired stock to update current pantry levels."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Current Balance Banner */}
        <div className="flex items-center justify-between rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--app-text-muted)]">
            <Package size={15} className="text-[var(--app-accent-emerald)]" />
            <span>Current Stock</span>
          </div>
          <span className="sl-tabular-num text-sm font-bold text-[var(--app-text-display)]">
            {item.quantity} {item.unit}
          </span>
        </div>

        {/* Input Amount Section */}
        <div className="space-y-1.5">
          <label
            htmlFor="restock-qty"
            className="block text-xs font-semibold text-[var(--app-text-body)]"
          >
            Amount to Add ({item.unit})
          </label>
          <div className="flex items-center gap-2">
            <input
              id="restock-qty"
              type="number"
              min={isInt ? "1" : "0.0001"}
              step={isInt ? "1" : "any"}
              inputMode={isInt ? "numeric" : "decimal"}
              value={amountToAdd}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAmountToAdd(Number.isFinite(val) ? val : 0);
              }}
              className="sl-focus-ring flex-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3.5 py-2.5 text-base font-semibold text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
            />
            <span className="text-sm font-semibold text-[var(--app-text-muted)] px-1">
              {item.unit}
            </span>
          </div>

          {/* Quick Increment Pills */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-[var(--app-text-muted)] mr-1">Quick:</span>
            {quickPills.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmountToAdd(p)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  amountToAdd === p
                    ? "border-[var(--app-accent-emerald)] bg-[var(--app-accent-emerald)]/10 text-[var(--app-accent-emerald)]"
                    : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text-display)]"
                }`}
              >
                +{p}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Calculation Card */}
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-accent-emerald)]">
            <Calculator size={13} />
            <span>New Balance Preview</span>
          </div>
          <p className="text-sm font-bold text-[var(--app-text-display)] sl-tabular-num">
            {item.quantity} + {cleanAmount || 0} ={" "}
            <span className="text-[var(--app-accent-emerald)]">{newTotal} {item.unit}</span>
          </p>
          <p className="text-[11px] text-[var(--app-text-muted)]">
            Ledger entry will be appended to your activity history.
          </p>
        </div>

        {/* Commercial Metadata Section (Business Workspace) */}
        {isBusiness && (
          <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              <Building2 size={13} />
              <span>Commercial Metadata (Optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[var(--app-text-muted)] mb-1">
                  Invoice / PO #
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-9042"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2.5 py-1.5 text-xs text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[var(--app-text-muted)] mb-1">
                  Batch / Lot ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. LOT-2026B"
                  value={batchLot}
                  onChange={(e) => setBatchLot(e.target.value)}
                  className="w-full rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2.5 py-1.5 text-xs text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[var(--app-text-muted)] mb-1">
                Unit Cost
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Cost per unit"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2.5 py-1.5 text-xs text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
              />
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="sl-focus-ring flex-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-2.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || amountToAdd <= 0}
            className="sl-focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-105 transition disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {isSubmitting ? (
              <span>Restocking...</span>
            ) : (
              <>
                <Check size={14} />
                <span>Confirm Add Stock</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
