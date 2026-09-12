"use client";

import { TimeframeScope } from "@/lib/analytics";
import { Calendar, Download, Printer, Sparkles } from "lucide-react";

interface AnalyticsReportHeaderProps {
  scope: TimeframeScope;
  onScopeChange: (scope: TimeframeScope) => void;
  healthScore: number;
  totalProducts: number;
  isBusiness?: boolean;
}

const SCOPES: Array<{ id: TimeframeScope; label: string }> = [
  { id: "7D", label: "7 Days" },
  { id: "30D", label: "30 Days" },
  { id: "90D", label: "Quarter" },
  { id: "ALL", label: "All Time" },
];

export default function AnalyticsReportHeader({
  scope,
  onScopeChange,
  healthScore,
  totalProducts,
  isBusiness = false,
}: AnalyticsReportHeaderProps) {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="border-b border-[var(--shelf-border)]/60 pb-6 pt-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--shelf-forest)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--shelf-forest)]">
              <Sparkles size={12} />
              Executive Food Intelligence
            </span>
            <span className="text-xs text-[var(--shelf-muted)]">
              {isBusiness ? "Commercial Operations" : "Household Pantry"} • {currentDate}
            </span>
          </div>

          <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-4xl">
            Inventory Intelligence Report
          </h1>
          <p className="mt-1 text-sm text-[var(--shelf-muted)]">
            Empirical stock velocity, shelf-life horizons, and discard prevention analysis.
          </p>
        </div>

        {/* Temporal Scope Selector & Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:self-end">
          <div className="inline-flex items-center rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-1 shadow-xs">
            <Calendar size={14} className="ml-2 mr-1 text-[var(--shelf-muted)] hidden sm:inline" />
            {SCOPES.map((s) => {
              const active = scope === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onScopeChange(s.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-[var(--shelf-forest)] text-white shadow-xs"
                      : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)]/50"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            title="Print or Save PDF Report"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3 py-2 text-xs font-semibold text-[var(--shelf-dark)] shadow-xs transition hover:bg-[var(--shelf-cream)]/40 print:hidden"
          >
            <Printer size={14} className="text-[var(--shelf-muted)]" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Synthesis Status Badge */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--shelf-border)]/50 bg-[var(--shelf-cream)]/30 px-3 py-1 text-xs font-medium text-[var(--shelf-dark)]">
          <span
            className={`h-2 w-2 rounded-full ${
              healthScore >= 80
                ? "bg-[var(--shelf-forest)]"
                : healthScore >= 50
                ? "bg-[var(--shelf-amber)]"
                : "bg-[var(--shelf-terracotta)]"
            }`}
          />
          <span>
            <strong>Health Index:</strong> {healthScore}% Freshness Ratio
          </span>
          <span className="text-[var(--shelf-muted)]">•</span>
          <span>{totalProducts} active products analyzed</span>
        </div>
      </div>
    </div>
  );
}
