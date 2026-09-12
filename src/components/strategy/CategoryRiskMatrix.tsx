"use client";

import { PieChart, AlertTriangle, ShieldCheck } from "lucide-react";

export interface CategoryExposureItem {
  category: string;
  totalQty: number;
  expiringQty: number;
  riskRatio: number;
}

interface CategoryRiskMatrixProps {
  exposureList: CategoryExposureItem[];
}

export function CategoryRiskMatrix({ exposureList }: CategoryRiskMatrixProps) {
  return (
    <div className="rounded-3xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 sm:p-7 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[var(--shelf-dark)] flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[var(--shelf-forest)]" />
              Category Risk Density
            </h3>
            <p className="text-xs text-[var(--shelf-muted)]">
              Stock proportions per category expiring within the 7-day operational window.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {exposureList.length === 0 ? (
            <div className="py-10 text-center text-xs text-[var(--shelf-muted)]">
              No commercial inventory registered.
            </div>
          ) : (
            exposureList.slice(0, 6).map((item) => {
              const isHigh = item.riskRatio > 40;
              const isMedium = item.riskRatio > 15 && !isHigh;
              const barColor = isHigh
                ? "bg-[var(--shelf-terracotta)]"
                : isMedium
                ? "bg-[var(--shelf-amber)]"
                : "bg-[var(--shelf-forest)]";

              const badgeColor = isHigh
                ? "bg-[var(--shelf-terracotta)]/10 text-[var(--shelf-terracotta)] border-[var(--shelf-terracotta)]/20"
                : isMedium
                ? "bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)] border-[var(--shelf-amber)]/20"
                : "bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)] border-[var(--shelf-forest)]/20";

              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--shelf-dark)] truncate max-w-[140px] sm:max-w-[180px]">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[var(--shelf-muted)]">
                        {item.expiringQty} / {item.totalQty} units
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${badgeColor}`}
                      >
                        {item.riskRatio}% Risk
                      </span>
                    </div>
                  </div>

                  <div
                    role="progressbar"
                    aria-label={`${item.category}: ${item.expiringQty} of ${item.totalQty} units expiring within 7 days`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={item.riskRatio}
                    className="h-2 w-full overflow-hidden rounded-full bg-[var(--shelf-cream)]/70"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.max(item.riskRatio, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--shelf-border)]/60 flex items-center gap-2 text-xs text-[var(--shelf-muted)]">
        <ShieldCheck className="h-4 w-4 text-[var(--shelf-forest)] shrink-0" />
        <span>Maintain category risk ratios below 20% to prevent unscheduled markdowns.</span>
      </div>
    </div>
  );
}
