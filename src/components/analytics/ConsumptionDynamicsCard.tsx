"use client";

import { AnalyticsSummary, TimeframeScope } from "@/lib/analytics";
import { Activity, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ConsumptionDynamicsCardProps {
  summary: AnalyticsSummary;
  scope: TimeframeScope;
  isBusiness?: boolean;
}

export default function ConsumptionDynamicsCard({
  summary,
  scope,
  isBusiness = false,
}: ConsumptionDynamicsCardProps) {
  const scopeLabel = scope === "ALL" ? "recorded all time" : `in the last ${scope.toLowerCase()}`;

  return (
    <section
      aria-labelledby="consumption-dynamics-title"
      className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2
            id="consumption-dynamics-title"
            className="flex items-center gap-2 font-serif text-lg font-semibold text-[var(--shelf-dark)] sm:text-xl"
          >
            <Activity size={18} className="text-[var(--shelf-forest)]" />
            Consumption & Waste Mitigation Dynamics
          </h2>
          <p className="mt-1 text-xs text-[var(--shelf-muted)]">
            Empirical ratio of utilized inventory versus discarded surplus {scopeLabel}.
          </p>
        </div>

        <Link
          href={isBusiness ? "/business/dashboard/waste" : "/dashboard/waste"}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--shelf-forest)] hover:underline self-start sm:self-auto"
        >
          Detailed Waste Impact
          <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {/* Food Rescue Score */}
        <div className="rounded-xl border border-[var(--shelf-border)]/60 bg-[var(--shelf-cream)]/15 p-4">
          <div className="flex items-center justify-between text-xs text-[var(--shelf-muted)] font-medium">
            <span>Food Rescue Efficiency</span>
            <CheckCircle2 size={15} className="text-[var(--shelf-forest)]" />
          </div>
          <p className="mt-2 font-mono text-3xl font-extrabold text-[var(--shelf-dark)]">
            {summary.foodRescueRate}%
          </p>
          <p className="mt-1 text-[11px] text-[var(--shelf-muted)]">
            Percentage of handled stock consumed prior to expiration.
          </p>
        </div>

        {/* Consumed Volume */}
        <div className="rounded-xl border border-[var(--shelf-border)]/60 bg-[var(--shelf-cream)]/15 p-4">
          <div className="flex items-center justify-between text-xs text-[var(--shelf-muted)] font-medium">
            <span>Logged Consumptions</span>
            <span className="h-2 w-2 rounded-full bg-[var(--shelf-forest)]" />
          </div>
          <p className="mt-2 font-mono text-3xl font-extrabold text-[var(--shelf-forest)]">
            {summary.consumptionCount}
          </p>
          <p className="mt-1 text-[11px] text-[var(--shelf-muted)]">
            {summary.consumedQuantity > 0
              ? `${summary.consumedQuantity} total units successfully consumed`
              : "Zero spoilage incidents in current horizon"}
          </p>
        </div>

        {/* Discarded Volume */}
        <div className="rounded-xl border border-[var(--shelf-border)]/60 bg-[var(--shelf-cream)]/15 p-4">
          <div className="flex items-center justify-between text-xs text-[var(--shelf-muted)] font-medium">
            <span>Discard Incidents</span>
            <AlertCircle
              size={15}
              className={
                summary.discardCount > 0
                  ? "text-[var(--shelf-terracotta)]"
                  : "text-[var(--shelf-muted)]"
              }
            />
          </div>
          <p
            className={`mt-2 font-mono text-3xl font-extrabold ${
              summary.discardCount > 0
                ? "text-[var(--shelf-terracotta)]"
                : "text-[var(--shelf-dark)]"
            }`}
          >
            {summary.discardCount}
          </p>
          <p className="mt-1 text-[11px] text-[var(--shelf-muted)]">
            {summary.discardCount > 0
              ? `${summary.discardedQuantity} units discarded past shelf life`
              : "Zero items discarded"}
          </p>
        </div>
      </div>
    </section>
  );
}
