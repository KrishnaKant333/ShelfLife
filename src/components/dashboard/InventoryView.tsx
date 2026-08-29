"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, FileText, Upload, Calendar } from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";
import { formatExpiry } from "@/lib/format-expiry";
import DeleteProductButton from "@/components/dashboard/DeleteProductButton";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

interface InventoryViewProps {
  initialInventory: InventoryItem[];
  isBusiness?: boolean;
}

export default function InventoryView({ initialInventory, isBusiness = false }: InventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Expired" | "Fresh" | "Expiring" | "Low Stock">("All");

  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  // Filter and search logic
  const filteredInventory = initialInventory.filter((item) => {
    const status = getInventoryStatus(item.quantity, item.expiryDate);
    
    // Search match
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter match
    const matchesFilter =
      activeFilter === "All" || status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const statusStyles = {
    Expired: "bg-red-50 text-[var(--shelf-terracotta)] border-red-200",
    Fresh: "bg-green-50 text-green-700 border-green-200",
    Expiring: "bg-amber-50 text-amber-700 border-amber-200",
    "Low Stock": "bg-red-50 text-[var(--shelf-terracotta)] border-red-200",
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[var(--shelf-forest)]">
            Inventory
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
            {isBusiness ? "Business Shelf" : "Your Products"}
          </h1>
          <p className="mt-2 text-sm text-[var(--shelf-muted)]">
            Manage and track freshness, stock quantity, and expiry alerts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`${prefix}/inventory/new?tab=import`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--shelf-border)] px-4 py-2.5 text-sm font-semibold bg-white text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
          >
            <Upload size={16} />
            Import
          </Link>
          <Link
            href={`${prefix}/inventory/new`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 shadow-xs"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Toolbar - Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--shelf-surface)] border border-[var(--shelf-border)] p-4 rounded-2xl shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-3 flex items-center text-[var(--shelf-muted)]">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 py-2.5 pl-10 pr-4 text-sm text-[var(--shelf-dark)] outline-none focus:border-[var(--shelf-forest)] focus:bg-[var(--shelf-surface)] transition"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-[var(--shelf-cream)]/50 p-1 rounded-xl border border-[var(--shelf-border)]/50">
          {(["All", "Expired", "Fresh", "Expiring", "Low Stock"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide uppercase transition ${
                activeFilter === filter
                  ? "bg-white text-[var(--shelf-forest)] shadow-xs"
                  : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Product Display */}
      {initialInventory.length === 0 ? (
        /* Entire Shelf Empty State */
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
            <Plus size={28} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[var(--shelf-dark)]">Your shelf is empty</h3>
          <p className="mt-2 text-sm text-[var(--shelf-muted)] max-w-md mx-auto">
            Add your first product manually or upload an invoice/CSV sheet to start tracking freshness and expiry.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={`${prefix}/inventory/new`}
              className="rounded-xl bg-[var(--shelf-forest)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Add Product
            </Link>
          </div>
        </div>
      ) : filteredInventory.length === 0 ? (
        /* Search Filter Empty State */
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-10 text-center shadow-xs">
          <p className="text-sm font-semibold text-[var(--shelf-dark)]">No products found</p>
          <p className="mt-1 text-xs text-[var(--shelf-muted)]">
            Try adjusting your search query or switching your status filter tab.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveFilter("All");
            }}
            className="mt-4 text-xs font-semibold text-[var(--shelf-forest)] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Product</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Category</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Quantity</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Expiry</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const status = getInventoryStatus(item.quantity, item.expiryDate);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-[var(--shelf-border)] last:border-0 hover:bg-[var(--shelf-cream)]/5 transition duration-150"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-[var(--shelf-dark)]">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--shelf-muted)] font-medium">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">
                          {formatExpiry(item.expiryDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <Link
                              href={`${prefix}/inventory/${item.id}/edit`}
                              className="text-sm font-semibold text-[var(--shelf-forest)] hover:underline"
                            >
                              Edit
                            </Link>
                            <DeleteProductButton id={item.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile responsive Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {filteredInventory.map((item) => {
              const status = getInventoryStatus(item.quantity, item.expiryDate);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[var(--shelf-sage)] transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-[var(--shelf-dark)] leading-tight">{item.name}</h4>
                      <p className="mt-1 text-xs text-[var(--shelf-muted)]">{item.category}</p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusStyles[status]}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-[var(--shelf-border)]/50 py-3">
                    <div>
                      <p className="text-[var(--shelf-muted)] font-medium">Stock level</p>
                      <p className="font-bold text-[var(--shelf-dark)] mt-0.5">{item.quantity} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-[var(--shelf-muted)] font-medium">Shelf freshness</p>
                      <p className="font-bold text-[var(--shelf-dark)] mt-0.5 flex items-center gap-1">
                        <Calendar size={13} className="text-[var(--shelf-forest)]" />
                        {formatExpiry(item.expiryDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-[var(--shelf-muted)] font-mono">ID: #{item.id}</span>
                    <div className="flex gap-4">
                      <Link
                        href={`${prefix}/inventory/${item.id}/edit`}
                        className="text-xs font-bold text-[var(--shelf-forest)] hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={item.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
