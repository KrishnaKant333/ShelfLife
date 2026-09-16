"use client";

import { useState } from "react";
import { Search, Grid2X2, List, X, ArrowUpDown, Filter, CheckSquare } from "lucide-react";

export type FilterType = "All" | "Fresh" | "Expiring" | "Low Stock" | "Expired";
export type SortType =
  | "expiry-asc"
  | "expiry-desc"
  | "name-asc"
  | "name-desc"
  | "qty-asc"
  | "qty-desc"
  | "date-added";

interface InventoryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  filterCounts: Record<FilterType, number>;
  isSelectMode?: boolean;
  onToggleSelectMode?: () => void;
  selectedCount?: number;
}

export default function InventoryToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filterCounts,
  isSelectMode = false,
  onToggleSelectMode,
  selectedCount = 0,
}: InventoryToolbarProps) {
  const [showSearchBox, setShowSearchBox] = useState(Boolean(searchQuery));
  const filterOptions: FilterType[] = ["All", "Fresh", "Expiring", "Low Stock", "Expired"];

  return (
    <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[var(--app-surface-base)]/95 backdrop-blur-md border-b border-[var(--app-border-subtle)] transition-colors">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Filter Pills Group */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar touch-pan-x">
          {filterOptions.map((filter) => {
            const count = filterCounts[filter] || 0;
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 min-h-[40px] sm:min-h-[36px] text-xs font-semibold whitespace-nowrap transition cursor-pointer select-none ${
                  isActive
                    ? "bg-[var(--app-accent-emerald)] text-white shadow-xs"
                    : "border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] hover:border-[var(--app-border-strong)]"
                }`}
              >
                <span>{filter}</span>
                <span
                  className={`sl-tabular-num text-[11px] font-bold rounded-md px-1.5 py-0.2 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--app-surface-base)] text-[var(--app-text-muted)] border border-[var(--app-border-subtle)]/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Search Box / Toggle, View Mode & Sort Dropdown */}
        <div className="flex items-center justify-between lg:justify-end gap-2 shrink-0">
          {/* Collapsible / Expanding Search Bar */}
          {showSearchBox ? (
            <div className="relative flex items-center min-w-[180px] sm:min-w-[240px]">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
              />
              <input
                type="text"
                autoFocus
                placeholder="Search food..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] pl-8 pr-7 text-xs text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)] outline-none focus:border-[var(--app-accent-emerald)]"
              />
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                  setShowSearchBox(false);
                }}
                aria-label="Close search"
                className="absolute right-2 text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] p-1"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSearchBox(true)}
              aria-label="Search items"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] hover:border-[var(--app-border-strong)] transition"
            >
              <Search size={15} />
            </button>
          )}

          {/* Multi-Select Toggle Button (Spec 04 Section 7 Batch Selection) */}
          {onToggleSelectMode && (
            <button
              type="button"
              onClick={onToggleSelectMode}
              aria-label={isSelectMode ? "Exit multi-select mode" : "Enter multi-select mode"}
              title={isSelectMode ? "Exit select mode" : "Select multiple items"}
              className={`flex h-10 px-3 items-center gap-1.5 rounded-xl border text-xs font-semibold transition shrink-0 cursor-pointer ${
                isSelectMode
                  ? "border-[var(--app-accent-emerald)] bg-[var(--app-accent-emerald)] text-white shadow-2xs"
                  : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] hover:border-[var(--app-border-strong)]"
              }`}
            >
              <CheckSquare size={14} />
              <span className="hidden sm:inline">{isSelectMode ? "Selecting" : "Select"}</span>
              {selectedCount > 0 && (
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isSelectMode ? "bg-white/20 text-white" : "bg-[var(--app-accent-emerald)] text-white"}`}>
                  {selectedCount}
                </span>
              )}
            </button>
          )}

          {/* List / Grid Toggle */}
          <div className="flex items-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-1 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              aria-label="Grid view"
              className={`rounded-lg h-8 w-8 flex items-center justify-center transition ${
                viewMode === "grid"
                  ? "bg-[var(--app-accent-emerald)] text-white shadow-2xs font-bold"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text-display)]"
              }`}
            >
              <Grid2X2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              aria-label="List view"
              className={`rounded-lg h-8 w-8 flex items-center justify-center transition ${
                viewMode === "list"
                  ? "bg-[var(--app-accent-emerald)] text-white shadow-2xs font-bold"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text-display)]"
              }`}
            >
              <List size={15} />
            </button>
          </div>

          {/* Sort Selector Dropdown */}
          <div className="relative flex items-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2.5 py-1.5 text-xs font-medium text-[var(--app-text-display)] shrink-0 hover:border-[var(--app-border-strong)] transition">
            <ArrowUpDown size={13} className="text-[var(--app-text-muted)]" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortType)}
              aria-label="Sort inventory"
              className="bg-transparent border-none outline-none font-semibold cursor-pointer text-xs text-[var(--app-text-display)]"
            >
              <option value="expiry-asc" className="bg-[var(--app-surface-elevated)] text-[var(--app-text-display)]">
                Sort: Nearest Expiry
              </option>
              <option value="expiry-desc" className="bg-[var(--app-surface-elevated)] text-[var(--app-text-display)]">
                Sort: Latest Expiry
              </option>
              <option value="name-asc" className="bg-[var(--app-surface-elevated)] text-[var(--app-text-display)]">
                Sort: Name (A-Z)
              </option>
              <option value="name-desc" className="bg-[var(--app-surface-elevated)] text-[var(--app-text-display)]">
                Sort: Name (Z-A)
              </option>
              <option value="qty-asc" className="bg-[var(--app-surface-elevated)] text-[var(--app-text-display)]">
                Sort: Qty (Low to High)
              </option>
              <option value="qty-desc" className="bg-[var(--app-surface-elevated)] text-[var(--app-text-display)]">
                Sort: Qty (High to Low)
              </option>
              <option value="date-added" className="bg-[var(--app-surface-elevated)] text-[var(--app-text-display)]">
                Sort: Recently Added
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
