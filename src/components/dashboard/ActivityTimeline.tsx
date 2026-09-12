"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Utensils, Plus, Trash2, Activity } from "lucide-react";
import { getRecentConsumptionAction, type ConsumptionRecord } from "@/lib/actions/recipes";

interface ActivityTimelineProps {
  isBusiness?: boolean;
}

export default function ActivityTimeline({ isBusiness = false }: ActivityTimelineProps) {
  const [history, setHistory] = useState<ConsumptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await getRecentConsumptionAction();
        if (res.success && res.history) {
          setHistory(res.history.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load activity:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

  function formatTimeAgo(dateString: string): string {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  }

  return (
    <section
      aria-labelledby="activity-timeline-title"
      className="sl-editorial-card flex flex-col justify-between p-5 sm:p-6"
    >
      <div>
        <div className="flex items-center justify-between border-b border-[var(--app-border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-surface-base)] text-[var(--app-text-muted)]">
              <Clock size={16} />
            </div>
            <div>
              <h3
                id="activity-timeline-title"
                className="text-sm font-bold uppercase tracking-wider text-[var(--app-text-display)]"
              >
                Recent Activity
              </h3>
              <p className="text-[10px] text-[var(--app-text-muted)] uppercase tracking-wider">
                Chronological ledger
              </p>
            </div>
          </div>

          <Link
            href={`${prefix}/waste`}
            className="sl-focus-ring text-xs font-semibold text-[var(--app-accent-emerald)] hover:underline"
          >
            Ledger →
          </Link>
        </div>

        <div className="mt-5 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-[var(--app-text-muted)]">
              Loading recent timeline...
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--app-text-muted)]">
              No recent inventory activity recorded yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--app-border-subtle)]">
              {history.map((record) => (
                <div key={record.id} className="relative flex items-start justify-between gap-3 text-xs">
                  {/* Status Pip */}
                  <span className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--app-surface-elevated)] bg-[var(--app-surface-base)] text-[var(--app-accent-emerald)] shadow-2xs">
                    <Utensils size={10} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--app-text-display)]">
                      Consumed {record.productName}
                    </p>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      {record.quantityUsed} {record.unit} used
                    </p>
                  </div>

                  <span className="shrink-0 text-[10px] font-mono text-[var(--app-text-muted)]">
                    {formatTimeAgo(record.consumedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-[var(--app-border-subtle)] pt-3 text-right">
        <Link
          href={`${prefix}/inventory`}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text-body)]"
        >
          <span>View full inventory catalog</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}
