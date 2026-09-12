"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Upload,
  Download,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";
import { normalizeQuantity } from "@/lib/normalization";
import {
  consumeIngredientsAction,
  getRecentConsumptionAction,
  type ConsumptionRecord,
} from "@/lib/actions/recipes";
import {
  bulkDeleteAction,
  discardExpiredItemsAction,
  deleteInventoryItem,
} from "@/lib/actions/inventory";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import InventoryToolbar, {
  type FilterType,
  type SortType,
} from "@/components/inventory/InventoryToolbar";
import ProductCatalogCard from "@/components/inventory/ProductCatalogCard";
import ProductCatalogRow from "@/components/inventory/ProductCatalogRow";
import dynamic from "next/dynamic";
const ProductDetailDrawer = dynamic(() => import("@/components/inventory/ProductDetailDrawer"), {
  ssr: false,
});
import {
  EmptyShelf,
  EmptySearch,
} from "@/components/inventory/InventoryEmptyState";
import type { InventoryItem } from "@/lib/inventory";

interface InventoryViewProps {
  initialInventory: InventoryItem[];
  isBusiness?: boolean;
}

function InventoryViewInner({
  initialInventory,
  isBusiness = false,
}: InventoryViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") ?? searchParams.get("search") ?? ""
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [sortBy, setSortBy] = useState<SortType>("expiry-asc");

  // Default to GRID view mode as requested
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  // Active Product Detail Drawer state
  const [activeDrawerProduct, setActiveDrawerProduct] = useState<
    (InventoryItem & { status: string; createdAt?: string }) | null
  >(null);

  // Sync search parameters from top app header
  useEffect(() => {
    const q = searchParams.get("q") ?? searchParams.get("search");
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);

  // Manual Consumption Modal states
  const [consumeItem, setConsumeItem] = useState<InventoryItem | null>(null);
  const [consumeQty, setConsumeQty] = useState<number>(1);
  const [isConsuming, setIsConsuming] = useState(false);

  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  // Compute status for all items once
  const itemsWithStatus = useMemo(() => {
    return initialInventory.map((item) => ({
      ...item,
      status: getInventoryStatus(item.quantity, item.expiryDate, item.unit),
    }));
  }, [initialInventory]);

  // Keep active drawer product synchronized if inventory revalidates
  useEffect(() => {
    if (activeDrawerProduct) {
      const refreshed = itemsWithStatus.find((i) => i.id === activeDrawerProduct.id);
      if (refreshed) {
        setActiveDrawerProduct(refreshed);
      } else {
        // Item was consumed/deleted
        setActiveDrawerProduct(null);
      }
    }
  }, [itemsWithStatus]);

  // Compute live filter counts for pills
  const filterCounts = useMemo<Record<FilterType, number>>(() => {
    const counts: Record<FilterType, number> = {
      All: initialInventory.length,
      Fresh: 0,
      Expiring: 0,
      "Low Stock": 0,
      Expired: 0,
    };
    for (const item of itemsWithStatus) {
      if (item.status in counts) {
        counts[item.status as FilterType]++;
      }
    }
    return counts;
  }, [initialInventory.length, itemsWithStatus]);

  // Filter, search, and sort logic
  const processedInventory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return itemsWithStatus
      .filter((item) => {
        // Search match
        const matchesSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query);

        // Filter match
        const matchesFilter =
          activeFilter === "All" || item.status === activeFilter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "name-desc") {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === "expiry-asc") {
          return (
            (a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity) -
            (b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity)
          );
        }
        if (sortBy === "expiry-desc") {
          return (
            (b.expiryDate ? new Date(b.expiryDate).getTime() : -Infinity) -
            (a.expiryDate ? new Date(a.expiryDate).getTime() : -Infinity)
          );
        }
        if (sortBy === "qty-asc") {
          const normA = normalizeQuantity(a.quantity, a.unit);
          const normB = normalizeQuantity(b.quantity, b.unit);
          if (normA.category !== normB.category) return 0;
          return normA.normalizedValue - normB.normalizedValue;
        }
        if (sortBy === "qty-desc") {
          const normA = normalizeQuantity(a.quantity, a.unit);
          const normB = normalizeQuantity(b.quantity, b.unit);
          if (normA.category !== normB.category) return 0;
          return normB.normalizedValue - normA.normalizedValue;
        }
        if (sortBy === "date-added") {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        }
        return 0;
      });
  }, [itemsWithStatus, searchQuery, activeFilter, sortBy]);

  // Selection handlers
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const visibleIds = processedInventory.map((item) => item.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Quick consumption trigger
  const handleOpenConsume = (item: InventoryItem) => {
    setConsumeItem(item);
    setConsumeQty(Math.min(1, item.quantity));
  };

  // Confirm manual consumption
  const handleConfirmConsume = async () => {
    if (!consumeItem) return;
    setIsConsuming(true);
    try {
      const res = await consumeIngredientsAction([
        { itemId: consumeItem.id, quantityUsed: consumeQty },
      ]);
      if (res.success) {
        showToast(
          `Logged ${consumeQty} ${consumeItem.unit} of ${consumeItem.name} consumed.`,
          "success"
        );
        setConsumeItem(null);
        router.refresh();
      } else {
        showToast(res.error || "Failed to record consumption.", "error");
      }
    } catch {
      showToast("Error occurred while saving consumption.", "error");
    } finally {
      setIsConsuming(false);
    }
  };

  // Delete single item handler
  const handleDeleteSingle = (id: number) => {
    const targetItem = initialInventory.find((x) => x.id === id);
    setConfirmDialog({
      title: "Delete Product",
      message: `Are you sure you want to delete ${
        targetItem ? `"${targetItem.name}"` : "this item"
      }? This cannot be undone.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteInventoryItem(id);
          showToast("Product deleted successfully.", "success");
          setSelectedIds((prev) => prev.filter((x) => x !== id));
          if (activeDrawerProduct?.id === id) {
            setActiveDrawerProduct(null);
          }
          router.refresh();
        } catch {
          showToast("Unable to delete this product. Please try again.", "error");
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // Bulk actions handlers
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      title: "Delete Selected Products",
      message: `Are you sure you want to permanently delete ${selectedIds.length} item(s)? This cannot be undone.`,
      isDestructive: true,
      onConfirm: async () => {
        setIsBulkActionPending(true);
        try {
          const res = await bulkDeleteAction(selectedIds);
          if (res.success) {
            showToast(`${selectedIds.length} product(s) deleted.`, "success");
            setSelectedIds([]);
            router.refresh();
          } else {
            showToast(res.error || "Bulk delete failed.", "error");
          }
        } catch {
          showToast("Error executing bulk delete.", "error");
        } finally {
          setIsBulkActionPending(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleBulkConsume = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      title: "Mark as Fully Consumed",
      message: `Mark ${selectedIds.length} selected item(s) as fully consumed? Their stock will be reduced to 0.`,
      onConfirm: async () => {
        setIsBulkActionPending(true);
        try {
          const itemsToConsume = selectedIds.map((id) => {
            const item = initialInventory.find((x) => x.id === id);
            return {
              itemId: id,
              quantityUsed: item ? item.quantity : 1,
            };
          });
          const res = await consumeIngredientsAction(itemsToConsume);
          if (res.success) {
            showToast(
              `${selectedIds.length} product(s) marked as consumed.`,
              "success"
            );
            setSelectedIds([]);
            router.refresh();
          } else {
            showToast(res.error || "Bulk consume failed.", "error");
          }
        } catch {
          showToast("Error executing bulk consumption.", "error");
        } finally {
          setIsBulkActionPending(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDiscardExpired = () => {
    setConfirmDialog({
      title: "Discard Expired Items",
      message:
        "Discard every expired item in this inventory? This action is permanent and records an activity audit log.",
      isDestructive: true,
      onConfirm: async () => {
        setIsBulkActionPending(true);
        try {
          const result = await discardExpiredItemsAction();
          if (result.success) {
            showToast(
              result.count
                ? `${result.count} expired item(s) discarded.`
                : "No expired items found.",
              "success"
            );
            router.refresh();
          } else {
            showToast(result.error || "Failed to discard expired items.", "error");
          }
        } catch {
          showToast("Error discarding expired items.", "error");
        } finally {
          setIsBulkActionPending(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  const isAllSelected =
    processedInventory.length > 0 &&
    processedInventory.every((item) => selectedIds.includes(item.id));

  return (
    <div className="space-y-6">
      {/* Top Editorial Header Section matching reference design */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="sl-display-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--app-text-display)]">
            {isBusiness ? "Business Inventory" : "Inventory"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--app-text-muted)]">
            All your food, organized and in view.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`${prefix}/inventory/export`}
            className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3.5 py-2 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition shadow-2xs"
          >
            <Download size={14} className="text-[var(--app-text-muted)]" />
            <span>Export</span>
          </Link>

          <Link
            href={`${prefix}/inventory/new?tab=import`}
            className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3.5 py-2 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition shadow-2xs"
          >
            <Upload size={14} className="text-[var(--app-text-muted)]" />
            <span>Import</span>
          </Link>

          <Link
            href={`${prefix}/inventory/new`}
            className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </Link>

          {filterCounts.Expired > 0 && (
            <button
              type="button"
              onClick={handleDiscardExpired}
              title="Discard all expired items"
              aria-label="Discard all expired items"
              className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition"
            >
              <Trash2 size={13} />
              <span>Discard Expired ({filterCounts.Expired})</span>
            </button>
          )}
        </div>
      </div>

      {/* Sticky Inventory Toolbar */}
      <InventoryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterCounts={filterCounts}
      />

      {/* Bulk Action Controls Banner */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-[var(--app-surface-elevated)] p-3.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--app-accent-emerald)] text-[11px] font-bold text-white">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-[var(--app-text-display)]">
              Products selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkConsume}
              disabled={isBulkActionPending}
              className="sl-focus-ring cursor-pointer rounded-lg bg-[var(--app-accent-emerald)] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:brightness-105 disabled:opacity-50 transition"
            >
              Mark Consumed
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isBulkActionPending}
              className="sl-focus-ring cursor-pointer rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/20 disabled:opacity-50 transition"
            >
              Delete Selected
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="sl-focus-ring text-xs font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text-body)] px-2 py-1 transition"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Main Catalog Stage: Stable layout with drawer slide-in */}
      <div
        className={`transition-all duration-300 ease-out ${
          activeDrawerProduct ? "lg:mr-[420px] xl:mr-[460px]" : ""
        }`}
      >
        {initialInventory.length === 0 ? (
          <EmptyShelf isBusiness={isBusiness} />
        ) : processedInventory.length === 0 ? (
          <EmptySearch
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onReset={() => {
              setSearchQuery("");
              setActiveFilter("All");
            }}
          />
        ) : viewMode === "grid" ? (
          /* GRID VIEW (Default): Centered product imagery cards */
          <div
            className={`grid gap-4 transition-all duration-300 ${
              activeDrawerProduct
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {processedInventory.map((item, idx) => (
              <ProductCatalogCard
                key={item.id}
                item={item}
                isSelected={selectedIds.includes(item.id)}
                isActiveInDrawer={activeDrawerProduct?.id === item.id}
                onSelectProduct={(clickedItem) => setActiveDrawerProduct(clickedItem)}
                onToggleSelect={handleToggleSelect}
                onQuickUse={handleOpenConsume}
                onDelete={handleDeleteSingle}
                isBusiness={isBusiness}
                index={idx}
              />
            ))}
          </div>
        ) : (
          /* LIST VIEW: High-density table */
          <div className="sl-editorial-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead className="border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]">
                  <tr>
                    <th className="w-12 px-4 py-3.5 sm:px-5">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        aria-label="Select all visible products"
                        aria-pressed={isAllSelected}
                        className="sl-focus-ring flex items-center text-[var(--app-text-muted)] hover:text-[var(--app-text-body)] transition"
                      >
                        {isAllSelected ? (
                          <CheckSquare size={16} className="text-[var(--app-accent-emerald)]" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3.5 sm:px-5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      Product
                    </th>
                    <th className="hidden sm:table-cell px-4 py-3.5 sm:px-5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      Category
                    </th>
                    <th className="px-4 py-3.5 sm:px-5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      Quantity
                    </th>
                    <th className="px-4 py-3.5 sm:px-5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      Shelf Life
                    </th>
                    <th className="px-4 py-3.5 sm:px-5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      Status
                    </th>
                    <th className="px-4 py-3.5 sm:px-5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--app-border-subtle)]">
                  {processedInventory.map((item, idx) => (
                    <ProductCatalogRow
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.includes(item.id)}
                      isActiveInDrawer={activeDrawerProduct?.id === item.id}
                      onSelectProduct={(clickedItem) =>
                        setActiveDrawerProduct(clickedItem)
                      }
                      onToggleSelect={handleToggleSelect}
                      onQuickUse={handleOpenConsume}
                      onDelete={handleDeleteSingle}
                      isBusiness={isBusiness}
                      index={idx}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Slide-Over Drawer */}
      <ProductDetailDrawer
        item={activeDrawerProduct}
        onClose={() => setActiveDrawerProduct(null)}
        onRefresh={() => router.refresh()}
        onEdit={(item) => router.push(`${prefix}/inventory/${item.id}/edit`)}
        onDelete={handleDeleteSingle}
        isBusiness={isBusiness}
      />

      {/* Manual Consume Item Dialog */}
      {consumeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative flex flex-col w-full max-w-sm rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="sl-display-serif text-lg font-bold text-[var(--app-text-display)]">
                Use {consumeItem.name}
              </h3>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                Record how much you are consuming. Stock will be adjusted accordingly.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--app-text-body)] block">
                Quantity to use (Max: {consumeItem.quantity} {consumeItem.unit})
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={1}
                  max={consumeItem.quantity}
                  value={consumeQty}
                  onChange={(e) =>
                    setConsumeQty(
                      Math.min(
                        consumeItem.quantity,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                  className="sl-focus-ring flex-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-3.5 py-2 text-sm text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                />
                <span className="text-sm font-semibold text-[var(--app-text-muted)]">
                  {consumeItem.unit}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConsumeItem(null)}
                className="sl-focus-ring cursor-pointer rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-4 py-2 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-border-subtle)]/40 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConsume}
                disabled={isConsuming}
                className="sl-focus-ring cursor-pointer rounded-xl bg-[var(--app-accent-emerald)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105 disabled:opacity-50 transition"
              >
                {isConsuming ? "Recording..." : "Confirm Consumption"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          isDestructive={confirmDialog.isDestructive}
          confirmLabel={confirmDialog.isDestructive ? "Delete" : "Confirm"}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}

export default function InventoryView(props: InventoryViewProps) {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <InventoryViewInner {...props} />
      </Suspense>
    </ToastProvider>
  );
}
