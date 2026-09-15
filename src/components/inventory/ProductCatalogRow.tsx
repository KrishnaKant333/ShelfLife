"use client";

import Link from "next/link";
import {
  Clock,
  Utensils,
  Edit2,
  Trash2,
  Flame,
  CheckSquare,
  Square,
} from "lucide-react";
import { formatExpiry } from "@/lib/format-expiry";
import ProductImage from "@/components/inventory/ProductImage";
import type { InventoryItem } from "@/lib/inventory";

interface ProductCatalogRowProps {
  item: InventoryItem & { status: string; createdAt?: string };
  isSelected: boolean;
  isActiveInDrawer?: boolean;
  onSelectProduct?: (item: InventoryItem & { status: string; createdAt?: string }) => void;
  onToggleSelect: (id: number) => void;
  onQuickUse: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  isBusiness?: boolean;
  index?: number;
}

export default function ProductCatalogRow({
  item,
  isSelected,
  isActiveInDrawer = false,
  onSelectProduct,
  onToggleSelect,
  onQuickUse,
  onDelete,
  isBusiness = false,
  index = 0,
}: ProductCatalogRowProps) {
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  // Status badge styling with guaranteed non-wrapping properties
  const statusStyles: Record<string, string> = {
    Fresh: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    Expiring: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    Expired: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
    "Low Stock": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    "Not trackable": "bg-[var(--app-surface-base)] text-[var(--app-text-muted)] border-[var(--app-border-subtle)]",
  };

  const badgeClass = statusStyles[item.status] || statusStyles["Not trackable"];

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) {
      return;
    }
    if (onSelectProduct) {
      onSelectProduct(item);
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      className={`border-b border-[var(--app-border-subtle)] transition duration-150 last:border-0 cursor-pointer ${
        isActiveInDrawer
          ? "bg-[var(--app-accent-emerald)]/10 border-l-2 border-l-[var(--app-accent-emerald)]"
          : isSelected
          ? "bg-[var(--app-accent-emerald)]/5"
          : "hover:bg-[var(--app-surface-base)]/50"
      }`}
    >
      {/* Selection Checkbox */}
      <td className="w-12 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(item.id);
          }}
          aria-label={`Select ${item.name}`}
          aria-pressed={isSelected}
          className="sl-focus-ring flex items-center text-[var(--app-text-muted)] hover:text-[var(--app-text-body)] transition shrink-0"
        >
          {isSelected ? (
            <CheckSquare size={16} className="text-[var(--app-accent-emerald)]" />
          ) : (
            <Square size={16} />
          )}
        </button>
      </td>

      {/* Product Column with thumbnail */}
      <td className="px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3 min-w-[180px] max-w-[280px]">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] shadow-2xs">
            <ProductImage
              src={item.imageUrl}
              alt={item.name}
              category={item.category}
              className="h-full w-full"
              size="sm"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate block text-sm font-bold text-[var(--app-text-display)] hover:text-[var(--app-accent-emerald)] transition">
                {item.name}
              </span>
              {isBusiness && index === 0 && (
                <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  <Flame size={10} />
                  FIFO
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-[var(--app-text-muted)] truncate block sm:hidden">
              {item.category}
            </span>
          </div>
        </div>
      </td>

      {/* Category Column */}
      <td className="hidden sm:table-cell px-4 py-3 sm:px-5 whitespace-nowrap text-xs font-medium text-[var(--app-text-muted)]">
        {item.category}
      </td>

      {/* Quantity Column */}
      <td className="px-4 py-3 sm:px-5 whitespace-nowrap text-sm text-[var(--app-text-display)]">
        <span className="sl-tabular-num font-bold">{item.quantity}</span>{" "}
        <span className="text-xs font-normal text-[var(--app-text-muted)]">{item.unit}</span>
      </td>

      {/* Expiry Date Column */}
      <td className="px-4 py-3 sm:px-5 whitespace-nowrap text-xs text-[var(--app-text-muted)]">
        <span className="sl-tabular-num inline-flex items-center gap-1.5 font-medium">
          <Clock size={12} className="text-[var(--app-text-muted)]" />
          {formatExpiry(item.expiryDate)}
          {item.expiryType === "AI_ESTIMATED" && (
            <span
              className="text-[10px] font-semibold text-amber-600 dark:text-amber-400"
              title="Estimated freshness date"
            >
              (Est.)
            </span>
          )}
        </span>
      </td>

      {/* Guaranteed Non-Wrapping Status Capsule */}
      <td className="px-4 py-3 sm:px-5 whitespace-nowrap">
        <span
          className={`inline-flex items-center shrink-0 whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
        >
          {item.status}
        </span>
      </td>

      {/* Quick Actions Column */}
      <td className="px-4 py-3 sm:px-5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickUse(item);
            }}
            title="Consume portion"
            aria-label={`Consume ${item.name}`}
            className="sl-focus-ring flex h-7 items-center gap-1 rounded-md border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2 text-[11px] font-semibold text-[var(--app-accent-emerald)] hover:bg-[var(--app-accent-emerald)]/10 transition cursor-pointer"
          >
            <Utensils size={11} />
            <span>Use</span>
          </button>

          <Link
            href={`${prefix}/inventory/${item.id}`}
            onClick={(e) => e.stopPropagation()}
            title="View Product Dossier"
            aria-label={`View Dossier for ${item.name}`}
            className="sl-focus-ring flex h-7 items-center gap-1 rounded-md border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2 text-[11px] font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] hover:bg-[var(--app-surface-base)] transition"
          >
            <span className="hidden md:inline">Dossier</span>
          </Link>

          <Link
            href={`${prefix}/inventory/${item.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            title="Edit product"
            aria-label={`Edit ${item.name}`}
            className="sl-focus-ring flex h-7 items-center gap-1 rounded-md border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2 text-[11px] font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] hover:bg-[var(--app-surface-base)] transition"
          >
            <Edit2 size={11} />
            <span className="hidden md:inline">Edit</span>
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            title="Delete product"
            aria-label={`Delete ${item.name}`}
            className="sl-focus-ring flex h-7 w-7 items-center justify-center rounded-md border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}
