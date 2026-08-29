"use client";

import { getInventoryStatus } from "@/lib/inventory-status";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

interface AnalyticsViewProps {
  inventory: InventoryItem[];
}

export default function AnalyticsView({ inventory }: AnalyticsViewProps) {
  const statuses = inventory.map((item) => getInventoryStatus(item.quantity, item.expiryDate));

  const total = inventory.length;
  const fresh = statuses.filter((s) => s === "Fresh").length;
  const expiring = statuses.filter((s) => s === "Expiring").length;
  const lowStock = statuses.filter((s) => s === "Low Stock").length;

  const health = total === 0 ? 100 : Math.round((fresh / total) * 100);

  // Group by category to find distribution
  const categories: Record<string, number> = {};
  inventory.forEach((item) => {
    const cat = item.category || "Uncategorized";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-[var(--shelf-blue)]">
          Analytics & Insights
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--shelf-dark)]">
          Inventory Intelligence
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Actionable metrics on fresh, expiring, and low-stock items.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Card */}
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm md:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-medium text-[var(--shelf-muted)]">
            Overall Health Score
          </h3>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-bold text-[var(--shelf-dark)] tracking-tight">
              {health}%
            </span>
            <span className="text-sm font-medium text-[var(--shelf-muted)]">
              Fresh Products
            </span>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
            <div
              className="h-full rounded-full bg-[var(--shelf-forest)] transition-all duration-500"
              style={{ width: `${health}%` }}
            />
          </div>
          <p className="mt-4 text-xs text-[var(--shelf-muted)]">
            Based on the proportion of fresh items currently tracked.
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
          <h3 className="text-sm font-medium text-[var(--shelf-muted)]">
            Status Breakdown
          </h3>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--shelf-border)] pb-2 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-[var(--shelf-muted)]">Fresh</span>
              <span className="rounded-full bg-green-50 border border-green-200 px-3 py-0.5 text-sm font-semibold text-green-700">
                {fresh}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--shelf-border)] pb-2 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-[var(--shelf-muted)]">Expiring Soon</span>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-sm font-semibold text-[var(--shelf-amber)]">
                {expiring}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-[var(--shelf-muted)]">Low Stock</span>
              <span className="rounded-full bg-red-50 border border-red-200 px-3 py-0.5 text-sm font-semibold text-[var(--shelf-terracotta)]">
                {lowStock}
              </span>
            </div>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
          <h3 className="text-sm font-medium text-[var(--shelf-muted)]">
            Top Categories
          </h3>
          <div className="mt-6 space-y-4">
            {sortedCategories.length === 0 ? (
              <p className="text-sm text-[var(--shelf-muted)] text-center py-6">
                No items category tracked yet.
              </p>
            ) : (
              sortedCategories.map(([cat, count]) => {
                const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[var(--shelf-dark)] truncate max-w-[150px]">{cat}</span>
                      <span className="text-[var(--shelf-muted)]">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                      <div
                        className="h-full rounded-full bg-[var(--shelf-sage)]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
