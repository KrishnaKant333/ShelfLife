"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  FileText,
  Utensils,
  Edit2,
  Trash2,
} from "lucide-react";
import ProductDossierHero from "@/components/inventory/ProductDossierHero";
import ExpirationVisualizer from "@/components/inventory/ExpirationVisualizer";
import AIFoodIntelligence from "@/components/inventory/AIFoodIntelligence";
import ProductActivityLedger from "@/components/inventory/ProductActivityLedger";
import QuickConsumeModal from "@/components/inventory/QuickConsumeModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import {
  consumeIngredientsAction,
  type ConsumptionRecord,
} from "@/lib/actions/recipes";
import { deleteInventoryItem } from "@/lib/actions/inventory";
import type { InventoryItem } from "@/lib/inventory";

interface ProductDossierViewProps {
  item: InventoryItem & { status: string; createdAt?: string | Date | null };
  history: ConsumptionRecord[];
  isBusiness?: boolean;
  fifoRank?: number;
}

type DossierTab = "intelligence" | "lifecycle" | "ledger";

function ProductDossierViewInner({
  item,
  history: initialHistory,
  isBusiness = false,
  fifoRank = 1,
}: ProductDossierViewProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<DossierTab>("intelligence");
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);
  const [history, setHistory] = useState<ConsumptionRecord[]>(initialHistory);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  // Handle portion consumption
  const handleConfirmConsume = async (quantityUsed: number) => {
    try {
      const res = await consumeIngredientsAction([
        {
          itemId: item.id,
          quantityUsed,
        },
      ]);

      if (res.success) {
        showToast(
          `Consumed ${quantityUsed} ${item.unit} of ${item.name}.`,
          "success"
        );

        // Optimistically record in local history
        const newRecord: ConsumptionRecord = {
          id: Date.now(),
          productName: item.name,
          quantityUsed,
          unit: item.unit,
          consumedAt: new Date().toISOString(),
        };
        setHistory((prev) => [newRecord, ...prev]);

        if (quantityUsed >= item.quantity) {
          router.push(`${prefix}/inventory`);
        } else {
          router.refresh();
        }
      } else {
        showToast(res.error || "Failed to log consumption.", "error");
      }
    } catch {
      showToast("An unexpected error occurred while updating stock.", "error");
    }
  };

  // Handle deletion
  const handleConfirmDelete = async () => {
    try {
      await deleteInventoryItem(item.id);
      showToast(`${item.name} removed from inventory.`, "success");
      router.push(`${prefix}/inventory`);
    } catch {
      showToast("Unable to delete product. Please try again.", "error");
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Flagship Hero Header */}
      <ProductDossierHero
        item={item}
        isBusiness={isBusiness}
        fifoRank={fifoRank}
        onOpenConsume={() => setIsConsumeModalOpen(true)}
        onDelete={() => setConfirmDeleteOpen(true)}
      />

      {/* Dynamic Expiration Progression Bar */}
      <ExpirationVisualizer
        expiryDate={item.expiryDate}
        createdAt={item.createdAt}
        category={item.category}
      />

      {/* Dossier Section Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--app-border-subtle)] text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("intelligence")}
          className={`flex items-center gap-1.5 pb-3 px-2 border-b-2 transition cursor-pointer select-none ${
            activeTab === "intelligence"
              ? "border-[var(--app-accent-emerald)] text-[var(--app-accent-emerald)] font-bold"
              : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-display)]"
          }`}
        >
          <Sparkles size={14} />
          <span>AI Food Intelligence</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-1.5 pb-3 px-2 border-b-2 transition cursor-pointer select-none ${
            activeTab === "ledger"
              ? "border-[var(--app-accent-emerald)] text-[var(--app-accent-emerald)] font-bold"
              : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-display)]"
          }`}
        >
          <FileText size={14} />
          <span>Historical Ledger ({history.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="animate-in fade-in duration-200">
        {activeTab === "intelligence" && (
          <AIFoodIntelligence
            productName={item.name}
            category={item.category}
            expiryDate={item.expiryDate}
            isBusiness={isBusiness}
          />
        )}

        {activeTab === "ledger" && (
          <ProductActivityLedger
            productName={item.name}
            initialQuantity={item.quantity}
            currentQuantity={item.quantity}
            unit={item.unit}
            createdAt={item.createdAt}
            history={history}
            isBusiness={isBusiness}
          />
        )}
      </div>

      {/* Sticky Bottom Action Sheet on Mobile Devices */}
      <div className="fixed inset-x-0 bottom-0 z-30 sm:hidden border-t border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)]/95 backdrop-blur-md p-3 px-4 flex items-center justify-between gap-2 shadow-lg">
        <button
          type="button"
          onClick={() => setIsConsumeModalOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] py-2.5 text-xs font-bold text-white shadow-2xs"
        >
          <Utensils size={14} />
          <span>Consume</span>
        </button>

        <Link
          href={`${prefix}/inventory/${item.id}/edit`}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-2.5 text-xs font-semibold text-[var(--app-text-body)]"
        >
          <Edit2 size={13} />
          <span>Edit</span>
        </Link>

        <button
          type="button"
          onClick={() => setConfirmDeleteOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Tactile Consumption Modal */}
      <QuickConsumeModal
        item={item}
        isOpen={isConsumeModalOpen}
        onClose={() => setIsConsumeModalOpen(false)}
        onConfirm={handleConfirmConsume}
      />

      {/* Delete Confirmation Dialog */}
      {confirmDeleteOpen && (
        <ConfirmDialog
          title={`Delete ${item.name}`}
          message={`Are you sure you want to remove ${item.name} from your digital dossier? This action cannot be undone.`}
          confirmLabel="Delete Product"
          isDestructive
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      )}
    </div>
  );
}

export default function ProductDossierView(props: ProductDossierViewProps) {
  return (
    <ToastProvider>
      <ProductDossierViewInner {...props} />
    </ToastProvider>
  );
}
