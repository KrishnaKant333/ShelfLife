"use client";

import MetricCounter from "@/components/dashboard/MetricCounter";
import { AlertOctagon, Clock, AlertTriangle, Layers, CheckCircle2 } from "lucide-react";

interface StrategyKPIGridProps {
  criticalCount: number;
  criticalUnits: number;
  watchCount: number;
  watchUnits: number;
  lowStockCount: number;
  bulkCount: number;
}

export function StrategyKPIGrid({
  criticalCount,
  criticalUnits,
  watchCount,
  watchUnits,
  lowStockCount,
  bulkCount,
}: StrategyKPIGridProps) {
  return (
    <section aria-label="Inventory Strategy Key Performance Indicators" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Critical FIFO Pick Exposure */}
      <MetricCounter
        label="Immediate Pick Exposure"
        value={criticalCount}
        suffix={criticalCount === 1 ? " batch" : " batches"}
        description={`${criticalUnits} total units expiring in ≤3 days`}
        icon={AlertOctagon}
        variant={criticalCount > 0 ? "danger" : "success"}
        isPrimary={criticalCount > 0}
      />

      {/* 2. 7-Day Rotation Window */}
      <MetricCounter
        label="7-Day Rotation Watch"
        value={watchCount}
        suffix={watchCount === 1 ? " batch" : " batches"}
        description={`${watchUnits} units expiring in 4–7 days`}
        icon={Clock}
        variant={watchCount > 0 ? "warning" : "default"}
      />

      {/* 3. Restock Deficit Risk */}
      <MetricCounter
        label="Stockout Deficits"
        value={lowStockCount}
        suffix={lowStockCount === 1 ? " product" : " products"}
        description="Depleted items below minimum safe buffer (≤5 units)"
        icon={AlertTriangle}
        variant={lowStockCount > 0 ? "warning" : "success"}
      />

      {/* 4. Bulked / Overstock Volume */}
      <MetricCounter
        label="Bulked Inventory Lines"
        value={bulkCount}
        suffix={bulkCount === 1 ? " batch" : " batches"}
        description="High volume stock (≥25 units) requiring active rotation"
        icon={Layers}
        variant="default"
      />
    </section>
  );
}
