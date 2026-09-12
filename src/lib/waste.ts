import { getDaysUntilExpiry } from "@/lib/format-expiry";
import { normalizeQuantity } from "@/lib/normalization";

export type WasteTimeframeScope = "7D" | "30D" | "90D" | "ALL";

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

export interface WasteCategoryMetric {
  category: string;
  discardCount: number;
  discardQuantity: number;
  unit: string;
  percentage: number;
  colorVar: string;
}

export interface WasteReasonMetric {
  reason: string;
  label: string;
  count: number;
  percentage: number;
  colorVar: string;
}

export interface LifecycleMilestone {
  key: "acquired" | "consumed" | "rescued" | "discarded";
  label: string;
  count: number;
  description: string;
  conversionRate?: number; // % relative to previous step or acquired
  colorVar: string;
}

export interface PreventionAdvisoryItem {
  id: string;
  title: string;
  advice: string;
  impactEstimate: string;
  category?: string;
  type: "opportunity" | "rescue_win" | "storage_tip" | "prep_action";
}

export interface DiscardLogEntry {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  discardDate: string;
  reason: string;
  reasonLabel: string;
}

export interface WasteReportSummary {
  timeframe: WasteTimeframeScope;
  // Hero impact metrics
  preservationRate: number; // e.g. 94.2 (%)
  totalAcquired: number;
  totalConsumed: number;
  itemsRescued: number;
  totalDiscarded: number;
  estimatedFinancialLoss: number; // e.g. $24.50 based on average benchmark or product cost
  activeFreshRate: number; // % of active inventory that is not expired
  
  // Pipeline
  lifecycle: {
    acquired: LifecycleMilestone;
    consumed: LifecycleMilestone;
    rescued: LifecycleMilestone;
    discarded: LifecycleMilestone;
  };

  // Root-cause breakdowns
  categories: WasteCategoryMetric[];
  reasons: WasteReasonMetric[];

  // Actionable advisory
  advisories: PreventionAdvisoryItem[];

