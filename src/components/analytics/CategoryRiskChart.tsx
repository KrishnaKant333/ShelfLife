"use client";

import { useState } from "react";
import { CategoryRiskMetric } from "@/lib/analytics";
import { PieChart, Table as TableIcon, AlertTriangle } from "lucide-react";

interface CategoryRiskChartProps {
  categories: CategoryRiskMetric[];
  totalProducts: number;
}

export default function CategoryRiskChart({
  categories,
  totalProducts,
}: CategoryRiskChartProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section
      aria-labelledby="category-risk-title"
      className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2
            id="category-risk-title"
            className="flex items-center gap-2 font-serif text-lg font-semibold text-[var(--shelf-dark)] sm:text-xl"
          >
            <PieChart size={18} className="text-[var(--shelf-blue)]" />
            Category Exposure & Freshness Velocity
          </h2>
          <p className="mt-1 text-xs text-[var(--shelf-muted)]">
            Volume distribution contrasted with near-expiry vulnerability per food category.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 px-2.5 py-1 text-xs font-medium text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)] sm:self-auto"
        >
          <TableIcon size={13} />
          {showTable ? "Show Visual Breakdown" : "View Data Table"}
        </button>
      </div>

      {!showTable ? (
        <div className="mt-6 space-y-4">
          {categories.length === 0 ? (
            <p className="py-12 text-center text-xs text-[var(--shelf-muted)]">
              No categories currently tracked.
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.category}
                className="rounded-xl border border-[var(--shelf-border)]/60 bg-[var(--shelf-cream)]/10 p-3.5 transition-colors hover:bg-[var(--shelf-cream)]/25"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--shelf-dark)]">{cat.category}</span>
                    <span className="rounded-md bg-[var(--shelf-cream)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--shelf-muted)]">
                      {cat.totalCount} item{cat.totalCount > 1 ? "s" : ""} ({cat.countPercentage}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    {cat.atRiskCount > 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[var(--shelf-terracotta)]">
                        <AlertTriangle size={12} />
                        {cat.atRiskCount} at risk (≤7d)
                      </span>
                    ) : (
                      <span className="text-[var(--shelf-forest)] font-medium">All Fresh</span>
                    )}

                    <span className="text-[var(--shelf-muted)]">
                      Avg: {cat.avgShelfLifeDays > 0 ? `${cat.avgShelfLifeDays}d` : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Split Volume & Risk Progress Bar */}
                <div className="mt-2.5 flex h-2 w-full overflow-hidden rounded-full bg-[var(--shelf-cream)]">
                  {/* Safe portion */}
                  <div
                    style={{
                      width: `${Math.max(
                        0,
                        Math.round(((cat.totalCount - cat.atRiskCount) / totalProducts) * 100)
                      )}%`,
                    }}
                    className="h-full bg-[var(--shelf-forest)]"
                    title={`Fresh items: ${cat.totalCount - cat.atRiskCount}`}
                  />
                  {/* At-risk portion */}
                  <div
                    style={{
                      width: `${Math.round((cat.atRiskCount / totalProducts) * 100)}%`,
                    }}
                    className="h-full bg-[var(--shelf-terracotta)]"
                    title={`At risk items: ${cat.atRiskCount}`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Accessible Tabular View */
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 text-[var(--shelf-muted)] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Products</th>
                <th className="p-3">Catalog Share</th>
                <th className="p-3">At-Risk Count</th>
                <th className="p-3">Avg Remaining Life</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--shelf-border)]/50">
              {categories.map((cat) => (
                <tr key={cat.category} className="hover:bg-[var(--shelf-cream)]/10">
                  <td className="p-3 font-bold text-[var(--shelf-dark)]">{cat.category}</td>
                  <td className="p-3 font-mono font-medium text-[var(--shelf-dark)]">
                    {cat.totalCount}
                  </td>
                  <td className="p-3 font-mono text-[var(--shelf-muted)]">
                    {cat.countPercentage}%
                  </td>
                  <td className="p-3 font-mono">
                    {cat.atRiskCount > 0 ? (
                      <span className="font-bold text-[var(--shelf-terracotta)]">
                        {cat.atRiskCount} ({cat.atRiskPercentage}%)
                      </span>
                    ) : (
                      <span className="text-[var(--shelf-forest)]">0</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-[var(--shelf-muted)]">
                    {cat.avgShelfLifeDays > 0 ? `${cat.avgShelfLifeDays} days` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
