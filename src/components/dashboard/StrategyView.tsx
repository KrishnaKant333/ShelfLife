"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getDaysUntilExpiry } from "@/lib/format-expiry";
import { StrategyOperationsHeader } from "@/components/strategy/StrategyOperationsHeader";
import { StrategyKPIGrid } from "@/components/strategy/StrategyKPIGrid";
import {
  CategoryRiskMatrix,
  type CategoryExposureItem,
} from "@/components/strategy/CategoryRiskMatrix";
import {
  OperationalInsightsCard,
  type StrategyRecommendation,
} from "@/components/strategy/OperationalInsightsCard";
import {
  FifoPriorityQueue,
  type FifoItem,
} from "@/components/strategy/FifoPriorityQueue";
import { PackageX, ShoppingCart, ArrowRight } from "lucide-react";

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

export default function StrategyView({ inventory }: StrategyViewProps) {
  // Sort items strictly by closest expiry for FIFO view
  const fifoQueue: FifoItem[] = useMemo(() => {
    return [...inventory]
      .map((item) => ({
        ...item,
        daysLeft: getDaysUntilExpiry(item.expiryDate),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [inventory]);

  // Group by category to compute Category Expiry Risk (expiring within 7 days)
  const exposureList: CategoryExposureItem[] = useMemo(() => {
    const categoryMap: Record<string, { totalQty: number; expiringQty: number }> = {};

    inventory.forEach((item) => {
      const cat = item.category || "Uncategorized";
      if (!categoryMap[cat]) {
        categoryMap[cat] = { totalQty: 0, expiringQty: 0 };
      }
      categoryMap[cat].totalQty += item.quantity;

      const daysLeft = getDaysUntilExpiry(item.expiryDate);
      if (daysLeft >= 0 && daysLeft <= 7) {
        categoryMap[cat].expiringQty += item.quantity;
      }
    });

    return Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        totalQty: data.totalQty,
        expiringQty: data.expiringQty,
        riskRatio:
          data.totalQty === 0 ? 0 : Math.round((data.expiringQty / data.totalQty) * 100),
      }))
      .sort((a, b) => b.expiringQty - a.expiringQty);
  }, [inventory]);

  // KPI Calculations
  const {
    criticalCount,
    criticalUnits,
    watchCount,
    watchUnits,
    lowStockItems,
    bulkCount,
  } = useMemo(() => {
    let critCount = 0;
    let critUnits = 0;
    let wCount = 0;
    let wUnits = 0;
    let bCount = 0;
    const lowStock: BusinessInventoryItem[] = [];

    fifoQueue.forEach((item) => {
      if (item.daysLeft >= 0 && item.daysLeft <= 3) {
        critCount++;
        critUnits += item.quantity;
      } else if (item.daysLeft > 3 && item.daysLeft <= 7) {
        wCount++;
        wUnits += item.quantity;
      }

      if (item.quantity <= 5) {
        lowStock.push(item);
      }

      if (item.quantity >= 25) {
        bCount++;
      }
    });

    return {
      criticalCount: critCount,
      criticalUnits: critUnits,
      watchCount: wCount,
      watchUnits: wUnits,
      lowStockItems: lowStock,
      bulkCount: bCount,
    };
  }, [fifoQueue]);

  // Operational Strategy Recommendations
  const strategyRecommendations: StrategyRecommendation[] = useMemo(() => {
    const recs: StrategyRecommendation[] = [];

    // 1. Critical Expiry Risk
    const criticalExpiryItems = fifoQueue.filter(
      (item) => item.daysLeft >= 0 && item.daysLeft <= 3
    );
    if (criticalExpiryItems.length > 0) {
      recs.push({
        type: "EXPIRY_WARNING",
        title: "Immediate Stock Rotation Directive",
        description: `Based on active telemetry, ${criticalExpiryItems.length} product batches will reach expiry within 72 hours (immediate priority: "${criticalExpiryItems[0].name}").`,
        recommendation:
          "Enforce immediate FIFO pick routing for customer orders, introduce kitchen daily specials, or apply flash discounts prior to next delivery intake.",
        severity: "critical",
        actionLabel: "Pick Critical Batches",
        actionHref: "/business/dashboard/inventory",
      });
    }

    // 2. Low Stock Reorder
    if (lowStockItems.length > 0) {
      recs.push({
        type: "RESTOCK",
        title: "Replenishment Threshold Triggered",
        description: `${lowStockItems.length} commercial items have fallen below safety inventory thresholds (≤5 units remaining).`,
        recommendation:
          "Issue supplier reorder requests or review incoming delivery schedules to maintain service continuity.",
        severity: "warning",
        actionLabel: "Review Reorder Needs",
        actionHref: "/business/dashboard/inventory",
      });
    }

    // 3. Overstock / Bulked Lines
    const nearExpiryLargeQty = fifoQueue.find(
      (item) => item.quantity >= 25 && item.daysLeft <= 14
    );
    if (nearExpiryLargeQty) {
      recs.push({
        type: "OVERSTOCK_RISK",
        title: "High-Volume Inventory Dwell Exposure",
        description: `A large volume of "${nearExpiryLargeQty.name}" (${nearExpiryLargeQty.quantity} ${nearExpiryLargeQty.unit}) has a 14-day expiry horizon.`,
        recommendation:
          "Accelerate order volume throughput or package in bulk promotions to mitigate potential disposal write-offs.",
        severity: "warning",
      });
    }

    // 4. Fallback nominal
    if (recs.length === 0) {
      recs.push({
        type: "STABLE",
        title: "Commercial Inventory Parameters Nominal",
        description:
          "No immediate expiry hazards or restock deficits identified from current inventory telemetry.",
        recommendation:
          "Maintain active FIFO retrieval discipline and execute scheduled weekly physical cycle audits.",
        severity: "healthy",
      });
    }

    return recs;
  }, [fifoQueue, lowStockItems]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* 1. Operations Header */}
      <StrategyOperationsHeader
        totalBatches={inventory.length}
        criticalCount={criticalCount}
        warningCount={watchCount}
      />

      {/* 2. Operations KPI Strip */}
      <StrategyKPIGrid
        criticalCount={criticalCount}
        criticalUnits={criticalUnits}
        watchCount={watchCount}
        watchUnits={watchUnits}
        lowStockCount={lowStockItems.length}
        bulkCount={bulkCount}
      />

      {/* 3. Directives & Category Risk Density Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OperationalInsightsCard recommendations={strategyRecommendations} />
        </div>
        <div>
          <CategoryRiskMatrix exposureList={exposureList} />
        </div>
      </div>

      {/* 4. FIFO Priority Queue Sequence */}
      <FifoPriorityQueue items={fifoQueue} />

      {/* 5. Restock Deficits Panel */}
      <section aria-labelledby="restock-heading" className="rounded-3xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              id="restock-heading"
              className="font-serif text-lg font-bold text-[var(--shelf-dark)] flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4 text-[var(--shelf-forest)]" />
              Depleted Stock &amp; Restock Alerts
            </h3>
            <p className="text-xs text-[var(--shelf-muted)]">
              Products with quantities at or below 5 units requiring reorder attention.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--shelf-muted)]">
            {lowStockItems.length} Product{lowStockItems.length !== 1 ? "s" : ""}
          </span>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--shelf-border)] p-8 text-center text-xs text-[var(--shelf-muted)]">
            No stock deficits detected. All inventory lines maintain sufficient buffer stock.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 flex justify-between items-center hover:border-[var(--shelf-forest)]/40 transition shadow-xs"
              >
                <div>
                  <h4 className="font-bold text-sm text-[var(--shelf-dark)]">{item.name}</h4>
                  <p className="text-xs text-[var(--shelf-muted)] mt-0.5 font-mono">
                    Remaining:{" "}
                    <span className="font-bold text-[var(--shelf-terracotta)]">
                      {item.quantity} {item.unit}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/business/dashboard/inventory/${item.id}/edit`}
                  className="rounded-xl bg-[var(--shelf-forest)] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition shadow-xs"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