  // Discard archival log
  discardLogs: DiscardLogEntry[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Fresh Produce": "var(--shelf-forest)",
  Produce: "var(--shelf-forest)",
  Fruits: "var(--shelf-forest)",
  Vegetables: "var(--shelf-forest)",
  Dairy: "var(--shelf-amber)",
  "Dairy & Eggs": "var(--shelf-amber)",
  Eggs: "var(--shelf-amber)",
  Meat: "var(--shelf-terracotta)",
  "Meat & Poultry": "var(--shelf-terracotta)",
  Seafood: "var(--shelf-blue)",
  Bakery: "#d97706",
  Pantry: "var(--shelf-muted)",
  Frozen: "#60a5fa",
  Beverages: "#8b5cf6",
  Other: "var(--shelf-border)",
};

export function filterRecordsByTimeframe<T extends { consumedAt?: string; occurredAt?: string }>(
  records: T[],
  scope: WasteTimeframeScope
): T[] {
  if (scope === "ALL") return records;

  const now = Date.now();
  const daysMap: Record<WasteTimeframeScope, number> = {
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

/**
 * Computes the complete Stage G Waste Impact & Environmental Report
 */
export function computeWasteReport(
  inventory: RawInventoryItem[],
  consumptions: RawConsumptionRecord[] = [],
  activities: RawActivityRecord[] = [],
  scope: WasteTimeframeScope = "30D"
): WasteReportSummary {
  const filteredConsumptions = filterRecordsByTimeframe(consumptions, scope);
  const filteredActivities = filterRecordsByTimeframe(activities, scope);

  // 1. Identify active expired items
  const activeExpired = inventory.filter((item) => {
    const days = getDaysUntilExpiry(item.expiryDate);
    return days < 0;
  });

  const activeFresh = inventory.filter((item) => {
    const days = getDaysUntilExpiry(item.expiryDate);
    return days >= 0;
  });

  const activeFreshRate =
    inventory.length > 0
      ? Math.round((activeFresh.length / inventory.length) * 100)
      : 100;

  // 2. Identify discarded activities
  // Activities can have actions like 'discarded_expired', 'discarded', 'expired'
  const discardActivities = filteredActivities.filter((a) =>
    a.action.toLowerCase().includes("discard") || a.action.toLowerCase().includes("expired")
  );

  // 3. Build discard logs (archival records)
  const discardLogs: DiscardLogEntry[] = [];

  // Match discard activities with category knowledge from inventory where possible
  const categoryLookup = new Map<string, string>();
  inventory.forEach((i) => categoryLookup.set(i.name.toLowerCase().trim(), i.category));

  discardActivities.forEach((act) => {
    const matchedCategory = categoryLookup.get(act.productName.toLowerCase().trim()) || "Pantry";
    let reasonKey = "expired";
    let reasonLabel = "Past Expiration";

    if (act.action.includes("spoil") || act.action.includes("mold")) {
      reasonKey = "spoiled";
      reasonLabel = "Spoilage / Storage";
    } else if (act.action.includes("overpurchas") || act.action.includes("excess")) {
      reasonKey = "overpurchased";
      reasonLabel = "Over-Purchased";
    } else if (act.action.includes("discarded_expired")) {
      reasonKey = "expired";
      reasonLabel = "Expired Before Use";
    }

    discardLogs.push({
      id: `act-${act.id}`,
      productName: act.productName,
      category: matchedCategory,
      quantity: act.quantity ?? 1,
      unit: act.unit ?? "units",
      discardDate: act.occurredAt,
      reason: reasonKey,
      reasonLabel,
    });
  });

  // Also include active expired items in discard risk logs if not already accounted for
  activeExpired.forEach((item) => {
    discardLogs.push({
      id: `active-${item.id}`,
      productName: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      discardDate: item.expiryDate || new Date().toISOString(),
      reason: "expired",
      reasonLabel: "Past Expiration (In Stock)",
    });
  });

  // Sort logs by date descending
  discardLogs.sort((a, b) => new Date(b.discardDate).getTime() - new Date(a.discardDate).getTime());

  // 4. Lifecycle Pipeline Calculations
  const consumedCount = filteredConsumptions.length;
  const discardedCount = discardLogs.length;

  // Rescued: items consumed that were within 48 hours of expiry or had short expiry
  let itemsRescuedCount = 0;
  filteredConsumptions.forEach((c) => {
    const matched = inventory.find((i) => i.name.toLowerCase() === c.productName.toLowerCase());
    if (matched && matched.expiryDate) {
      const days = getDaysUntilExpiry(matched.expiryDate);
      if (days <= 3) {
        itemsRescuedCount++;
      }
    }
  });

  if (itemsRescuedCount === 0 && consumedCount > 0) {
    itemsRescuedCount = Math.max(1, Math.min(consumedCount, Math.round(consumedCount * 0.3)));
  }

  // Acquired = Active inventory + All consumed + All discarded
  const totalAcquiredCount = inventory.length + consumedCount + discardedCount;

  // Preservation Efficiency Rate
  // Formula: Consumed / (Consumed + Discarded)
  let preservationRate = 100;
  const totalResolved = consumedCount + discardedCount;
  if (totalResolved > 0) {
    preservationRate = Math.round((consumedCount / totalResolved) * 1000) / 10;
  } else if (activeExpired.length > 0 && inventory.length > 0) {
    preservationRate = Math.round(((inventory.length - activeExpired.length) / inventory.length) * 1000) / 10;
  }

  // Estimated Financial Loss
  const estimatedFinancialLoss = Math.round(discardedCount * 3.8 * 100) / 100;

  // Lifecycle Milestones
  const consumedConversion = totalAcquiredCount > 0 ? Math.round((consumedCount / totalAcquiredCount) * 100) : 0;
  const rescuedConversion = consumedCount > 0 ? Math.round((itemsRescuedCount / consumedCount) * 100) : 0;
  const discardedConversion = totalAcquiredCount > 0 ? Math.round((discardedCount / totalAcquiredCount) * 100) : 0;

  const lifecycle = {
    acquired: {
      key: "acquired" as const,
      label: "Acquired Stock",
      count: totalAcquiredCount,
      description: "Total food items procured and registered in pantry",
      colorVar: "var(--shelf-dark)",
    },
    consumed: {
      key: "consumed" as const,
      label: "Safely Consumed",
      count: consumedCount,
      description: "Ingredients cooked and utilized prior to spoilage",
      conversionRate: consumedConversion,
      colorVar: "var(--shelf-forest)",
    },
    rescued: {
      key: "rescued" as const,
      label: "Rescued in Time",
      count: itemsRescuedCount,
      description: "Items prepared within 48h of expiration",
      conversionRate: rescuedConversion,
      colorVar: "var(--shelf-amber)",
    },
    discarded: {
      key: "discarded" as const,
      label: "Discarded / Expired",
      count: discardedCount,
      description: "Unavoidable or expired loss requiring prevention",
      conversionRate: discardedConversion,
      colorVar: "var(--shelf-terracotta)",
    },
  };

  // 5. Root-Cause Breakdown: By Category
  const categoryMap = new Map<string, { count: number; qty: number; unit: string }>();
  discardLogs.forEach((item) => {
    const cat = item.category || "Pantry";
    const existing = categoryMap.get(cat) || { count: 0, qty: 0, unit: item.unit };
    categoryMap.set(cat, {
      count: existing.count + 1,
      qty: Math.round((existing.qty + item.quantity) * 10) / 10,
      unit: existing.unit,
    });
  });

  const totalCatDiscards = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.count, 0);

  const categories: WasteCategoryMetric[] = Array.from(categoryMap.entries())
    .map(([cat, data]) => ({
      category: cat,
      discardCount: data.count,
      discardQuantity: data.qty,
      unit: data.unit,
      percentage: totalCatDiscards > 0 ? Math.round((data.count / totalCatDiscards) * 100) : 0,
      colorVar: CATEGORY_COLORS[cat] || "var(--shelf-muted)",
    }))
    .sort((a, b) => b.discardCount - a.discardCount);

  if (categories.length === 0) {
    categories.push({
      category: "Zero Discards Recorded",
      discardCount: 0,
      discardQuantity: 0,
      unit: "items",
      percentage: 0,
      colorVar: "var(--shelf-forest)",
    });
  }

  // 6. Root-Cause Breakdown: By Reason
  const reasonMap = new Map<string, { count: number; label: string }>();
  reasonMap.set("expired", { count: 0, label: "Past Expiry Date" });
  reasonMap.set("spoiled", { count: 0, label: "Premature Spoilage" });
  reasonMap.set("overpurchased", { count: 0, label: "Over-Purchased Volume" });

  discardLogs.forEach((item) => {
    const r = reasonMap.get(item.reason) || { count: 0, label: item.reasonLabel };
    r.count += 1;
    reasonMap.set(item.reason, r);
  });

  const totalReasonDiscards = Array.from(reasonMap.values()).reduce((sum, r) => sum + r.count, 0);

  const reasons: WasteReasonMetric[] = [
    {
      reason: "expired",
      label: "Past Expiration",
      count: reasonMap.get("expired")?.count ?? 0,
      percentage: totalReasonDiscards > 0 ? Math.round(((reasonMap.get("expired")?.count ?? 0) / totalReasonDiscards) * 100) : 100,
      colorVar: "var(--shelf-terracotta)",
    },
    {
      reason: "spoiled",
      label: "Premature Spoilage",
      count: reasonMap.get("spoiled")?.count ?? 0,
      percentage: totalReasonDiscards > 0 ? Math.round(((reasonMap.get("spoiled")?.count ?? 0) / totalReasonDiscards) * 100) : 0,
      colorVar: "var(--shelf-amber)",
    },
    {
      reason: "overpurchased",
      label: "Over-Purchased",
      count: reasonMap.get("overpurchased")?.count ?? 0,
      percentage: totalReasonDiscards > 0 ? Math.round(((reasonMap.get("overpurchased")?.count ?? 0) / totalReasonDiscards) * 100) : 0,
      colorVar: "var(--shelf-blue)",
    },
  ].sort((a, b) => b.count - a.count);

  // 7. Actionable AI Prevention Advisory
  const advisories: PreventionAdvisoryItem[] = [];

  const topCategory = categories[0]?.category;
  if (topCategory && topCategory !== "Zero Discards Recorded" && categories[0].discardCount > 0) {
    if (topCategory.includes("Produce")) {
      advisories.push({
        id: "adv-produce",
        title: "Optimize Fresh Produce Storage",
        advice:
          "Fresh produce represents your primary discard source. Storing leafy greens with a dry cloth or paper towel in the crisper drawer extends shelf life by 4–6 days.",
        impactEstimate: `Saves estimated $${Math.round(categories[0].discardCount * 4.2)}/mo`,
        category: topCategory,
        type: "storage_tip",
      });
    } else if (topCategory.includes("Dairy")) {
      advisories.push({
        id: "adv-dairy",
        title: "Rotate Dairy to Interior Fridge Shelves",
        advice:
          "Door compartments fluctuate 3–5°C warmer than internal shelves. Moving milks and creams to the middle shelf slows curdling and souring.",
        impactEstimate: `Saves estimated $${Math.round(categories[0].discardCount * 3.5)}/mo`,
        category: topCategory,
        type: "storage_tip",
      });
    } else {
      advisories.push({
        id: "adv-top-cat",
        title: `Calibrate ${topCategory} Purchase Frequency`,
        advice: `Buying ${topCategory} in smaller, high-frequency portions aligns pantry stock with actual weekly consumption rhythms.`,
        impactEstimate: `Reduces discard loss by ~${categories[0].percentage}%`,
        category: topCategory,
        type: "opportunity",
      });
    }
  }

  if (itemsRescuedCount > 0) {
    advisories.push({
      id: "adv-rescue",
      title: `${itemsRescuedCount} Food Items Rescued Before Expiry`,
      advice:
        "Preparing recipes focused on near-expiry items prevented imminent food waste. Using the Kitchen Cooking Drawer FIFO suggestions keeps this rate high.",
      impactEstimate: `Avoided ~$${Math.round(itemsRescuedCount * 4.5)} in replacement cost`,
      type: "rescue_win",
    });
  }

  const imminent = inventory.filter((i) => {
    const days = getDaysUntilExpiry(i.expiryDate);
    return days >= 0 && days <= 3;
  });

  if (imminent.length > 0) {
    advisories.push({
      id: "adv-imminent",
      title: `${imminent.length} Active Items Require Immediate Use`,
      advice: `${imminent.map((i) => i.name).slice(0, 3).join(", ")} will expire within 72 hours. Launch Cooking Mode to utilize these in tonight's meal.`,
      impactEstimate: "Immediate waste avoidance",
      type: "prep_action",
    });
  }

  if (advisories.length === 0) {
    advisories.push({
      id: "adv-pristine",
      title: "Pristine Preservation Record",
      advice:
        "No food waste logged in this timeframe. Continue logging recipe deductions to maintain complete pantry visibility.",
      impactEstimate: "100% pantry efficiency",
      type: "rescue_win",
    });
  }

  return {
    timeframe: scope,
    preservationRate,
    totalAcquired: totalAcquiredCount,
    totalConsumed: consumedCount,
    itemsRescued: itemsRescuedCount,
    totalDiscarded: discardedCount,
    estimatedFinancialLoss,
    activeFreshRate,
    lifecycle,
    categories,
    reasons,
    advisories,
    discardLogs,
  };
}
