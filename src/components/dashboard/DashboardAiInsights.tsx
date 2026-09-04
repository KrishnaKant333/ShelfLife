"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { generateAiInsightsAction } from "@/lib/actions/recipes";
import { getInventoryStatus } from "@/lib/inventory-status";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

interface DashboardAiInsightsProps {
  cacheKey: string; // "consumer" or "business"
  inventory?: InventoryItem[];
}

export default function DashboardAiInsights({ cacheKey, inventory = [] }: DashboardAiInsightsProps) {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate metrics from real inventory data
  const statuses = inventory.map((item) =>
    getInventoryStatus(item.quantity, item.expiryDate, item.unit)
  );

  const totalItems = inventory.length;
  const alertItems = statuses.filter((s) => s === "Expired" || s === "Expiring" || s === "Low Stock").length;
  const freshItems = statuses.filter((s) => s === "Fresh").length;
  const healthScore = totalItems === 0 ? 100 : Math.round((freshItems / totalItems) * 100);

  const fetchInsights = async (bypassCache = false) => {
    const storageKey = `shelflife_ai_insight_${cacheKey}`;
    if (!bypassCache) {
      const cached = sessionStorage.getItem(storageKey);
      if (cached) {
        setInsight(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res = await generateAiInsightsAction();
      if (res.success && res.insight) {
        setInsight(res.insight);
        sessionStorage.setItem(storageKey, res.insight);
      } else {
        setError(res.error || "Failed to generate insights.");
      }
    } catch (err) {
      setError("AI insights could not be retrieved.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const dashboardLabel = cacheKey === "business" ? "Today's Inventory Brief" : "Your ShelfLife Brief";
  const alertsUrl = cacheKey === "business" ? "/business/dashboard/alerts" : "/dashboard/alerts";
  const recipeUrl = "/dashboard/recipes";

  return (
    <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-[var(--shelf-dark)] flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-[var(--shelf-forest)] animate-pulse" />
          {dashboardLabel}
        </h3>
        
        {!loading && insight && (
          <button
            onClick={() => fetchInsights(true)}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--shelf-forest)] hover:underline"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 grid-cols-2 mb-5 pb-5 border-b border-[var(--shelf-border)]/40">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs font-semibold text-[var(--shelf-muted)] uppercase tracking-wider">Inventory Health</span>
          <span className="text-2xl font-bold text-[var(--shelf-dark)]">{healthScore}%</span>
          <span className="text-[10px] text-[var(--shelf-muted)]">{freshItems} fresh items</span>
        </div>
        
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs font-semibold text-[var(--shelf-muted)] uppercase tracking-wider">Items Need Attention</span>
          <span className={`text-2xl font-bold ${alertItems > 0 ? "text-[var(--shelf-terracotta)]" : "text-[var(--shelf-forest)]"}`}>
            {alertItems}
          </span>
          <span className="text-[10px] text-[var(--shelf-muted)]">expired, expiring, or low stock</span>
        </div>
      </div>

      {/* AI Insight Text */}
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-[var(--shelf-muted)] py-3">
            <Loader2 className="h-4.5 w-4.5 animate-spin text-[var(--shelf-forest)]" />
            <span>Analyzing stock levels and preparing insights...</span>
          </div>
        ) : error ? (
          <div className="text-xs text-[var(--shelf-muted)] flex flex-col items-start gap-2">
            <p>Advisory updates are temporarily offline.</p>
            <button
              onClick={() => fetchInsights(true)}
              className="text-xs font-semibold text-[var(--shelf-forest)] hover:underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-[var(--shelf-cream)]/40 border border-[var(--shelf-border)]/50 p-3 text-sm text-[var(--shelf-dark)] leading-relaxed italic">
              &ldquo;{insight || (cacheKey === "business" ? "No active inventory concerns." : "Your inventory is looking fresh!")}&rdquo;
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex gap-2">
              {alertItems > 0 && (
                <Link
                  href={alertsUrl}
                  className="flex-1 text-center rounded-lg bg-[var(--shelf-cream)] text-[var(--shelf-forest)] px-3 py-2 text-xs font-semibold hover:bg-[var(--shelf-cream)]/80 transition"
                >
                  View Alerts
                </Link>
              )}
              {cacheKey === "consumer" && (
                <Link
                  href={recipeUrl}
                  className="flex-1 text-center rounded-lg bg-[var(--shelf-forest)] text-white px-3 py-2 text-xs font-semibold hover:opacity-90 transition"
                >
                  Cook With What You Have
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
