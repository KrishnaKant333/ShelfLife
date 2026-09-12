"use client";

import Link from "next/link";
import { Plus, Upload, Search, PackageOpen, RefreshCw } from "lucide-react";

interface EmptyShelfProps {
  isBusiness?: boolean;
}

export function EmptyShelf({ isBusiness = false }: EmptyShelfProps) {
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  return (
    <div className="sl-editorial-card flex flex-col items-center justify-center p-12 text-center my-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] text-[var(--app-accent-emerald)] shadow-sm mb-4">
        <PackageOpen size={30} strokeWidth={1.75} />
      </div>

      <h3 className="sl-display-serif text-xl font-bold text-[var(--app-text-display)]">
        {isBusiness ? "Business catalog is empty" : "Your pantry is clean and empty"}
      </h3>

      <p className="mt-2 text-sm text-[var(--app-text-muted)] max-w-md mx-auto leading-relaxed">
        Start tracking stock quantities, shelf freshness, and smart consumption insights by adding your first product or importing an existing inventory.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`${prefix}/inventory/new`}
          className="sl-focus-ring inline-flex items-center gap-2 rounded-xl bg-[var(--app-accent-emerald)] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-105"
        >
          <Plus size={16} />
          <span>Add First Product</span>
        </Link>

        <Link
          href={`${prefix}/inventory/new?tab=import`}
          className="sl-focus-ring inline-flex items-center gap-2 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-4 py-2.5 text-sm font-semibold text-[var(--app-text-body)] transition hover:bg-[var(--app-surface-base)]"
        >
          <Upload size={16} />
          <span>Import CSV / Sheet</span>
        </Link>
      </div>
    </div>
  );
}

interface EmptySearchProps {
  searchQuery: string;
  activeFilter: string;
  onReset: () => void;
}

export function EmptySearch({ searchQuery, activeFilter, onReset }: EmptySearchProps) {
  return (
    <div className="sl-editorial-card flex flex-col items-center justify-center p-10 text-center my-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] text-[var(--app-text-muted)] mb-3">
        <Search size={22} />
      </div>

      <h3 className="text-base font-bold text-[var(--app-text-display)]">
        No matching inventory products
      </h3>

      <p className="mt-1.5 text-xs text-[var(--app-text-muted)] max-w-sm mx-auto">
        {searchQuery ? (
          <>No items matched your query &ldquo;<span className="font-semibold text-[var(--app-text-body)]">{searchQuery}</span>&rdquo;</>
        ) : (
          <>No products found under the &ldquo;<span className="font-semibold text-[var(--app-text-body)]">{activeFilter}</span>&rdquo; filter</>
        )}
        . Try checking for spelling errors or clearing your filter criteria.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="sl-focus-ring mt-5 inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-4 py-2 text-xs font-semibold text-[var(--app-accent-emerald)] hover:bg-[var(--app-accent-emerald)]/10 transition"
      >
        <RefreshCw size={13} />
        <span>Reset Filters & Search</span>
      </button>
    </div>
  );
}

export function CatalogSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="sl-editorial-card overflow-hidden">
        <div className="animate-pulse divide-y divide-[var(--app-border-subtle)]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded bg-[var(--app-surface-base)]" />
                <div className="h-8 w-8 rounded-lg bg-[var(--app-surface-base)]" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded bg-[var(--app-surface-base)]" />
                  <div className="h-3 w-16 rounded bg-[var(--app-surface-base)]" />
                </div>
              </div>
              <div className="h-4 w-20 rounded bg-[var(--app-surface-base)]" />
              <div className="h-5 w-16 rounded-md bg-[var(--app-surface-base)]" />
              <div className="h-7 w-24 rounded-md bg-[var(--app-surface-base)]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="sl-editorial-card p-5 animate-pulse space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-[var(--app-surface-base)]" />
              <div className="h-9 w-9 rounded-lg bg-[var(--app-surface-base)]" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-[var(--app-surface-base)]" />
                <div className="h-3 w-16 rounded bg-[var(--app-surface-base)]" />
              </div>
            </div>
            <div className="h-5 w-14 rounded-md bg-[var(--app-surface-base)]" />
          </div>
          <div className="h-14 rounded-lg bg-[var(--app-surface-base)]" />
          <div className="flex items-center justify-between pt-2 border-t border-[var(--app-border-subtle)]">
            <div className="h-7 w-20 rounded bg-[var(--app-surface-base)]" />
            <div className="h-4 w-12 rounded bg-[var(--app-surface-base)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
