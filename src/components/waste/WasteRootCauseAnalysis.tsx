"use client";

import { PieChart, AlertCircle } from "lucide-react";
import { WasteCategoryMetric, WasteReasonMetric } from "@/lib/waste";

interface WasteRootCauseAnalysisProps {
  categories: WasteCategoryMetric[];
  reasons: WasteReasonMetric[];
}

export default function WasteRootCauseAnalysis({
  categories,
  reasons,
}: WasteRootCauseAnalysisProps) {
  const totalCategoryDiscards = categories.reduce((sum, c) => sum + c.discardCount, 0);
  const totalReasonDiscards = reasons.reduce((sum, r) => sum + r.count, 0);

  return (
    <section aria-labelledby="root-cause-heading" className="space-y-6">
      <div>
        <h2 id="root-cause-heading" className="font-serif text-xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-2xl">
          Root-Cause & Category Analysis
        </h2>
        <p className="mt-1 text-xs text-[var(--shelf-muted)] sm:text-sm">
          Pinpointing where and why food loss occurs to inform smarter purchasing and storage routines.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Module 1: Discard Breakdown by Category */}
        <div className="sl-editorial-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)] flex items-center gap-1.5">
                <PieChart className="h-3.5 w-3.5 text-[var(--shelf-forest)]" />
                Waste by Food Category
              </h3>
              <span className="text-[11px] font-mono text-[var(--shelf-muted)]">
                {totalCategoryDiscards} total items
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {categories.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--shelf-dark)] flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.colorVar }}
                      />
                      {cat.category}
                    </span>
                    <span className="font-mono text-[var(--shelf-muted)]">
                      <strong className="text-[var(--shelf-dark)]">{cat.discardCount}</strong> ({cat.percentage}%)
                    </span>
                  </div>

                  {/* Visual progress bar */}
                  <div className="h-2 w-full rounded-full bg-[var(--shelf-cream)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(3, cat.percentage)}%`,
                        backgroundColor: cat.colorVar,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 border-t border-[var(--app-border-subtle)] pt-3 text-[11px] text-[var(--shelf-muted)]">
            {categories[0]?.discardCount > 0
              ? `${categories[0].category} accounts for ${categories[0].percentage}% of total waste.`
              : "Zero categorical discards recorded in active scope."}
          </p>
        </div>

        {/* Module 2: Waste by Trigger / Cause */}
        <div className="sl-editorial-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-[var(--shelf-amber)]" />
                Primary Waste Triggers
              </h3>
              <span className="text-[11px] font-mono text-[var(--shelf-muted)]">
                {totalReasonDiscards} logged causes
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {reasons.map((reason) => (
                <div key={reason.reason} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--shelf-dark)] flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: reason.colorVar }}
                      />
                      {reason.label}
                    </span>
                    <span className="font-mono text-[var(--shelf-muted)]">
                      <strong className="text-[var(--shelf-dark)]">{reason.count}</strong> ({reason.percentage}%)
                    </span>
                  </div>

                  {/* Visual progress bar */}
                  <div className="h-2 w-full rounded-full bg-[var(--shelf-cream)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(3, reason.percentage)}%`,
                        backgroundColor: reason.colorVar,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 border-t border-[var(--shelf-border)]/60 pt-3 text-[11px] text-[var(--shelf-muted)]">
            Proactive consumption via Cooking Mode mitigates past-expiration discards.
          </p>
        </div>
      </div>
    </section>
  );
}
