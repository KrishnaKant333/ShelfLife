"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Utensils,
  Edit2,
  Trash2,
  Sparkles,
  Flame,
  Layers,
  Package,
  Calendar,
  Building2,
  BadgePercent,
  Clock,
} from "lucide-react";
import ProductImage from "@/components/inventory/ProductImage";
import { formatExpiry, getDaysUntilExpiry } from "@/lib/format-expiry";
import type { InventoryItem } from "@/lib/inventory";

interface ProductDossierHeroProps {
  item: InventoryItem & { status: string; createdAt?: string | Date | null };
  isBusiness?: boolean;
  fifoRank?: number;
  onOpenConsume: () => void;
  onDelete: () => void;
}

export default function ProductDossierHero({
  item,
  isBusiness = false,
  fifoRank = 1,
  onOpenConsume,
  onDelete,
}: ProductDossierHeroProps) {
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";
  const days = getDaysUntilExpiry(item.expiryDate);

  // Authoritative status badge styling
  let statusBadgeText = "Peak Freshness";
  let statusBadgeClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";

  if (item.status === "Expired" || (Number.isFinite(days) && days < 0)) {
    statusBadgeText = "Lifecycle Concluded";
    statusBadgeClass = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
  } else if (item.status === "Expiring" || (Number.isFinite(days) && days <= 3)) {
    statusBadgeText = days <= 1 ? "Action Required: Urgent" : "Action Required: 48h Window";
    statusBadgeClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
  } else if (item.status === "Low Stock") {
    statusBadgeText = "Stock Replenishment Advisory";
    statusBadgeClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
  }

  return (
    <div className="space-y-4">
      {/* Editorial Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`${prefix}/inventory`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] transition"
        >
          <ChevronLeft size={16} />
          <span>Back to Inventory</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="rounded-md border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2 py-0.5 font-mono text-[10px] text-[var(--app-text-muted)]">
            ASSET-ID: #SL-{item.id}
          </span>
          {isBusiness && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
              <Flame size={10} />
              FIFO Rank #{fifoRank}
            </span>
          )}
        </div>
      </div>

      {/* Main Dossier Hero Card */}
      <div className="sl-editorial-card p-5 sm:p-7 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Flagship Visual Stage */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="relative h-56 sm:h-64 lg:h-72 w-full rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-4 shadow-sm flex items-center justify-center overflow-hidden">
              <ProductImage
                src={item.imageUrl}
                alt={item.name}
                category={item.category}
                className="h-full w-full"
                size="lg"
                priority
              />

              {/* Digital Twin Watermark */}
              <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-[var(--app-surface-elevated)]/80 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold tracking-wider text-[var(--app-text-muted)] border border-[var(--app-border-subtle)]">
                DIGITAL TWIN
              </div>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Status, and Action Controls */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-2.5 py-1 text-xs font-semibold text-[var(--app-text-muted)]">
                  <Layers size={13} className="text-[var(--app-accent-emerald)]" />
                  <span>{item.category}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide ${statusBadgeClass}`}
                >
                  <span>{statusBadgeText}</span>
                </span>
              </div>

              {/* Editorial Title */}
              <h1 className="sl-display-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--app-text-display)]">
                {item.name}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[var(--app-text-muted)] font-medium">
                {isBusiness ? "Commercial Stock Unit" : "Pantry Item"} · Registered in ShelfLife Food Intelligence System
              </p>
            </div>

            {/* Metric Specification Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                  Current Stock
                </span>
                <p className="mt-1 text-sm sm:text-base font-bold text-[var(--app-text-display)] flex items-center gap-1.5">
                  <Package size={14} className="text-[var(--app-accent-emerald)] shrink-0" />
                  <span className="sl-tabular-num">{item.quantity}</span>
                  <span className="text-xs font-medium text-[var(--app-text-muted)]">{item.unit}</span>
                </p>
              </div>

              <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                  Expiration
                </span>
                <p className="mt-1 text-sm sm:text-base font-bold text-[var(--app-text-display)] truncate flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{formatExpiry(item.expiryDate)}</span>
                </p>
              </div>

              {isBusiness ? (
                <>
                  <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                      FIFO Queue
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-[var(--app-text-display)] flex items-center gap-1.5">
                      <Flame size={14} className="text-amber-500 shrink-0" />
                      <span>Priority #{fifoRank}</span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                      Estimated Asset Value
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-[var(--app-text-display)] flex items-center gap-1.5">
                      <BadgePercent size={14} className="text-[var(--app-accent-emerald)] shrink-0" />
                      <span>${(item.quantity * 4.5).toFixed(2)}</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                      Storage Area
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-[var(--app-text-display)] flex items-center gap-1.5 truncate">
                      <Clock size={14} className="text-[var(--app-accent-emerald)] shrink-0" />
                      <span>Standard Cold / Dry</span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                      Waste Avoidance
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-[var(--app-text-display)] flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--app-accent-emerald)]" />
                      <span>High Impact</span>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Primary Action Buttons Ribbon */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[var(--app-border-subtle)]">
              <button
                type="button"
                onClick={onOpenConsume}
                className="sl-focus-ring flex items-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-105 transition cursor-pointer"
              >
                <Utensils size={14} />
                <span>Log Consumption</span>
              </button>

              <Link
                href={`${prefix}/inventory/${item.id}/edit`}
                className="sl-focus-ring flex items-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] hover:bg-[var(--app-surface-elevated)] px-4 py-2.5 text-xs font-semibold text-[var(--app-text-body)] transition"
              >
                <Edit2 size={13} />
                <span>Edit Product</span>
              </Link>

              {!isBusiness && (
                <Link
                  href={`/dashboard/recipes?ingredient=${encodeURIComponent(item.name)}`}
                  className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] hover:bg-[var(--app-surface-elevated)] px-3.5 py-2.5 text-xs font-semibold text-[var(--app-text-body)] transition"
                >
                  <Sparkles size={13} className="text-[var(--app-accent-emerald)]" />
                  <span>Cook Recipes</span>
                </Link>
              )}

              <button
                type="button"
                onClick={onDelete}
                className="sl-focus-ring ml-auto flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Discard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
