"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ListOrdered,
  Search,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { formatExpiry } from "@/lib/format-expiry";

export type FifoItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  daysLeft: number;
};

interface FifoPriorityQueueProps {
  items: FifoItem[];
}

type FilterTab = "all" | "critical" | "watch" | "stable";

function getPriorityBadge(daysLeft: number) {
  if (daysLeft < 0) {
    return {
      label: "EXPIRED",
      className: "bg-[var(--shelf-terracotta)]/15 text-[var(--shelf-terracotta)] border-[var(--shelf-terracotta)]/30",
    };
  }
  if (daysLeft <= 3) {
    return {
      label: "CRITICAL FIFO",
      className: "bg-[var(--shelf-terracotta)]/15 text-[var(--shelf-terracotta)] border-[var(--shelf-terracotta)]/30",
    };
  }
  if (daysLeft <= 7) {
    return {
      label: "HIGH ROTATION",
      className: "bg-[var(--shelf-amber)]/15 text-[var(--shelf-amber)] border-[var(--shelf-amber)]/30",
    };
  }
  if (daysLeft <= 14) {
    return {
      label: "MEDIUM WINDOW",
      className: "bg-[var(--shelf-blue)]/15 text-[var(--shelf-blue)] border-[var(--shelf-blue)]/30",
    };
  }
  return {
    label: "STABLE BUFFER",
    className: "bg-[var(--shelf-forest)]/15 text-[var(--shelf-forest)] border-[var(--shelf-forest)]/30",
  };
}

export function FifoPriorityQueue({ items }: FifoPriorityQueueProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === "critical" && !(item.daysLeft <= 3)) return false;
      if (activeTab === "watch" && !(item.daysLeft > 3 && item.daysLeft <= 7)) return false;
      if (activeTab === "stable" && !(item.daysLeft > 7)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        return matchesName || matchesCat;
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  return (
    <section aria-labelledby="fifo-queue-heading" className="rounded-3xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 sm:p-7 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3
            id="fifo-queue-heading"
            className="font-serif text-lg sm:text-xl font-bold text-[var(--shelf-dark)] flex items-center gap-2"
          >
            <ListOrdered className="h-5 w-5 text-[var(--shelf-forest)]" />
            First-In-First-Out (FIFO) Order Picking Sequence
          </h3>
          <p className="mt-1 text-xs text-[var(--shelf-muted)]">
            Strict sequence based on earliest expiration dates. Pick and dispatch from top to bottom.
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--shelf-muted)]" />
            <input
              type="text"
              placeholder="Filter by product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-dark)] focus:outline-hidden focus:border-[var(--shelf-forest)]"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeTab === "all"
                  ? "bg-[var(--shelf-surface)] text-[var(--shelf-dark)] shadow-xs"
                  : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("critical")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeTab === "critical"
                  ? "bg-[var(--shelf-surface)] text-[var(--shelf-terracotta)] shadow-xs"
                  : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
              }`}
            >
              &le;3 Days
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("watch")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeTab === "watch"
                  ? "bg-[var(--shelf-surface)] text-[var(--shelf-amber)] shadow-xs"
                  : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
              }`}
            >
              4–7 Days
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("stable")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                activeTab === "stable"
                  ? "bg-[var(--shelf-surface)] text-[var(--shelf-forest)] shadow-xs"
                  : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
              }`}
            >
              Stable
            </button>
          </div>
        </div>
      </div>

      {/* Table for Desktop */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)]">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[700px] text-left">
            <thead className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/50 text-[11px] font-bold uppercase tracking-wider text-[var(--shelf-muted)]">
              <tr>
                <th className="px-5 py-3">Sequence</th>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">In Stock</th>
                <th className="px-5 py-3">Expiry Horizon</th>
                <th className="px-5 py-3">FIFO Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--shelf-border)]/50 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-[var(--shelf-muted)]">
                    No matching inventory batches found for this filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const badge = getPriorityBadge(item.daysLeft);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[var(--shelf-cream)]/25 transition duration-150"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-[var(--shelf-muted)]">
                        #{idx + 1}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[var(--shelf-dark)]">
                        {item.name}
                      </td>
                      <td className="px-5 py-3.5 text-[var(--shelf-muted)]">
                        {item.category}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-[var(--shelf-dark)]">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[var(--shelf-dark)]">
                            {formatExpiry(item.expiryDate)}
                          </span>
                          <span className="block text-[10px] font-mono text-[var(--shelf-muted)]">
                            {item.daysLeft < 0
                              ? "Expired"
                              : item.daysLeft === 0
                              ? "Expires today"
                              : `${item.daysLeft} days remaining`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/business/dashboard/inventory/${item.id}/edit`}
                          className="inline-flex items-center gap-1 font-semibold text-[var(--shelf-forest)] hover:underline"
                        >
                          Update <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="space-y-2.5 p-3 md:hidden">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--shelf-muted)]">
              No inventory batches found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const badge = getPriorityBadge(item.daysLeft);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--shelf-muted)]">
                        Pick #{idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-[var(--shelf-dark)]">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[var(--shelf-muted)]">
                        {item.category} · {item.quantity} {item.unit}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--shelf-border)]/50 pt-2 text-xs">
                    <span className="text-[var(--shelf-muted)] font-mono">
                      Expiry: {formatExpiry(item.expiryDate)}
                    </span>
                    <Link
                      href={`/business/dashboard/inventory/${item.id}/edit`}
                      className="font-semibold text-[var(--shelf-forest)] hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
