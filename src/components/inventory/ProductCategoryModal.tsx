"use client";

import { useState, useMemo } from "react";
import { Folder, Check, Plus, Search, Layers } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import { updateProductCategoryAction } from "@/lib/actions/inventory";
import { useToast } from "@/components/ui/Toast";
import type { InventoryItem } from "@/lib/inventory";

const STANDARD_CATEGORIES = [
  "Produce",
  "Dairy",
  "Bakery",
  "Meat & Seafood",
  "Pantry",
  "Frozen",
  "Beverages",
  "Snacks",
  "Condiments",
  "Canned Goods",
  "Spices & Seasonings",
  "Prepared Foods",
];

interface ProductCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  existingCategories?: string[];
  onSuccess: (newCategory: string) => void;
}

export default function ProductCategoryModal({
  isOpen,
  onClose,
  item,
  existingCategories = [],
  onSuccess,
}: ProductCategoryModalProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newCustomCat, setNewCustomCat] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine standard and existing custom categories
  const allCategories = useMemo(() => {
    const set = new Set<string>(STANDARD_CATEGORIES);
    existingCategories.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    if (item.category) set.add(item.category.trim());
    return Array.from(set);
  }, [existingCategories, item.category]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCategories;
    return allCategories.filter((c) => c.toLowerCase().includes(q));
  }, [allCategories, searchQuery]);

  const handleSelectCategory = async (cat: string) => {
    const target = cat.trim();
    if (!target || target === item.category) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProductCategoryAction(item.id, target);
      if (res.success && res.category) {
        showToast(`Moved ${item.name} to ${res.category}`, "success");
        onSuccess(res.category);
        onClose();
      } else {
        showToast(res.error || "Failed to move category.", "error");
      }
    } catch {
      showToast("An error occurred while reassigning category.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomCat.trim()) return;
    await handleSelectCategory(newCustomCat.trim());
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Move Category: ${item.name}`}
      description={`Currently organized under "${item.category}".`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] pl-8 pr-3 text-xs text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)] outline-none focus:border-[var(--app-accent-emerald)]"
          />
        </div>

        {/* Category List */}
        <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-1.5 scrollbar-thin">
          {filteredCategories.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--app-text-muted)]">
              No categories match &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isCurrent = cat.toLowerCase() === item.category.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSelectCategory(cat)}
                  className={`sl-focus-ring flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer min-h-[38px] ${
                    isCurrent
                      ? "bg-[var(--app-accent-emerald)]/10 text-[var(--app-accent-emerald)] font-bold"
                      : "text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers size={13} className={isCurrent ? "text-[var(--app-accent-emerald)]" : "text-[var(--app-text-muted)]"} />
                    <span>{cat}</span>
                  </span>
                  {isCurrent && <Check size={14} className="text-[var(--app-accent-emerald)]" />}
                </button>
              );
            })
          )}
        </div>

        {/* Inline Create New Category */}
        <form onSubmit={handleCreateNew} className="pt-1">
          <label className="block text-[11px] font-semibold text-[var(--app-text-body)] mb-1.5">
            + Add New Custom Category
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Cellar, Freezer Chest, Baking"
              value={newCustomCat}
              onChange={(e) => setNewCustomCat(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3.5 py-2 text-xs text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)] outline-none focus:border-[var(--app-accent-emerald)]"
            />
            <button
              type="submit"
              disabled={!newCustomCat.trim() || isSubmitting}
              className="sl-focus-ring flex h-9 items-center gap-1 rounded-xl bg-[var(--app-accent-emerald)] px-3.5 text-xs font-bold text-white shadow-2xs hover:brightness-105 disabled:opacity-40 transition cursor-pointer shrink-0"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Bottom Dismiss */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="sl-focus-ring w-full rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-2.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
