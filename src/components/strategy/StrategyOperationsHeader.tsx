"use client";

import Link from "next/link";
import {
  TrendingUp,
  Boxes,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface StrategyOperationsHeaderProps {
  totalBatches: number;
  criticalCount: number;
  warningCount: number;
}

export function StrategyOperationsHeader({
  totalBatches,
  criticalCount,
  warningCount,
}: StrategyOperationsHeaderProps) {
  const router = useRouter();

  return (
    <header className="relative overflow-hidden rounded-3xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Operational Title & Badge */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--shelf-forest)]/10 px-3 py-1 text-xs font-semibold text-[var(--shelf-forest)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--shelf-forest)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--shelf-forest)]" />
              </span>
              FIFO Rotation Engine Active
            </span>

            {criticalCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--shelf-terracotta)]/10 border border-[var(--shelf-terracotta)]/20 px-2.5 py-0.5 text-xs font-bold text-[var(--shelf-terracotta)]">
                <AlertTriangle className="h-3.5 w-3.5" />
                {criticalCount} Critical Batch{criticalCount !== 1 ? "es" : ""}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--shelf-forest)]/10 border border-[var(--shelf-forest)]/20 px-2.5 py-0.5 text-xs font-semibold text-[var(--shelf-forest)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Nominal Rotation Health
              </span>
            )}
          </div>

          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[var(--shelf-dark)] sm:text-3xl lg:text-4xl">
              Inventory Strategy &amp; Stock Rotation
            </h1>
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-[var(--shelf-muted)]">
              Real-time operational dispatching for commercial inventory. Prioritize First-In-First-Out (FIFO)
              order picking, mitigate category waste exposure, and safeguard working capital.
            </p>
          </div>
        </div>

        {/* Right: Operational Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)] transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh State
          </button>

          <Link
            href="/business/dashboard/inventory"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition"
          >
            <Boxes className="h-4 w-4" />
            Manage Active Inventory
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Operational Strip */}
      <div className="mt-6 pt-5 border-t border-[var(--shelf-border)]/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[var(--shelf-muted)]">
        <div>
          Monitoring <span className="font-bold text-[var(--shelf-dark)]">{totalBatches}</span> total stock lines across commercial storage
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--shelf-terracotta)]" />
            Immediate Pick (&le;3d)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--shelf-amber)]" />
            Watch Window (&le;7d)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--shelf-forest)]" />
            Stable (&gt;7d)
          </span>
        </div>
      </div>
    </header>
  );
}
