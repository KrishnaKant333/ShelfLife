"use client";

import {
  TrendingUp,
  AlertOctagon,
  ArrowRightLeft,
  Boxes,
  Activity,
  ArrowRight,
  Eye,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { getDaysUntilExpiry, formatExpiry } from "@/lib/format-expiry";
import Link from "next/link";

type BusinessInventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface StrategyViewProps {
  inventory: BusinessInventoryItem[];
}

function getPriority(daysLeft: number) {
  if (daysLeft < 0) return { label: "EXPIRED", className: "bg-red-50 text-[var(--shelf-terracotta)] border-red-200" };
  if (daysLeft <= 3) return { label: "CRITICAL", className: "bg-red-50 text-[var(--shelf-terracotta)] border-red-200" };
  if (daysLeft <= 7) return { label: "HIGH", className: "bg-amber-50 text-[var(--shelf-amber)] border-amber-200" };
  if (daysLeft <= 14) return { label: "MEDIUM", className: "bg-blue-50 text-blue-700 border-blue-200" };
  return { label: "Normal", className: "bg-green-50 text-green-700 border-green-200" };
}

export default function StrategyView({ inventory }: StrategyViewProps) {
  // Sort items strictly by closest expiry for FIFO view
  const fifoQueue = [...inventory]
    .map(item => ({
      ...item,
      daysLeft: getDaysUntilExpiry(item.expiryDate)
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Group by category to find Expiry Exposure (quantities expiring within 7 days)
  const categoryExposure: Record<string, { totalQty: number; expiringQty: number }> = {};
  inventory.forEach(item => {
    const cat = item.category || "Uncategorized";
    if (!categoryExposure[cat]) {
      categoryExposure[cat] = { totalQty: 0, expiringQty: 0 };
    }
    categoryExposure[cat].totalQty += item.quantity;
    
    const daysLeft = getDaysUntilExpiry(item.expiryDate);
    if (daysLeft >= 0 && daysLeft <= 7) {
      categoryExposure[cat].expiringQty += item.quantity;
    }
  });

  const exposureList = Object.entries(categoryExposure)
    .map(([category, data]) => ({
      category,
      ...data,
      riskRatio: data.totalQty === 0 ? 0 : Math.round((data.expiringQty / data.totalQty) * 100)
    }))
    .sort((a, b) => b.expiringQty - a.expiringQty);

  // Identify low stock items (qty <= 5)
  const lowStockItems = inventory.filter(item => item.quantity <= 5);

  // Identify unusually large quantities (qty >= 25)
  const largeQtyItems = fifoQueue.filter(item => item.quantity >= 25);

  // Strategy Recommendations
  const strategyRecommendations = [];

  // Expiry risk strategy
  const criticalExpiryItems = fifoQueue.filter(item => item.daysLeft >= 0 && item.daysLeft <= 3);
  if (criticalExpiryItems.length > 0) {
    strategyRecommendations.push({
      type: "EXPIRY_WARNING",
      title: "Expiring Stock Exposure",
      description: `Based on current stock, ${criticalExpiryItems.length} items will expire within 3 days (highest priority: ${criticalExpiryItems[0].name}).`,
      recommendation: "Prioritize usage in daily operations, initiate immediate promotions, or bundle before the next stock intake.",
      severity: "critical"
    });
  }

  // Low stock strategy
  if (lowStockItems.length > 0) {
    strategyRecommendations.push({
      type: "RESTOCK",
      title: "Restocking Required",
      description: `${lowStockItems.length} products have fallen below optimal stock thresholds.`,
      recommendation: "Consider restocking these items based on current stock levels to maintain supply continuity.",
      severity: "warning"
    });
  }

  // Large quantity exposure
  const nearExpiryLargeQty = largeQtyItems.find(item => item.daysLeft <= 14);
  if (nearExpiryLargeQty) {
    strategyRecommendations.push({
      type: "OVERSTOCK_RISK",
      title: "Overstock Expiry Exposure",
      description: `Large volume of "${nearExpiryLargeQty.name}" (${nearExpiryLargeQty.quantity} ${nearExpiryLargeQty.unit}) expires in ${nearExpiryLargeQty.daysLeft} days.`,
      recommendation: "Accelerate turnover of this specific batch to avoid inventory write-offs.",
      severity: "warning"
    });
  }

  // Fallback default recommendation
  if (strategyRecommendations.length === 0) {
    strategyRecommendations.push({
      type: "STABLE",
      title: "Inventory Status Healthy",
      description: "No immediate expiry risks or restock deficits identified from current inventory.",
      recommendation: "Maintain current FIFO execution processes and schedule regular inventory checks.",
      severity: "healthy"
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-[var(--shelf-forest)]">
          Operations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--shelf-dark)] md:text-4xl">
          Inventory Strategy
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Real-time strategic analysis of stock levels, category expiry densities, and FIFO prioritization.
        </p>
      </div>

      {/* Grid: Strategy & Exposure */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Strategy Recommendations Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider">
            Operational Strategy & Actions
          </h3>

          <div className="space-y-4">
            {strategyRecommendations.map((rec, idx) => {
              let borderClass = "border-[var(--shelf-border)]";
              let titleColor = "text-[var(--shelf-dark)]";
              let bgClass = "bg-[var(--shelf-surface)]";

              if (rec.severity === "critical") {
                borderClass = "border-[var(--shelf-terracotta)]";
                titleColor = "text-[var(--shelf-terracotta)]";
                bgClass = "bg-red-50/20";
              } else if (rec.severity === "warning") {
                borderClass = "border-[var(--shelf-amber)]";
                titleColor = "text-[var(--shelf-amber)]";
                bgClass = "bg-amber-50/20";
              }

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border ${borderClass} ${bgClass} p-5 shadow-xs`}
                >
                  <h4 className={`text-base font-bold ${titleColor} flex items-center gap-2`}>
                    <AlertOctagon size={18} />
                    {rec.title}
                  </h4>
                  <p className="mt-2 text-sm text-[var(--shelf-dark)]">
                    {rec.description}
                  </p>
                  <div className="mt-4 rounded-xl bg-[var(--shelf-surface)] border border-[var(--shelf-border)]/50 p-3.5 text-xs text-[var(--shelf-muted)]">
                    <span className="font-bold text-[var(--shelf-forest)]">Recommendation:</span>{" "}
                    {rec.recommendation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expiry Density by Category Card */}
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider">
              Category Expiry Risk
            </h3>
            <p className="mt-1 text-xs text-[var(--shelf-muted)]">
              Proportion of stock in each category expiring within 7 days.
            </p>

            <div className="mt-6 space-y-4">
              {exposureList.length === 0 ? (
                <p className="text-sm text-[var(--shelf-muted)] text-center py-8">
                  No inventory data.
                </p>
              ) : (
                exposureList.slice(0, 5).map((exp) => (
                  <div key={exp.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--shelf-dark)] truncate">{exp.category}</span>
                      <span className="text-[var(--shelf-muted)]">
                        {exp.expiringQty} / {exp.totalQty} expiring
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                      <div
                        className={`h-full rounded-full ${
                          exp.riskRatio > 50
                            ? "bg-[var(--shelf-terracotta)]"
                            : exp.riskRatio > 20
                            ? "bg-[var(--shelf-amber)]"
                            : "bg-[var(--shelf-sage)]"
                        }`}
                        style={{ width: `${exp.riskRatio}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--shelf-border)]/55 pt-4 text-xs text-[var(--shelf-muted)]">
            High risk ratio categories demand accelerated stock rotation.
          </div>
        </div>
      </div>

      {/* FIFO Priority Queue */}
      <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--shelf-dark)]">
              FIFO Priority Queue
            </h3>
            <p className="text-xs text-[var(--shelf-muted)]">
              Strict sequence order by closest expiration date. Use this ordering when retrieving stock.
            </p>
          </div>
          <Link
            href="/business/dashboard/inventory"
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--shelf-forest)] hover:underline"
          >
            <Eye size={14} />
            View Active Inventory
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)]">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/35 text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)]">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Expiry Date</th>
                  <th className="px-5 py-3.5">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--shelf-border)]/50 text-sm">
                {fifoQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-[var(--shelf-muted)]">
                      No products currently in inventory.
                    </td>
                  </tr>
                ) : (
                  fifoQueue.map((item) => {
                    const priority = getPriority(item.daysLeft);

                    return (
                      <tr key={item.id} className="hover:bg-[var(--shelf-cream)]/20 transition">
                        <td className="px-5 py-4 font-bold text-[var(--shelf-dark)]">
                          {item.name}
                        </td>
                        <td className="px-5 py-4 text-[var(--shelf-muted)]">
                          {item.category}
                        </td>
                        <td className="px-5 py-4 font-semibold text-[var(--shelf-dark)]">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-5 py-4 text-[var(--shelf-muted)]">
                          {formatExpiry(item.expiryDate)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${priority.className}`}>
                            {priority.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 p-3 md:hidden">
            {fifoQueue.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-[var(--shelf-muted)]">No products currently in inventory.</p>
            ) : (
              fifoQueue.map((item) => {
                const priority = getPriority(item.daysLeft);
                return (
                  <div key={item.id} className="rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--shelf-dark)]">{item.name}</p>
                        <p className="mt-1 text-xs text-[var(--shelf-muted)]">{item.category} · {item.quantity} {item.unit}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${priority.className}`}>
                        {priority.label}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[var(--shelf-muted)]">Expiry: <span className="font-semibold text-[var(--shelf-dark)]">{formatExpiry(item.expiryDate)}</span></p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Restocking Deficit Alert Panel */}
      <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider mb-2">
          Restock Priority Levels
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {lowStockItems.length === 0 ? (
            <div className="sm:col-span-2 md:col-span-3 rounded-xl border border-dashed border-[var(--shelf-border)] p-8 text-center text-xs text-[var(--shelf-muted)]">
              No product stock deficits detected. All stock levels are sufficient.
            </div>
          ) : (
            lowStockItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 flex justify-between items-center hover:border-[var(--shelf-sage)] transition"
              >
                <div>
                  <h4 className="font-bold text-[var(--shelf-dark)] text-sm">{item.name}</h4>
                  <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                    Current: <span className="font-bold text-[var(--shelf-terracotta)]">{item.quantity} {item.unit}</span>
                  </p>
                </div>
                <Link
                  href={`/business/dashboard/inventory/${item.id}/edit`}
                  className="rounded-lg bg-[var(--shelf-forest)] px-2.5 py-1 text-xs font-bold text-white hover:opacity-90"
                >
                  Restock
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
