"use client";

import { useMemo, useState } from "react";
import {
  computeAnalyticsReport,
  RawActivityRecord,
  RawConsumptionRecord,
  RawInventoryItem,
  TimeframeScope,
} from "@/lib/analytics";
import AnalyticsReportHeader from "@/components/analytics/AnalyticsReportHeader";
import MacroMetricBand from "@/components/analytics/MacroMetricBand";
import VelocityTrendChart from "@/components/analytics/VelocityTrendChart";
import CategoryRiskChart from "@/components/analytics/CategoryRiskChart";
import ConsumptionDynamicsCard from "@/components/analytics/ConsumptionDynamicsCard";
import AIReportObservations from "@/components/analytics/AIReportObservations";
import { PackagePlus, UploadCloud } from "lucide-react";
import Link from "next/link";

interface AnalyticsViewProps {
  inventory: RawInventoryItem[];
  consumptions?: RawConsumptionRecord[];
  activities?: RawActivityRecord[];
  isBusiness?: boolean;
}

export default function AnalyticsView({
  inventory,
  consumptions = [],
  activities = [],
  isBusiness = false,
}: AnalyticsViewProps) {
  const [scope, setScope] = useState<TimeframeScope>("30D");

  const summary = useMemo(() => {
    return computeAnalyticsReport(inventory, consumptions, activities, scope);
  }, [inventory, consumptions, activities, scope]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 print:space-y-6">
      {/* 1. Executive Masthead & Timeframe Controls */}
      <AnalyticsReportHeader
        scope={scope}
        onScopeChange={setScope}
        healthScore={summary.healthScore}
        totalProducts={summary.totalProducts}
        isBusiness={isBusiness}
      />

      {/* Empty State */}
      {inventory.length === 0 ? (
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]">
            <UploadCloud size={28} />
          </div>
          <h2 className="mt-4 font-serif text-2xl font-bold text-[var(--shelf-dark)]">
            No Active Inventory Found
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--shelf-muted)]">
            Upload an invoice or add products manually to generate your personalized Food Intelligence Report.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={isBusiness ? "/business/dashboard/inventory/invoice" : "/dashboard/inventory/invoice"}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:brightness-105"
            >
              <UploadCloud size={15} />
              Import Grocery Invoice
            </Link>
            <Link
              href={isBusiness ? "/business/dashboard/inventory/new" : "/dashboard/inventory/new"}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--shelf-dark)] shadow-xs transition hover:bg-[var(--shelf-cream)]/40"
            >
              <PackagePlus size={15} />
              Add Product
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Macro Metric KPI Strip with Animated Count-Ups */}
          <MacroMetricBand summary={summary} scope={scope} />

          {/* 3. Primary Data Storytelling Visualizations */}
          <div className="grid gap-6 lg:grid-cols-2">
            <VelocityTrendChart
              horizons={summary.horizons}
              totalProducts={summary.totalProducts}
            />

            <CategoryRiskChart
              categories={summary.categories}
              totalProducts={summary.totalProducts}
            />
          </div>

          {/* 4. Consumption Dynamics & Waste Mitigation */}
          <ConsumptionDynamicsCard
            summary={summary}
            scope={scope}
            isBusiness={isBusiness}
          />

          {/* 5. "What Is Driving This?" AI Intelligence Section */}
          <AIReportObservations
            observations={summary.observations}
            isBusiness={isBusiness}
          />
        </>
      )}
    </div>
  );
}
