"use client";

import {
  ChevronRight,
  Flame,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { getDaysUntilExpiry } from "@/lib/format-expiry";
import ProductImage from "@/components/inventory/ProductImage";
import type { InventoryItem } from "@/lib/inventory";

interface MobileInventoryRowProps {
  item: InventoryItem & { status: string; createdAt?: string };
  isSelected: boolean;
  isActiveInDrawer?: boolean;
  isSelectMode?: boolean;
  onSelectProduct?: (item: InventoryItem & { status: string; createdAt?: string }) => void;
  onToggleSelect?: (id: number) => void;
  onQuickUse?: (item: InventoryItem) => void;
  onDelete?: (id: number) => void;
  isBusiness?: boolean;
  index?: number;
}

export default function MobileInventoryRow({
  item,
  isSelected,
  isActiveInDrawer = false,
  isSelectMode = false,
  onSelectProduct,
  onToggleSelect,
  isBusiness = false,
  index = 0,
}: MobileInventoryRowProps) {
  const days = getDaysUntilExpiry(item.expiryDate);
  const isEstimated = item.expiryType === "AI_ESTIMATED";
  const isLowStock = item.status === "Low Stock";

  // Derive expiration chip text and styling matching Spec 04 Section 5
  let expiryLabel = "No date";
  let expiryStyle = "bg-[var(--app-surface-base)] text-[var(--app-text-muted)] border-[var(--app-border-subtle)]";

  if (Number.isFinite(days)) {
    if (days < 0) {
      const absDays = Math.abs(days);
      expiryLabel = absDays === 1 ? "Expired 1d ago" : `Expired ${absDays}d ago`;
      expiryStyle = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold";
    } else if (days === 0) {
      expiryLabel = "Expires today";
      expiryStyle = "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 font-bold";
    } else if (days <= 3) {
      expiryLabel = isEstimated ? `Est. ${days}d` : `In ${days} ${days === 1 ? "day" : "days"}`;
      expiryStyle = isEstimated
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-dashed border-amber-500/40 font-semibold"
        : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold";
    } else {
      expiryLabel = isEstimated ? `Est. ${days}d` : `In ${days}d`;
      expiryStyle = isEstimated
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-dashed border-emerald-500/40 font-medium"
        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium";
    }
  }

  const handleRowClick = (e: React.MouseEvent) => {
    // If clicking on an action button, do not bubble to row drawer trigger
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) {
      return;
    }
    if (isSelectMode && onToggleSelect) {
      onToggleSelect(item.id);
      return;
    }
    if (onSelectProduct) {
      onSelectProduct(item);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (isSelectMode && onToggleSelect) {
            onToggleSelect(item.id);
          } else if (onSelectProduct) {
            onSelectProduct(item);
          }
        }
      }}
      aria-label={`View details for ${item.name}`}
      className={`group relative flex min-h-[66px] items-center gap-3 px-3.5 py-2.5 transition-colors cursor-pointer select-none active:bg-[var(--app-surface-base)] ${
        isActiveInDrawer
          ? "bg-[var(--app-accent-emerald)]/10 border-l-3 border-l-[var(--app-accent-emerald)]"
          : isSelected
          ? "bg-[var(--app-accent-emerald)]/5"
          : "hover:bg-[var(--app-surface-base)]/60"
      }`}
    >
      {/* Batch Select Checkbox (Appears when in select mode or item selected) */}
      {(isSelectMode || isSelected) && onToggleSelect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(item.id);
          }}
          aria-label={`Select ${item.name}`}
          aria-pressed={isSelected}
          className="sl-focus-ring flex h-11 w-9 items-center justify-center -ml-1 text-[var(--app-text-muted)] hover:text-[var(--app-text-body)] shrink-0 transition"
        >
          {isSelected ? (
            <CheckSquare size={18} className="text-[var(--app-accent-emerald)]" />
          ) : (
            <Square size={18} />
          )}
        </button>
      )}

      {/* Compact Thumbnail (48x48px, locked aspect ratio) */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] shadow-2xs">
        <ProductImage
          src={item.imageUrl}
          alt={item.name}
          category={item.category}
          className="h-full w-full object-cover"
          size="sm"
        />
      </div>

      {/* Product Identity & Context */}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-[var(--app-text-display)] group-hover:text-[var(--app-accent-emerald)] transition">
            {item.name}
          </span>
          {isBusiness && index === 0 && (
            <span
              title="First In, First Out Priority"
              className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0"
            >
              <Flame size={10} />
              FIFO
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[var(--app-text-muted)] truncate mt-0.5">
          <span className="truncate">{item.category}</span>
          {isLowStock && (
            <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600 dark:text-amber-400 shrink-0">
              • <AlertCircle size={10} /> Low
            </span>
          )}
          {isEstimated && (
            <span
              title="AI-estimated expiry date"
              className="inline-flex items-center gap-0.5 text-amber-600/90 dark:text-amber-400/90 shrink-0"
            >
              • <Sparkles size={10} /> Est
            </span>
          )}
        </div>
      </div>

      {/* Quantity & Expiry Chip (Right cluster) */}
      <div className="flex flex-col items-end justify-center shrink-0 gap-1 pl-1">
        {/* Quantity Display */}
        <div className="sl-tabular-num text-sm font-mono font-bold text-[var(--app-text-display)] leading-none">
          {item.quantity}{" "}
          <span className="text-xs font-normal font-sans text-[var(--app-text-muted)]">
            {item.unit}
          </span>
        </div>

        {/* Expiration Status Badge */}
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] tracking-tight shrink-0 transition ${expiryStyle}`}
        >
          {expiryLabel}
        </span>
      </div>

      {/* Far Right: Touch Target Chevron (≥ 44px hit area) */}
      <div
        aria-hidden="true"
        className="flex h-11 w-7 items-center justify-end text-[var(--app-text-muted)] group-hover:text-[var(--app-accent-emerald)] group-hover:translate-x-0.5 transition shrink-0"
      >
        <ChevronRight size={16} />
      </div>
    </div>
  );
}
