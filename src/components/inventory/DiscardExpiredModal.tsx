"use client";

import { useState } from "react";
import { Trash2, AlertCircle, Clock } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import { discardExpiredItemsAction } from "@/lib/actions/inventory";
import { formatExpiry } from "@/lib/format-expiry";
import { useToast } from "@/components/ui/Toast";
import type { InventoryItem } from "@/lib/inventory";

interface DiscardExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  expiredItems: InventoryItem[];
  onSuccess: (count: number) => void;
}

export default function DiscardExpiredModal({
  isOpen,
  onClose,
  expiredItems,
  onSuccess,
}: DiscardExpiredModalProps) {
  const { showToast } = useToast();
  const [isDiscarding, setIsDiscarding] = useState(false);

  const handleConfirmDiscard = async () => {
    setIsDiscarding(true);
    try {
      const res = await discardExpiredItemsAction();
      if (res.success) {
        const count = res.count ?? expiredItems.length;
        showToast(
          count > 0
            ? `Discarded ${count} expired product(s) and recorded in Waste Analytics.`
            : "No expired items to discard.",
          "success"
        );
        onSuccess(count);
        onClose();
      } else {
        showToast(res.error || "Failed to discard expired items.", "error");
      }
    } catch {
      showToast("Error occurred while discarding expired items.", "error");
    } finally {
      setIsDiscarding(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Discard ${expiredItems.length} Expired Product${expiredItems.length === 1 ? "" : "s"}`}
      description="Clear past-date products from active inventory and register loss in your waste audit ledger."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2 text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <AlertCircle size={14} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <span>Waste Audit Registration</span>
          </div>
          <p className="text-xs font-semibold leading-relaxed">
            Are you sure you want to discard {expiredItems.length} expired item{expiredItems.length === 1 ? "" : "s"}?
            They will be removed from your pantry and recorded in your Waste Analytics audit register.
          </p>
        </div>

        {/* Expired Products List */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
            Items to be discarded ({expiredItems.length})
          </span>
          <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 scrollbar-thin">
            {expiredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-2.5 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-[var(--app-text-display)] truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-[var(--app-text-muted)]">
                    {item.category} · {item.quantity} {item.unit}
                  </p>
                </div>
                <span className="shrink-0 flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                  <Clock size={10} />
                  <span>{formatExpiry(item.expiryDate)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDiscarding}
            className="sl-focus-ring flex-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-2.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer min-h-[44px]"
          >
            Keep Items
          </button>
          <button
            type="button"
            onClick={handleConfirmDiscard}
            disabled={isDiscarding}
            className="sl-focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {isDiscarding ? (
              <span>Discarding...</span>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Discard ({expiredItems.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
