import { getDaysUntilExpiry } from "@/lib/format-expiry";
import { getInventoryStatus } from "@/lib/inventory-status";

export type TimeframeScope = "7D" | "30D" | "90D" | "ALL";

export interface RawInventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
}

export interface RawConsumptionRecord {
  id: number;
  productName: string;
  quantityUsed: number;
  unit: string;
  normalizedQuantityUsed?: number | null;
  consumedAt: string;
}

export interface RawActivityRecord {
  id: number;
  productName: string;
  action: string;
  quantity?: number | null;
  unit?: string | null;
  occurredAt: string;
}

export interface ExpiryHorizonBucket {
  key: "expired" | "critical" | "warning" | "medium" | "extended";
  label: string;
  rangeLabel: string;
  count: number;
  percentage: number;
  colorVar: string;
  items: Array<{ name: string; days: number; quantity: number; unit: string }>;
}

export interface CategoryRiskMetric {
  category: string;
  totalCount: number;
  totalQuantity: number;
  countPercentage: number;
  quantityPercentage: number;
  atRiskCount: number; // <= 7 days or expired
  atRiskPercentage: number;
  avgShelfLifeDays: number;
}

export interface AnalyticsSummary {
  totalProducts: number;
  totalQuantity: number;
  healthScore: number;
  freshCount: number;
  criticalCount: number;
  avgDaysToExpiry: number;
  consumptionCount: number;
  consumedQuantity: number;
  discardCount: number;
  discardedQuantity: number;
  foodRescueRate: number; // Percentage of tracked products consumed vs discarded
  horizons: ExpiryHorizonBucket[];
  categories: CategoryRiskMetric[];
  observations: Array<{
    title: string;
    description: string;
    type: "positive" | "warning" | "neutral" | "urgent";
  }>;
}

export function filterRecordsByTimeframe<T extends { consumedAt?: string; occurredAt?: string }>(
  records: T[],
  scope: TimeframeScope
): T[] {
  if (scope === "ALL") return records;

  const now = Date.now();
  const daysMap: Record<TimeframeScope, number> = {
    "7D": 7,
    "30D": 30,
    "90D": 90,
    ALL: Infinity,
  };
  const cutoff = now - daysMap[scope] * 24 * 60 * 60 * 1000;

  return records.filter((r) => {
    const timeStr = r.consumedAt || r.occurredAt;
    if (!timeStr) return true;
    const time = new Date(timeStr).getTime();
    return isNaN(time) || time >= cutoff;
  });
}

