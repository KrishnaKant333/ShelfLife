"use client";

import { AlertOctagon, AlertTriangle, CheckCircle2, ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";

export interface StrategyRecommendation {
  type: "EXPIRY_WARNING" | "RESTOCK" | "OVERSTOCK_RISK" | "STABLE";
  title: string;
  description: string;
  recommendation: string;
  severity: "critical" | "warning" | "healthy";
  actionLabel?: string;
  actionHref?: string;
}

interface OperationalInsightsCardProps {
  recommendations: StrategyRecommendation[];
}

export function OperationalInsightsCard({ recommendations }: OperationalInsightsCardProps) {
  return (
    <section aria-labelledby="operational-strategy-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3
          id="operational-strategy-heading"
          className="font-serif text-lg font-bold text-[var(--shelf-dark)] flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4 text-[var(--shelf-forest)]" />
          Operational Strategy &amp; Dispatch Directives
        </h3>
        <span className="text-xs font-mono text-[var(--shelf-muted)]">
          {recommendations.length} Active Directive{recommendations.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3.5">
        {recommendations.map((rec, idx) => {
          let borderClass = "border-[var(--shelf-border)]";
          let bgClass = "bg-[var(--shelf-surface)]";
          let icon = <CheckCircle2 className="h-5 w-5 text-[var(--shelf-forest)]" />;
          let titleColor = "text-[var(--shelf-dark)]";

          if (rec.severity === "critical") {
            borderClass = "border-[var(--shelf-terracotta)]/40";
            bgClass = "bg-[var(--shelf-terracotta)]/5";
            icon = <AlertOctagon className="h-5 w-5 text-[var(--shelf-terracotta)]" />;
            titleColor = "text-[var(--shelf-terracotta)]";
          } else if (rec.severity === "warning") {
            borderClass = "border-[var(--shelf-amber)]/40";
            bgClass = "bg-[var(--shelf-amber)]/5";
            icon = <AlertTriangle className="h-5 w-5 text-[var(--shelf-amber)]" />;
            titleColor = "text-[var(--shelf-amber)]";
          }

          return (
            <div
              key={idx}
              className={`rounded-2xl border ${borderClass} ${bgClass} p-5 sm:p-6 shadow-xs transition hover:shadow-sm`}
            >
              <div className="flex items-start gap-3.5">
                <div className="shrink-0 mt-0.5">{icon}</div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className={`text-base font-bold ${titleColor}`}>
                      {rec.title}
                    </h4>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        rec.severity === "critical"
                          ? "bg-[var(--shelf-terracotta)]/15 text-[var(--shelf-terracotta)] border-[var(--shelf-terracotta)]/30"
                          : rec.severity === "warning"
                          ? "bg-[var(--shelf-amber)]/15 text-[var(--shelf-amber)] border-[var(--shelf-amber)]/30"
                          : "bg-[var(--shelf-forest)]/15 text-[var(--shelf-forest)] border-[var(--shelf-forest)]/30"
                      }`}
                    >
                      {rec.severity}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--shelf-dark)] leading-relaxed">
                    {rec.description}
                  </p>

                  <div className="rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)]/80 p-3 text-xs text-[var(--shelf-muted)]">
                    <span className="font-bold text-[var(--shelf-forest)]">Operational Action:</span>{" "}
                    {rec.recommendation}
                  </div>

                  {rec.actionHref && rec.actionLabel && (
                    <div className="pt-2 flex justify-end">
                      <Link
                        href={rec.actionHref}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--shelf-forest)] hover:underline"
                      >
                        {rec.actionLabel} <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
