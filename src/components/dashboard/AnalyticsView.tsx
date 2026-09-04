"use client";

import { getInventoryStatus } from "@/lib/inventory-status";
import { getDaysUntilExpiry } from "@/lib/format-expiry";
import {
  BarChart3,
  Calendar,
  Layers,
  Activity,
  Package2,
  PieChart,
} from "lucide-react";

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
  const totalItems = inventory.length;

  // 1. Expiry Distribution Calculations
  let expired = 0;
  let critical = 0; // 0-3 days
  let warning = 0; // 4-7 days
  let short = 0; // 8-30 days
  let long = 0; // 30+ days
  let totalDaysLeft = 0;
  let countWithDays = 0;

  inventory.forEach((item) => {
    const days = getDaysUntilExpiry(item.expiryDate);
    totalDaysLeft += Math.max(0, days);
    countWithDays++;

    if (days < 0) {
      expired++;
    } else if (days <= 3) {
      critical++;
    } else if (days <= 7) {
      warning++;
    } else if (days <= 30) {
      short++;
    } else {
      long++;
    }
  });

  const avgDaysToExpiry = countWithDays > 0 ? Math.round(totalDaysLeft / countWithDays) : 0;

  // Percentage helper
  const pct = (val: number) => (totalItems > 0 ? Math.round((val / totalItems) * 100) : 0);

  // 2. Category Distribution (Count of items in each category)
  const categoryCounts: Record<string, number> = {};
  inventory.forEach((item) => {
    const cat = item.category || "Uncategorized";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryDistribution = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Quantity by Category (Sum of quantities in each category)
  const categoryQuantities: Record<string, number> = {};
  let totalQuantity = 0;
  inventory.forEach((item) => {
    const cat = item.category || "Uncategorized";
    categoryQuantities[cat] = (categoryQuantities[cat] || 0) + item.quantity;
    totalQuantity += item.quantity;
  });

  const quantityByCategory = Object.entries(categoryQuantities)
    .map(([category, quantity]) => ({
      category,
      quantity,
      percentage: totalQuantity > 0 ? Math.round((quantity / totalQuantity) * 100) : 0,
    }))
    .sort((a, b) => b.quantity - a.quantity);

  // 4. Inventory Health Calculation
  const statuses = inventory.map((item) => getInventoryStatus(item.quantity, item.expiryDate, item.unit));
  const fresh = statuses.filter((s) => s === "Fresh").length;
  const healthScore = totalItems === 0 ? 100 : Math.round((fresh / totalItems) * 100);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-[var(--shelf-blue)]">
          Analytics & Insights
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
          Inventory Intelligence
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Operational metrics and expiration analysis calculated directly from database records.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[var(--shelf-blue)]/10 text-[var(--shelf-blue)] flex items-center justify-center shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--shelf-muted)] uppercase">Total Products</p>
            <p className="text-xl font-black text-[var(--shelf-dark)] mt-0.5">{totalItems}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)] flex items-center justify-center shrink-0">
            <Package2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--shelf-muted)] uppercase">Total Quantity</p>
            <p className="text-xl font-black text-[var(--shelf-dark)] mt-0.5">{totalQuantity}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)] flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--shelf-muted)] uppercase">Avg Shelf Life</p>
            <p className="text-xl font-black text-[var(--shelf-dark)] mt-0.5">
              {avgDaysToExpiry > 0 ? `${avgDaysToExpiry} days` : "N/A"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[var(--shelf-terracotta)]/10 text-[var(--shelf-terracotta)] flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--shelf-muted)] uppercase">Health Score</p>
            <p className="text-xl font-black text-[var(--shelf-dark)] mt-0.5">{healthScore}%</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Chart 1: Expiry Distribution */}
        <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={16} className="text-[var(--shelf-blue)]" />
              Expiry Distribution
            </h3>
            <p className="text-xs text-[var(--shelf-muted)] mt-1">
              Grouping products by urgency and remaining shelf lifespan.
            </p>

            <div className="mt-6 space-y-4">
              {/* Expired Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--shelf-dark)]">Expired</span>
                  <span className="text-[var(--shelf-muted)]">{expired} items ({pct(expired)}%)</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                  <div className="h-full rounded-full bg-[var(--shelf-terracotta)]" style={{ width: `${pct(expired)}%` }} />
                </div>
              </div>

              {/* 0-3 Days Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--shelf-dark)]">0–3 Days (Critical)</span>
                  <span className="text-[var(--shelf-muted)]">{critical} items ({pct(critical)}%)</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                  <div className="h-full rounded-full bg-[var(--shelf-amber)]" style={{ width: `${pct(critical)}%` }} />
                </div>
              </div>

              {/* 4-7 Days Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--shelf-dark)]">4–7 Days (Warning)</span>
                  <span className="text-[var(--shelf-muted)]">{warning} items ({pct(warning)}%)</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                  <div className="h-full rounded-full bg-[var(--shelf-amber)]/60" style={{ width: `${pct(warning)}%` }} />
                </div>
              </div>

              {/* 8-30 Days Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--shelf-dark)]">8–30 Days (Medium)</span>
                  <span className="text-[var(--shelf-muted)]">{short} items ({pct(short)}%)</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                  <div className="h-full rounded-full bg-[var(--shelf-blue)]" style={{ width: `${pct(short)}%` }} />
                </div>
              </div>

              {/* 30+ Days Row */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[var(--shelf-dark)]">30+ Days (Fresh)</span>
                  <span className="text-[var(--shelf-muted)]">{long} items ({pct(long)}%)</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                  <div className="h-full rounded-full bg-[var(--shelf-sage)]" style={{ width: `${pct(long)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chart 2: Category Distribution */}
        <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider flex items-center gap-1.5">
              <PieChart size={16} className="text-[var(--shelf-blue)]" />
              Category distribution
            </h3>
            <p className="text-xs text-[var(--shelf-muted)] mt-1">
              Percentage breakdown of product counts across categories.
            </p>

            <div className="mt-6 space-y-3.5 max-h-64 overflow-y-auto pr-1">
              {categoryDistribution.length === 0 ? (
                <p className="text-xs text-[var(--shelf-muted)] text-center py-12">No categories tracked.</p>
              ) : (
                categoryDistribution.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--shelf-dark)] truncate">{item.category}</span>
                      <span className="text-[var(--shelf-muted)]">{item.count} items ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                      <div className="h-full rounded-full bg-[var(--shelf-forest)]" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Chart 3: Quantity by Category */}
        <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 size={16} className="text-[var(--shelf-blue)]" />
              Quantity by Category
            </h3>
            <p className="text-xs text-[var(--shelf-muted)] mt-1">
              Distribution of aggregate unit volumes across active stock categories.
            </p>

            <div className="mt-6 space-y-3.5 max-h-64 overflow-y-auto pr-1">
              {quantityByCategory.length === 0 ? (
                <p className="text-xs text-[var(--shelf-muted)] text-center py-12">No inventory recorded.</p>
              ) : (
                quantityByCategory.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--shelf-dark)] truncate">{item.category}</span>
                      <span className="text-[var(--shelf-muted)]">{item.quantity} units ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                      <div className="h-full rounded-full bg-[var(--shelf-sage)]" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Chart 4: Inventory Health */}
        <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={16} className="text-[var(--shelf-blue)]" />
              Inventory Health Score
            </h3>
            <p className="text-xs text-[var(--shelf-muted)] mt-1">
              Proportional ratio of fresh items to overall inventory tracking volume.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center h-28 w-28 rounded-full border-8 border-[var(--shelf-cream)]">
                <span className="text-3xl font-black text-[var(--shelf-dark)]">
                  {healthScore}%
                </span>
              </div>
              <p className="mt-4 text-xs font-bold text-[var(--shelf-forest)] uppercase tracking-wider">
                {healthScore >= 80 ? "Excellent Freshness Ratio" : healthScore >= 50 ? "Acceptable Shelf Health" : "Immediate Actions Required"}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--shelf-border)]/55 pt-4 text-xs text-[var(--shelf-muted)] leading-relaxed">
            Overall score degrades as items transition to &ldquo;Expiring&rdquo; or &ldquo;Expired&rdquo; statuses. Maintain regular stock turnover to sustain score.
          </div>
        </section>

      </div>
    </div>
  );
}
