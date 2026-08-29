"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { generateAiInsightsAction } from "@/lib/actions/recipes";

interface DashboardAiInsightsProps {
  cacheKey: string; // "consumer" or "business"
}

export default function DashboardAiInsights({ cacheKey }: DashboardAiInsightsProps) {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--shelf-dark)] flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-[var(--shelf-forest)] animate-pulse" />
          AI ShelfLife Brief
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

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-[var(--shelf-muted)] py-2">
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
          <div className="rounded-xl bg-[var(--shelf-cream)]/40 border border-[var(--shelf-border)]/50 p-4 text-sm text-[var(--shelf-dark)] leading-relaxed italic">
            &ldquo;{insight || "No active insights. Your inventory is clear!"}&rdquo;
          </div>
        )}
      </div>
    </section>
  );
}
