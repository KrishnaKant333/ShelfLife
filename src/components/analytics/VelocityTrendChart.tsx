"use client";

import { useState } from "react";
import { ExpiryHorizonBucket } from "@/lib/analytics";
import { Clock, Table as TableIcon, Info } from "lucide-react";

interface VelocityTrendChartProps {
  horizons: ExpiryHorizonBucket[];
  totalProducts: number;
}

export default function VelocityTrendChart({
  horizons,
  totalProducts,
}: VelocityTrendChartProps) {
  const [activeBucketKey, setActiveBucketKey] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const activeBucket = horizons.find((h) => h.key === activeBucketKey);

  return (
    <section
      aria-labelledby="velocity-chart-title"
      className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2
            id="velocity-chart-title"
            className="flex items-center gap-2 font-serif text-lg font-semibold text-[var(--shelf-dark)] sm:text-xl"
          >
            <Clock size={18} className="text-[var(--shelf-forest)]" />
            Freshness Horizons & Expiry Velocity
          </h2>
          <p className="mt-1 text-xs text-[var(--shelf-muted)]">
            Distribution of inventory items across remaining shelf-life horizons.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 px-2.5 py-1 text-xs font-medium text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)] sm:self-auto"
        >
          <TableIcon size={13} />
          {showTable ? "Show Chart" : "View Data Table"}
        </button>
      </div>

      {!showTable ? (
        <div className="mt-6 space-y-6">
          {/* Stacked Proportional Distribution Bar */}
          <div className="space-y-2">
            <div className="flex h-7 w-full overflow-hidden rounded-xl border border-[var(--shelf-border)]/40 bg-[var(--shelf-cream)]/30 p-0.5">
              {horizons.map((b) => {
                if (b.percentage === 0) return null;
                const isHovered = activeBucketKey === b.key;
                return (
                  <button
                    key={b.key}
                    type="button"
                    onMouseEnter={() => setActiveBucketKey(b.key)}
                    onMouseLeave={() => setActiveBucketKey(null)}
                    onClick={() => setActiveBucketKey(activeBucketKey === b.key ? null : b.key)}
                    style={{
                      width: `${Math.max(b.percentage, 3)}%`,
                      backgroundColor: b.colorVar,
                    }}
                    className={`relative h-full transition-all first:rounded-l-[9px] last:rounded-r-[9px] ${
                      isHovered ? "brightness-110 ring-2 ring-white/60 z-10" : "opacity-90 hover:opacity-100"
                    }`}
                    title={`${b.label} (${b.rangeLabel}): ${b.count} items (${b.percentage}%)`}
                  />
                );
              })}
            </div>

            {/* Micro percentage distribution indicator */}
            <div className="flex justify-between px-1 text-[10px] text-[var(--shelf-muted)] font-mono">
              <span>Immediate Urgent (0–3d)</span>
              <span>Prime Freshness (30d+)</span>
            </div>
          </div>

          {/* Horizon Category Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
            {horizons.map((b) => {
              const isSelected = activeBucketKey === b.key;
              return (
                <div
                  key={b.key}
                  onMouseEnter={() => setActiveBucketKey(b.key)}
                  onMouseLeave={() => setActiveBucketKey(null)}
                  onClick={() => setActiveBucketKey(activeBucketKey === b.key ? null : b.key)}
                  className={`cursor-pointer min-w-0 overflow-hidden rounded-xl border p-2.5 transition-all sm:p-3 ${
                    isSelected
                      ? "border-[var(--shelf-forest)] bg-[var(--shelf-cream)]/40 shadow-xs"
                      : "border-[var(--shelf-border)]/70 bg-[var(--shelf-surface)] hover:border-[var(--shelf-border)] hover:bg-[var(--shelf-cream)]/15"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: b.colorVar }}
                    />
                    <span className="text-xs font-bold text-[var(--shelf-dark)] truncate">
                      {b.label}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[10px] font-mono text-[var(--shelf-muted)] truncate">
                    {b.rangeLabel}
                  </p>

                  <div className="mt-2 flex items-baseline justify-between border-t border-[var(--shelf-border)]/40 pt-1.5 min-w-0">
                    <span className="font-mono text-lg font-extrabold text-[var(--shelf-dark)] sm:text-xl">
                      {b.count}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[var(--shelf-muted)]">
                      {b.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Item Inspection Panel */}
          {activeBucket && activeBucket.items.length > 0 && (
            <div className="rounded-xl border border-[var(--shelf-border)]/70 bg-[var(--shelf-cream)]/25 p-4 transition-all">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--shelf-dark)] flex items-center gap-1.5">
                  <Info size={14} className="text-[var(--shelf-forest)]" />
                  Items in &ldquo;{activeBucket.label}&rdquo; Horizon ({activeBucket.items.length}):
                </span>
                <span className="text-[10px] text-[var(--shelf-muted)]">
                  Range: {activeBucket.rangeLabel}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {activeBucket.items.map((item, idx) => (
                  <span
                    key={`${item.name}-${idx}`}
                    className="inline-flex items-center gap-1 rounded-md border border-[var(--shelf-border)]/50 bg-[var(--shelf-surface)] px-2 py-1 text-xs text-[var(--shelf-dark)]"
                  >
                    <strong>{item.name}</strong>
                    <span className="text-[var(--shelf-muted)] font-mono">
                      ({item.quantity} {item.unit}) •{" "}
                      {item.days < 0
                        ? `Expired ${Math.abs(item.days)}d ago`
                        : item.days === 0
                        ? "Expires today"
                        : `${item.days}d left`}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Accessible Tabular View */
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 text-[var(--shelf-muted)] font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Horizon</th>
                <th className="p-3">Lifespan Window</th>
                <th className="p-3">Product Count</th>
                <th className="p-3">Share</th>
                <th className="p-3">Sample Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--shelf-border)]/50">
              {horizons.map((b) => (
                <tr key={b.key} className="hover:bg-[var(--shelf-cream)]/10">
                  <td className="p-3 font-bold text-[var(--shelf-dark)] flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: b.colorVar }}
                    />
                    {b.label}
                  </td>
                  <td className="p-3 font-mono text-[var(--shelf-muted)]">{b.rangeLabel}</td>
                  <td className="p-3 font-mono font-bold text-[var(--shelf-dark)]">{b.count}</td>
                  <td className="p-3 font-mono text-[var(--shelf-muted)]">{b.percentage}%</td>
                  <td className="p-3 text-[var(--shelf-dark)]">
                    {b.items.length > 0
                      ? b.items.slice(0, 3).map((i) => i.name).join(", ")
                      : "—"}
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
