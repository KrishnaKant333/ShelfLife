"use client";

import { ShieldCheck, TrendingDown, Sparkles, RefreshCw, Calendar, ArrowRight } from "lucide-react";
import { WasteTimeframeScope, WasteReportSummary } from "@/lib/waste";

interface WasteImpactHeaderProps {
  report: WasteReportSummary;
  timeframe: WasteTimeframeScope;
  onTimeframeChange: (scope: WasteTimeframeScope) => void;
  isBusiness?: boolean;
}

export default function WasteImpactHeader({
  report,
  timeframe,
  onTimeframeChange,
  isBusiness = false,
}: WasteImpactHeaderProps) {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Arc stroke dash calculations for circular meter
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.preservationRate / 100) * circumference;

  let efficiencyBadgeColor = "text-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10 border-[var(--shelf-forest)]/20";
  let efficiencyLabel = "Exemplary Food Preservation";
  if (report.preservationRate < 75) {
    efficiencyBadgeColor = "text-[var(--shelf-terracotta)] bg-[var(--shelf-terracotta)]/10 border-[var(--shelf-terracotta)]/20";
    efficiencyLabel = "High Discard Exposure";
  } else if (report.preservationRate < 90) {
    efficiencyBadgeColor = "text-[var(--shelf-amber)] bg-[var(--shelf-amber)]/10 border-[var(--shelf-amber)]/20";
    efficiencyLabel = "Moderate Preservation Pace";
  }

  const timeframes: Array<{ id: WasteTimeframeScope; label: string }> = [
    { id: "7D", label: "7 Days" },
    { id: "30D", label: "30 Days" },
    { id: "90D", label: "Quarter" },
    { id: "ALL", label: "All Time" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Executive Masthead identical to Analytics & Recipes */}
      <header className="border-b border-[var(--shelf-border)]/60 pb-6 pt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--shelf-forest)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--shelf-forest)]">
                <Sparkles size={12} />
                {isBusiness ? "Commercial Operations" : "Executive Food Intelligence"}
              </span>
              <span className="text-xs text-[var(--shelf-muted)]">
                {isBusiness ? "Commercial Sustainability" : "Household Pantry"} • {currentDate}
              </span>
            </div>

            <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-4xl">
              Waste Impact & Preservation Report
            </h1>
            <p className="mt-1 text-sm text-[var(--shelf-muted)]">
              Audited account of food utilized, rescued before expiration, and discard prevention analysis.
            </p>
          </div>

          {/* Temporal Scope Selector */}
          <div className="flex flex-wrap items-center gap-2 sm:self-end">
            <div className="inline-flex items-center rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-1 shadow-xs">
              <Calendar size={14} className="ml-2 mr-1 text-[var(--shelf-muted)] hidden sm:inline" />
              {timeframes.map((s) => {
                const active = timeframe === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onTimeframeChange(s.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
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
          </div>
        </div>

        {/* Synthesis Status Badge */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--shelf-border)]/50 bg-[var(--shelf-cream)]/30 px-3 py-1 text-xs font-medium text-[var(--shelf-dark)]">
            <span
              className={`h-2 w-2 rounded-full ${
                report.preservationRate >= 80
                  ? "bg-[var(--shelf-forest)]"
                  : report.preservationRate >= 50
                  ? "bg-[var(--shelf-amber)]"
                  : "bg-[var(--shelf-terracotta)]"
              }`}
            />
            <span>
              <strong>Preservation Index:</strong> {report.preservationRate}% Preserved
            </span>
            <span className="text-[var(--shelf-muted)]">•</span>
            <span>{report.totalConsumed} units consumed</span>
            <span className="text-[var(--shelf-muted)]">•</span>
            <span>{report.itemsRescued} rescued</span>
            <span className="text-[var(--shelf-muted)]">•</span>
            <span>{report.totalDiscarded} discarded</span>
          </div>
        </div>
      </header>

      {/* 2. Hero Impact Bento Grid using sl-editorial-card */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Dominant Primary Metric Card (7 cols) */}
        <div className="sl-editorial-card relative overflow-hidden p-6 sm:p-8 shadow-xs lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${efficiencyBadgeColor}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {efficiencyLabel}
              </span>
              <h2 className="mt-4 text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)]">
                Preservation Efficiency Rate
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-[var(--shelf-muted)]">
                Scope: {timeframe === "ALL" ? "All Time" : `Past ${timeframe}`}
              </span>
            </div>
          </div>

          <div className="my-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            {/* SVG Circular Meter */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-[var(--shelf-cream)] opacity-60"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-[var(--shelf-forest)] transition-all duration-700 ease-out"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="sl-tabular-num font-mono text-3xl font-extrabold tracking-tight text-[var(--shelf-dark)]">
                  {report.preservationRate}%
                </span>
                <span className="text-[10px] font-bold uppercase text-[var(--shelf-muted)]">
                  Preserved
                </span>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <p className="font-serif text-lg font-semibold text-[var(--shelf-dark)]">
                {report.totalConsumed} food units consumed vs {report.totalDiscarded} discarded
              </p>
              <p className="text-xs text-[var(--shelf-muted)] leading-relaxed max-w-md">
                Every unit preserved honors agricultural resources, lowers household carbon intensity, and eliminates avoidable grocery repurchase costs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border-subtle)] pt-4 text-xs">
            <span className="text-[var(--shelf-muted)] flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-[var(--shelf-forest)]" />
              Active Inventory Health: <strong className="text-[var(--shelf-dark)]">{report.activeFreshRate}% fresh</strong>
            </span>
            <span className="text-[var(--shelf-muted)]">
              Audited by ShelfLife Intelligence
            </span>
          </div>
        </div>

        {/* Secondary Metric Grid (5 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:col-span-5">
          {/* Card 1: Items Rescued */}
          <div className="sl-editorial-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)]">
                Rescued Before Expiry
              </span>
              <span className="rounded-lg bg-[var(--shelf-amber)]/10 p-2 text-[var(--shelf-amber)]">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="sl-tabular-num font-mono text-3xl font-bold text-[var(--shelf-dark)]">
                {report.itemsRescued}
                <span className="ml-1 text-xs font-sans font-normal text-[var(--shelf-muted)]">
                  items saved
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--shelf-muted)]">
                Prepared within 48h of shelf deadline via Kitchen Cooking suggestions.
              </p>
            </div>
          </div>

          {/* Card 2: Estimated Financial Loss */}
          <div className="sl-editorial-card p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)]">
                Estimated Discard Loss
              </span>
              <span className="rounded-lg bg-[var(--shelf-terracotta)]/10 p-2 text-[var(--shelf-terracotta)]">
                <TrendingDown className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="sl-tabular-num font-mono text-3xl font-bold text-[var(--shelf-dark)]">
                ${report.estimatedFinancialLoss.toFixed(2)}
                <span className="ml-1 text-xs font-sans font-normal text-[var(--shelf-muted)]">
                  avoidable loss
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--shelf-muted)]">
                Across {report.totalDiscarded} discarded units (est. benchmark value $3.80/item).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
