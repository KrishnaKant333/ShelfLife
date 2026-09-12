"use client";

import MetricCounter from "@/components/dashboard/MetricCounter";
import { AnalyticsSummary, TimeframeScope } from "@/lib/analytics";

interface MacroMetricBandProps {
  summary: AnalyticsSummary;
  scope: TimeframeScope;
}

export default function MacroMetricBand({ summary, scope }: MacroMetricBandProps) {
  const scopeLabel = scope === "ALL" ? "all-time" : `in ${scope.toLowerCase()}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Active Stock */}
      <MetricCounter
        label="Active Inventory"
        value={summary.totalQuantity}
        description={`${summary.totalProducts} distinct products tracked`}
        iconType="package"
        variant="default"
        isPrimary
      />

      {/* 2. Consumption Velocity */}
      <MetricCounter
        label="Consumption Velocity"
        value={
          summary.consumedQuantity > 0
            ? Math.round(summary.consumedQuantity * 10) / 10
            : summary.consumptionCount
        }
        description={
          summary.consumptionCount > 0
            ? `${summary.consumptionCount} events ${scopeLabel}`
            : `Zero discards ${scopeLabel}`
        }
        iconType="activity"
        variant="success"
      />

      {/* 3. Freshness Health Score */}
      <MetricCounter
        label="Freshness Index"
        value={summary.healthScore}
        suffix="%"
        description={`${summary.freshCount} items in prime freshness`}
        iconType="shield"
        variant={summary.healthScore >= 80 ? "success" : summary.healthScore >= 50 ? "warning" : "danger"}
      />

      {/* 4. Critical Exposure */}
      <MetricCounter
        label="Immediate Risk"
        value={summary.criticalCount}
        description={
          summary.criticalCount > 0
            ? `${summary.criticalCount} items expiring ≤ 72h`
            : "No imminent waste detected"
        }
        iconType="alert"
        variant={summary.criticalCount > 0 ? "danger" : "default"}
      />
    </div>
  );
}
