"use client";

import { Clock, TrendingUp, CheckCircle, Package, ArrowDownRight } from "lucide-react";
import type { ConsumptionRecord } from "@/lib/actions/recipes";

interface ProductActivityLedgerProps {
  productName: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  createdAt?: string | Date | null;
  history: ConsumptionRecord[];
  isBusiness?: boolean;
}

export default function ProductActivityLedger({
  productName,
  initialQuantity,
  currentQuantity,
  unit,
  createdAt,
  history,
  isBusiness = false,
}: ProductActivityLedgerProps) {
  const totalConsumed = history.reduce((acc, h) => acc + h.quantityUsed, 0);

  // Approximate economic value saved from preventing waste
  const estimatedSavings = (totalConsumed * 3.25).toFixed(2);

  const formattedCreatedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Catalog entry recorded";

  return (
    <div className="sl-editorial-card p-5 sm:p-6 space-y-5">
      {/* Header with KPI Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--app-border-subtle)] pb-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[var(--app-text-display)]">
            Archival Lifecycle Ledger
          </h3>
          <p className="text-xs text-[var(--app-text-muted)]">
            Verified chronological record of inventory admissions and consumption milestones
          </p>
        </div>

        {/* Waste Prevention Value Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs">
          <TrendingUp size={14} className="text-[var(--app-accent-emerald)]" />
          <span className="text-[var(--app-text-muted)]">Waste Prevented:</span>
          <span className="font-mono font-bold text-[var(--app-accent-emerald)]">
            ${estimatedSavings}
          </span>
        </div>
      </div>

      {/* Timeline Events */}
      <div className="space-y-4">
        {/* Entry Milestone */}
        <div className="relative flex items-start gap-3.5 pl-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] text-[var(--app-accent-emerald)] shadow-2xs">
            <Package size={15} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--app-text-display)]">
                Product Onboarded to Digital Dossier
              </span>
              <span className="text-[10px] font-mono text-[var(--app-text-muted)]">
                {formattedCreatedDate}
              </span>
            </div>
            <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">
              Initial registered stock: {currentQuantity + totalConsumed} {unit}
            </p>
          </div>
        </div>

        {/* Consumption History Records */}
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/50 p-6 text-center space-y-1.5">
            <Clock size={22} className="mx-auto text-[var(--app-text-muted)]" />
            <p className="text-xs font-semibold text-[var(--app-text-display)]">
              No consumption deductions recorded yet
            </p>
            <p className="text-[11px] text-[var(--app-text-muted)] max-w-sm mx-auto">
              Whenever portions of {productName} are marked as used or consumed, an audit milestone is permanently documented here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {history.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-[var(--app-accent-emerald)]">
                    <ArrowDownRight size={14} />
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--app-text-display)] block">
                      Consumed Portion
                    </span>
                    <span className="text-[10px] text-[var(--app-text-muted)]">
                      {new Date(record.consumedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    -{record.quantityUsed} {record.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Balance Summary */}
        <div className="pt-2 border-t border-[var(--app-border-subtle)] flex items-center justify-between text-xs">
          <span className="font-medium text-[var(--app-text-muted)]">
            Current Active Inventory:
          </span>
          <span className="font-bold text-[var(--app-text-display)]">
            {currentQuantity} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