export function computeAnalyticsReport(
  inventory: RawInventoryItem[],
  consumptions: RawConsumptionRecord[] = [],
  activities: RawActivityRecord[] = [],
  scope: TimeframeScope = "30D"
): AnalyticsSummary {
  const totalProducts = inventory.length;

  // 1. Expiry horizons
  const buckets: Record<ExpiryHorizonBucket["key"], ExpiryHorizonBucket> = {
    expired: {
      key: "expired",
      label: "Expired",
      rangeLabel: "< 0 days",
      count: 0,
      percentage: 0,
      colorVar: "var(--shelf-terracotta)",
      items: [],
    },
    critical: {
      key: "critical",
      label: "Critical",
      rangeLabel: "0–3 days",
      count: 0,
      percentage: 0,
      colorVar: "var(--shelf-amber)",
      items: [],
    },
    warning: {
      key: "warning",
      label: "Impending",
      rangeLabel: "4–7 days",
      count: 0,
      percentage: 0,
      colorVar: "var(--shelf-amber)",
      items: [],
    },
    medium: {
      key: "medium",
      label: "Standard",
      rangeLabel: "8–30 days",
      count: 0,
      percentage: 0,
      colorVar: "var(--shelf-blue)",
      items: [],
    },
    extended: {
      key: "extended",
      label: "Extended",
      rangeLabel: "30+ days",
      count: 0,
      percentage: 0,
      colorVar: "var(--shelf-sage)",
      items: [],
    },
  };

  let totalDaysLeft = 0;
  let countWithDays = 0;
  let totalQuantity = 0;

  inventory.forEach((item) => {
    totalQuantity += item.quantity;
    const days = getDaysUntilExpiry(item.expiryDate);
    const itemData = {
      name: item.name,
      days,
      quantity: item.quantity,
      unit: item.unit,
    };

    if (item.expiryDate) {
      totalDaysLeft += Math.max(0, days);
      countWithDays++;
    }

    if (days < 0) {
      buckets.expired.count++;
      buckets.expired.items.push(itemData);
    } else if (days <= 3) {
      buckets.critical.count++;
      buckets.critical.items.push(itemData);
    } else if (days <= 7) {
      buckets.warning.count++;
      buckets.warning.items.push(itemData);
    } else if (days <= 30) {
      buckets.medium.count++;
      buckets.medium.items.push(itemData);
    } else {
      buckets.extended.count++;
      buckets.extended.items.push(itemData);
    }
  });

  const horizons: ExpiryHorizonBucket[] = Object.values(buckets).map((b) => ({
    ...b,
    percentage: totalProducts > 0 ? Math.round((b.count / totalProducts) * 100) : 0,
  }));

  const avgDaysToExpiry = countWithDays > 0 ? Math.round(totalDaysLeft / countWithDays) : 0;

  // 2. Health score
  const statuses = inventory.map((item) =>
    getInventoryStatus(item.quantity, item.expiryDate, item.unit)
  );
  const freshCount = statuses.filter((s) => s === "Fresh").length;
  const criticalCount = buckets.expired.count + buckets.critical.count;
  const healthScore = totalProducts === 0 ? 100 : Math.round((freshCount / totalProducts) * 100);

  // 3. Category distribution & risk
  const categoryMap: Record<
    string,
    {
      totalCount: number;
      totalQuantity: number;
      atRiskCount: number;
      daysSum: number;
      daysCount: number;
    }
  > = {};

  inventory.forEach((item) => {
    const cat = item.category?.trim() || "Uncategorized";
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        totalCount: 0,
        totalQuantity: 0,
        atRiskCount: 0,
        daysSum: 0,
        daysCount: 0,
      };
    }
    const bucket = categoryMap[cat];
    bucket.totalCount++;
    bucket.totalQuantity += item.quantity;
    const days = getDaysUntilExpiry(item.expiryDate);
    if (days <= 7) {
      bucket.atRiskCount++;
    }
    if (item.expiryDate) {
      bucket.daysSum += Math.max(0, days);
      bucket.daysCount++;
    }
  });

  const categories: CategoryRiskMetric[] = Object.entries(categoryMap)
    .map(([category, d]) => ({
      category,
      totalCount: d.totalCount,
      totalQuantity: Math.round(d.totalQuantity * 10) / 10,
      countPercentage: totalProducts > 0 ? Math.round((d.totalCount / totalProducts) * 100) : 0,
      quantityPercentage: totalQuantity > 0 ? Math.round((d.totalQuantity / totalQuantity) * 100) : 0,
      atRiskCount: d.atRiskCount,
      atRiskPercentage: d.totalCount > 0 ? Math.round((d.atRiskCount / d.totalCount) * 100) : 0,
      avgShelfLifeDays: d.daysCount > 0 ? Math.round(d.daysSum / d.daysCount) : 0,
    }))
    .sort((a, b) => b.totalCount - a.totalCount);

  // 4. Timeframe-filtered consumption & discard dynamics
  const scopedConsumptions = filterRecordsByTimeframe(consumptions, scope);
  const scopedActivities = filterRecordsByTimeframe(activities, scope);

  const consumptionCount = scopedConsumptions.length;
  const rawConsumedQty = scopedConsumptions.reduce((acc, c) => acc + (c.quantityUsed || 1), 0);
  const consumedQuantity = Math.round(rawConsumedQty * 100) / 100;

  const discardActivities = scopedActivities.filter((a) => a.action.includes("discard"));
  const discardCount = discardActivities.length;
  const rawDiscardedQty = discardActivities.reduce((acc, a) => acc + (a.quantity || 1), 0);
  const discardedQuantity = Math.round(rawDiscardedQty * 100) / 100;

  const totalInteractions = consumptionCount + discardCount;
  const foodRescueRate =
    totalInteractions > 0 ? Math.round((consumptionCount / totalInteractions) * 100) : 100;

  // 5. Contextual AI Observations
  const observations: AnalyticsSummary["observations"] = [];

  if (totalProducts === 0) {
    observations.push({
      title: "Inventory Baseline Accumulating",
      description: "No active products are currently tracked. Import an invoice or add items to generate inventory intelligence.",
      type: "neutral",
    });
  } else {
    // Check critical expiry volume
    if (criticalCount > 0) {
      const topCritical = [...buckets.expired.items, ...buckets.critical.items]
        .slice(0, 3)
        .map((i) => i.name)
        .join(", ");
      observations.push({
        title: "Immediate Freshness Action Required",
        description: `${criticalCount} product${criticalCount > 1 ? "s" : ""} (${topCritical}) need utilization within 72 hours to prevent spoilage.`,
        type: "urgent",
      });
    }

    // Category with shortest shelf life
    const validCategories = categories.filter((c) => c.avgShelfLifeDays > 0);
    if (validCategories.length > 0) {
      const shortestCategory = [...validCategories].sort((a, b) => a.avgShelfLifeDays - b.avgShelfLifeDays)[0];
      observations.push({
        title: `${shortestCategory.category} High Dwell Velocity`,
        description: `${shortestCategory.category} demonstrates the shortest average shelf life (${shortestCategory.avgShelfLifeDays} days). Prioritize in recipe meal planning.`,
        type: "warning",
      });
    }

    // Dominant category share
    if (categories.length > 0 && categories[0].countPercentage >= 35) {
      observations.push({
        title: `Inventory Concentration in ${categories[0].category}`,
        description: `${categories[0].category} accounts for ${categories[0].countPercentage}% of all tracked items. Monitor batch sizes to balance diversification.`,
        type: "neutral",
      });
    }

    // Food rescue efficiency observation
    if (totalInteractions > 0) {
      observations.push({
        title: `Food Rescue Efficiency: ${foodRescueRate}%`,
        description: `${consumptionCount} logged consumption events vs ${discardCount} discards across the selected ${scope} window.`,
        type: foodRescueRate >= 80 ? "positive" : "warning",
      });
    } else {
      observations.push({
        title: "Consumption Trajectory Steady",
        description: `Average shelf lifespan across active inventory is ${avgDaysToExpiry} days. No spoilage incidents logged in this period.`,
        type: "positive",
      });
    }
  }

  return {
    totalProducts,
    totalQuantity: Math.round(totalQuantity * 10) / 10,
    healthScore,
    freshCount,
    criticalCount,
    avgDaysToExpiry,
    consumptionCount,
    consumedQuantity,
    discardCount,
    discardedQuantity,
    foodRescueRate,
    horizons,
    categories,
    observations,
  };
}
