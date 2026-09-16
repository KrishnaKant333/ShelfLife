"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Utensils, AlertCircle, XCircle } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import {
  deleteInventoryItemWithReasonAction,
  restoreInventoryItemAction,
} from "@/lib/actions/inventory";
import { useToast } from "@/components/ui/Toast";
import type { InventoryItem } from "@/lib/inventory";

interface ProductDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  onSuccess: (deletedId: number) => void;
  onRestore?: () => void;
}

type DeleteReason = "consumed" | "waste" | "error";

export default function ProductDeleteModal({
  isOpen,
  onClose,
  item,
  onSuccess,
  onRestore,
}: ProductDeleteModalProps) {
  const { showToast } = useToast();
  const [reason, setReason] = useState<DeleteReason>("consumed");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteInventoryItemWithReasonAction(item.id, reason);
      if (res.success && res.deletedItem) {
        const snapshot = res.deletedItem;
        onSuccess(item.id);
        onClose();

        // 5-second interactive Undo Toast (Spec 05 Section 4.4)
        showToast(
          `Removed "${item.name}" from inventory.`,
          "success",
          {
            label: "Undo",
            onClick: async () => {
              try {
                const restoreRes = await restoreInventoryItemAction(snapshot);
                if (restoreRes.success) {
                  showToast(`Restored "${item.name}" to inventory.`, "success");
                  onRestore?.();
                } else {
                  showToast("Could not restore item.", "error");
                }
              } catch {
                showToast("Failed to restore item.", "error");
              }
            },
          }
        );
      } else {
        showToast(res.error || "Failed to remove item.", "error");
      }
    } catch {
      showToast("An error occurred while removing product.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Remove ${item.name}`}
      description="Choose a removal reason so your consumption and waste analytics remain accurate."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle size={16} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Removal Confirmation</p>
            <p className="leading-relaxed">
              Are you sure you want to remove <strong>{item.name}</strong> ({item.quantity} {item.unit}) from your active pantry?
            </p>
          </div>
        </div>

        {/* Reason Selector Options */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--app-text-body)]">
            Reason for removal:
          </label>

          {/* Reason 1: Consumed */}
          <button
            type="button"
            onClick={() => setReason("consumed")}
            className={`sl-focus-ring flex w-full items-start gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
              reason === "consumed"
                ? "border-[var(--app-accent-emerald)] bg-[var(--app-accent-emerald)]/10 shadow-2xs"
                : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] hover:bg-[var(--app-surface-base)]"
            }`}
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent-emerald)]/15 text-[var(--app-accent-emerald)]">
              <Utensils size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-[var(--app-text-display)]">
                Consumed / Finished
              </span>
              <span className="block text-[11px] text-[var(--app-text-muted)] mt-0.5 leading-snug">
                Food was fully eaten or cooked. Logged as healthy consumption.
              </span>
            </div>
          </button>

          {/* Reason 2: Spoiled / Waste */}
          <button
            type="button"
            onClick={() => setReason("waste")}
            className={`sl-focus-ring flex w-full items-start gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
              reason === "waste"
                ? "border-amber-500 bg-amber-500/10 shadow-2xs"
                : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] hover:bg-[var(--app-surface-base)]"
            }`}
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
              <AlertCircle size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-[var(--app-text-display)]">
                Spoiled / Expired
              </span>
              <span className="block text-[11px] text-[var(--app-text-muted)] mt-0.5 leading-snug">
                Food went bad or past safety date. Accurately tracked in Waste Analytics.
              </span>
            </div>
          </button>

          {/* Reason 3: Entry Error */}
          <button
            type="button"
            onClick={() => setReason("error")}
            className={`sl-focus-ring flex w-full items-start gap-3 rounded-xl border p-3 text-left transition cursor-pointer ${
              reason === "error"
                ? "border-stone-400 bg-stone-500/10 shadow-2xs"
                : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] hover:bg-[var(--app-surface-base)]"
            }`}
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-500/15 text-stone-600 dark:text-stone-300">
              <XCircle size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-[var(--app-text-display)]">
                Entry Error / Duplicate
              </span>
              <span className="block text-[11px] text-[var(--app-text-muted)] mt-0.5 leading-snug">
                Accidental addition or duplicate entry. Removed without skewing waste metrics.
              </span>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="sl-focus-ring flex-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-2.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer min-h-[44px]"
          >
            Keep Product
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="sl-focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {isDeleting ? (
              <span>Removing...</span>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Remove Product</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
