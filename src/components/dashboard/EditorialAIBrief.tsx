"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, RefreshCw, ArrowRight, Utensils, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { generateAiInsightsAction } from "@/lib/actions/recipes";
import { getInventoryStatus } from "@/lib/inventory-status";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface EditorialAIBriefProps {
  cacheKey: string; // "consumer" or "business"
  inventory?: InventoryItem[];
}

export default function EditorialAIBrief({
  cacheKey,
  inventory = [],
}: EditorialAIBriefProps) {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusiness = cacheKey === "business";
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  // Calculate live freshness status
  const statuses = inventory.map((item) =>
    getInventoryStatus(item.quantity, item.expiryDate, item.unit)
  );

  const totalItems = inventory.length;
  const alertItems = statuses.filter(
    (s) => s === "Expired" || s === "Expiring" || s === "Low Stock"
  ).length;
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
        setError(res.error || "Failed to generate executive insights.");
      }
    } catch {
      setError("AI intelligence brief is currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <section
      aria-labelledby="ai-brief-title"
      className="sl-editorial-card flex flex-col justify-between p-5 sm:p-6 md:p-7 h-full"
    >
      <div>
        {/* Masthead Header */}
        <div className="flex items-center justify-between border-b border-[var(--app-border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent-emerald)]/10 text-[var(--app-accent-emerald)]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3
                id="ai-brief-title"
                className="text-sm font-bold uppercase tracking-wider text-[var(--app-text-display)]"
              >
                {isBusiness ? "Executive Inventory Brief" : "Kitchen Intelligence Brief"}
              </h3>
              <p className="text-[10px] text-[var(--app-text-muted)] uppercase tracking-wider">
                Synthesized from {totalItems} active product records
              </p>
            </div>
          </div>

          {!loading && insight && (
            <button
              onClick={() => fetchInsights(true)}
              aria-label="Refresh intelligence brief"
              className="sl-focus-ring flex items-center gap-1 rounded-lg p-1.5 text-xs text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-body)] transition"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>

        {/* Editorial Body */}
        <div className="mt-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--app-accent-emerald)]" />
              <p className="mt-3 text-xs text-[var(--app-text-muted)]">
                Synthesizing inventory velocity and culinary pairings...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-4 text-xs text-[var(--app-text-muted)]">
              <p>{error}</p>
              <button
                onClick={() => fetchInsights(true)}
                className="mt-2 font-semibold text-[var(--app-accent-emerald)] hover:underline"
              >
                Retry generation
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/40 p-5 sm:p-6 transition">
              <p className="sl-display-serif text-base sm:text-lg italic leading-relaxed text-[var(--app-text-display)]">
                &ldquo;
                {insight ||
                  (isBusiness
                    ? "Operational stock velocity is stable across key categories. Review FIFO dispatch queue to prevent waste."
                    : "Your pantry is well stocked with fresh staples. Consider using near-expiry produce in a light skillet meal tonight.")}
                &rdquo;
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 pt-4 border-t border-[var(--app-border-subtle)]/60 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-accent-emerald)]/10 px-3 py-1 font-semibold text-[var(--app-accent-emerald)]">
                  Freshness Index: {healthScore}%
                </span>
                {alertItems > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-accent-terracotta)]/10 px-3 py-1 font-semibold text-[var(--app-accent-terracotta)]">
                    {alertItems} Action Item{alertItems === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 pt-2">
        {!isBusiness ? (
          <Link
            href={`${prefix}/recipes`}
            className="sl-focus-ring flex w-full sm:flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--app-accent-emerald)] px-3.5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition"
          >
            <Utensils size={14} />
            <span>Cook With What You Have</span>
          </Link>
        ) : (
          <Link
            href={`${prefix}/strategy`}
            className="sl-focus-ring flex w-full sm:flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--app-accent-emerald)] px-3.5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition"
          >
            <TrendingUp size={14} />
            <span>Manage Inventory Strategy</span>
          </Link>
        )}

        {alertItems > 0 && (
          <Link
            href={`${prefix}/alerts`}
            className="sl-focus-ring flex w-full sm:w-auto items-center justify-center gap-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3.5 py-2.5 text-xs font-medium text-[var(--app-accent-terracotta)] hover:bg-[var(--app-surface-base)] transition"
          >
            <AlertTriangle size={13} />
            <span>View Alerts</span>
          </Link>
        )}
      </div>
    </section>
  );
}
