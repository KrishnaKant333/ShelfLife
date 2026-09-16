"use client";

import { useState } from "react";
import { Trash2, Utensils, AlertCircle, XCircle, AlertTriangle } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import {
  bulkDeleteWithReasonAction,
  bulkRestoreInventoryItemsAction,
} from "@/lib/actions/inventory";
import { consumeIngredientsAction } from "@/lib/actions/recipes";
import { useToast } from "@/components/ui/Toast";
import type { InventoryItem } from "@/lib/inventory";

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  defaultReason?: "consumed" | "waste" | "error";
  isConsumeOnly?: boolean;
  onSuccess: () => void;
  onRestore?: () => void;
}

type DeleteReason = "consumed" | "waste" | "error";

export default function BulkDeleteModal({
  isOpen,
  onClose,
  items,
  defaultReason = "consumed",
  isConsumeOnly = false,
  onSuccess,
  onRestore,
}: BulkDeleteModalProps) {
  const { showToast } = useToast();
  const [reason, setReason] = useState<DeleteReason>(defaultReason);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    if (isConsumeOnly) {
      try {
        const itemsToConsume = items.map((item) => ({
          itemId: item.id,
          quantityUsed: item.quantity,
        }));
        const res = await consumeIngredientsAction(itemsToConsume);
        if (res.success) {
          showToast(
            `${items.length} product(s) marked as consumed.`,
            "success"
          );
          onSuccess();
          onClose();
        } else {
          showToast(res.error || "Bulk consume failed.", "error");
        }
      } catch {
        showToast("Error executing bulk consumption.", "error");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    try {
      const ids = items.map((i) => i.id);
      const res = await bulkDeleteWithReasonAction(ids, reason);

      if (res.success && res.deletedItems) {
        const snapshots = res.deletedItems;
        const count = res.count ?? items.length;
        onSuccess();
        onClose();

        // 5-second interactive Undo Toast
        showToast(
          `Removed ${count} product(s) from inventory.`,
          "success",
          {
            label: "Undo",
            onClick: async () => {
              try {
                const restoreRes = await bulkRestoreInventoryItemsAction(snapshots);
                if (restoreRes.success) {
                  showToast(
                    `Restored ${restoreRes.count ?? count} product(s) to inventory.`,
                    "success"
                  );
                  onRestore?.();
                } else {
                  showToast("Could not restore products.", "error");
                }
              } catch {
                showToast("Failed to restore products.", "error");
              }
            },
          }
        );
      } else {
        showToast(res.error || "Failed to remove selected products.", "error");
      }
    } catch {
      showToast("An unexpected error occurred during removal.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        isConsumeOnly
          ? `Mark ${items.length} Products as Consumed`
          : `Remove ${items.length} Selected Products`
      }
      description={
        isConsumeOnly
          ? `Stock will be recorded as used in meal preparation and logged in your Kitchen Usage audit register.`
          : "Choose a removal reason so your consumption and waste analytics remain accurate."
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Warning & Confirmation Header */}
        <div
          className={`rounded-2xl border p-4 space-y-2 ${
            isConsumeOnly
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            {isConsumeOnly ? (
              <>
                <Utensils size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Consumption Confirmation</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} className="shrink-0 text-rose-600 dark:text-rose-400" />
                <span>Bulk Removal Confirmation</span>
              </>
            )}
          </div>
          <p className="text-xs font-semibold leading-relaxed">
            {isConsumeOnly
              ? `Are you sure you want to mark ${items.length} items as fully consumed? Their stock will be reduced to 0.`
              : `Are you sure you want to remove ${items.length} selected items from your active inventory?`}
          </p>
        </div>

        {/* Selected Items Chip Preview */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
            Selected Items ({items.length})
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 scrollbar-thin">
            {items.map((it) => (
              <span
                key={it.id}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-2 py-1 text-[11px] font-medium text-[var(--app-text-body)] truncate max-w-[200px]"
                title={`${it.name} (${it.quantity} ${it.unit})`}
              >
                <span className="truncate">{it.name}</span>
                <span className="text-[10px] text-[var(--app-text-muted)] font-mono">
                  {it.quantity} {it.unit}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Structured Reason Selector (Bulk Delete Mode) */}
        {!isConsumeOnly && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-[var(--app-text-display)] block">
              Reason for removal:
            </span>

            <div className="space-y-2">
              {/* Option 1: Consumed */}
              <button
                type="button"
                onClick={() => setReason("consumed")}
                className={`sl-focus-ring flex w-full items-start gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
                  reason === "consumed"
                    ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                    : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] hover:bg-[var(--app-surface-base)]"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    reason === "consumed"
                      ? "bg-emerald-500 text-white"
                      : "bg-[var(--app-surface-base)] text-[var(--app-text-muted)]"
                  }`}
                >
                  <Utensils size={14} />
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      reason === "consumed"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-[var(--app-text-display)]"
                    }`}
                  >
                    Consumed / Finished
                  </p>
                  <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5 leading-snug">
                    Food was fully eaten or cooked. Logged as healthy kitchen usage.
                  </p>
                </div>
              </button>

              {/* Option 2: Spoiled / Waste */}
              <button
                type="button"
                onClick={() => setReason("waste")}
                className={`sl-focus-ring flex w-full items-start gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
                  reason === "waste"
                    ? "border-amber-500 bg-amber-500/10 shadow-xs"
                    : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] hover:bg-[var(--app-surface-base)]"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    reason === "waste"
                      ? "bg-amber-500 text-white"
                      : "bg-[var(--app-surface-base)] text-[var(--app-text-muted)]"
                  }`}
                >
                  <AlertCircle size={14} />
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      reason === "waste"
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-[var(--app-text-display)]"
                    }`}
                  >
                    Spoiled / Expired
                  </p>
                  <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5 leading-snug">
                    Food went bad or past safety date. Accurately tracked in Waste Analytics.
                  </p>
                </div>
              </button>

              {/* Option 3: Entry Error */}
              <button
                type="button"
                onClick={() => setReason("error")}
                className={`sl-focus-ring flex w-full items-start gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
                  reason === "error"
                    ? "border-rose-500 bg-rose-500/10 shadow-xs"
                    : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] hover:bg-[var(--app-surface-base)]"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    reason === "error"
                      ? "bg-rose-500 text-white"
                      : "bg-[var(--app-surface-base)] text-[var(--app-text-muted)]"
                  }`}
                >
                  <XCircle size={14} />
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      reason === "error"
                        ? "text-rose-700 dark:text-rose-400"
                        : "text-[var(--app-text-display)]"
                    }`}
                  >
                    Entry Error / Duplicate
                  </p>
                  <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5 leading-snug">
                    Accidental addition or duplicate entry. Removed without skewing waste metrics.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="sl-focus-ring flex-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-2.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`sl-focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-105 transition disabled:opacity-50 cursor-pointer min-h-[44px] ${
              isConsumeOnly
                ? "bg-[var(--app-accent-emerald)]"
                : "bg-rose-600 dark:bg-rose-500"
            }`}
          >
            {isProcessing ? (
              <span>Processing...</span>
            ) : isConsumeOnly ? (
              <>
                <Utensils size={14} />
                <span>Mark {items.length} Consumed</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Remove {items.length} Products</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
