"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Utensils,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Flame,
} from "lucide-react";
import { getDaysUntilExpiry, formatExpiry } from "@/lib/format-expiry";
import ProductImage from "@/components/inventory/ProductImage";
import type { InventoryItem } from "@/lib/inventory";

interface ProductCatalogCardProps {
  item: InventoryItem & { status: string; createdAt?: string };
  isSelected?: boolean;
  isActiveInDrawer?: boolean;
  onSelectProduct?: (item: InventoryItem & { status: string; createdAt?: string }) => void;
  onToggleSelect?: (id: number) => void;
  onQuickUse?: (item: InventoryItem) => void;
  onDelete?: (id: number) => void;
  isBusiness?: boolean;
  index?: number;
}

export default function ProductCatalogCard({
  item,
  isSelected = false,
  isActiveInDrawer = false,
  onSelectProduct,
  onToggleSelect,
  onQuickUse,
  onDelete,
  isBusiness = false,
  index = 0,
}: ProductCatalogCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";
  const days = getDaysUntilExpiry(item.expiryDate);

  // Compute compact freshness badge text and style matching reference image
  let badgeText = item.status;
  let    badgeClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";

  if (item.status === "Low Stock") {
    badgeText = "Low Stock";
    badgeClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
  } else if (item.status === "Expired") {
    badgeText = "Expired";
    badgeClass = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
  } else if (item.status === "Expiring") {
    if (days <= 1) {
      badgeText = days === 0 ? "Today" : "1 day";
      badgeClass = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
    } else {
      badgeText = `${days} days`;
      badgeClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    }
  } else if (item.status === "Fresh") {
    badgeText = "Fresh";
    badgeClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking action buttons or menu, don't trigger card selection
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) {
      return;
    }
    if (onSelectProduct) {
      onSelectProduct(item);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer select-none ${
        isActiveInDrawer || isSelected
          ? "border-[var(--app-accent-emerald)] ring-1 ring-[var(--app-accent-emerald)] bg-[var(--app-surface-elevated)] shadow-lg shadow-emerald-900/10"
          : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] hover:border-[var(--app-border-strong)] hover:shadow-md"
      }`}
    >
      {/* Top Header: Select Checkbox / FIFO badge & More (...) Menu */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(item.id);
              }}
              aria-label={`Select ${item.name}`}
              className="text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] transition"
            >
              {isSelected ? (
                <CheckSquare size={16} className="text-[var(--app-accent-emerald)]" />
              ) : (
                <Square size={16} />
              )}
            </button>
          )}

          {isBusiness && index === 0 && (
            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <Flame size={10} />
              FIFO #1
            </span>
          )}
        </div>

        {/* More Options Dropdown (...) */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            aria-label={`Options for ${item.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-display)] transition"
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-30 w-38 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
            >
              {onQuickUse && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onQuickUse(item);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--app-accent-emerald)] hover:bg-[var(--app-accent-emerald)]/10 transition cursor-pointer"
                >
                  <Utensils size={13} />
                  <span>Use Portion</span>
                </button>
              )}

              <Link
                href={`${prefix}/inventory/${item.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition"
              >
                <span>View Dossier</span>
              </Link>

              <Link
                href={`${prefix}/inventory/${item.id}/edit`}
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition"
              >
                <Edit2 size={13} />
                <span>Edit Product</span>
              </Link>

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(item.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Visual Stage: Centered Product Photography */}
      <div className="relative my-2 flex h-40 sm:h-44 w-full items-center justify-center">
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          category={item.category}
          className="h-full w-full"
          size="md"
        />
      </div>

      {/* Bottom Information Zone: Product Name, Category/Quantity & Compact Status */}
      <div className="pt-2 border-t border-[var(--app-border-subtle)]">
        <h3 className="truncate font-bold text-sm sm:text-base text-[var(--app-text-display)] tracking-tight">
          {item.name}
        </h3>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[var(--app-text-muted)]">
              {item.category}
            </p>
            <p className="truncate text-xs font-normal text-[var(--app-text-muted)]/80">
              {item.quantity} {item.unit}
            </p>
          </div>

          {/* Compact Status Pill */}
          <span
            className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide ${badgeClass}`}
          >
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
}
