"use client";

import { useMemo, useEffect, useState } from "react";
import { Clock, Calendar, AlertTriangle, ShieldCheck, Thermometer, Info } from "lucide-react";
import { getDaysUntilExpiry, formatExpiry } from "@/lib/format-expiry";

interface ExpirationVisualizerProps {
  expiryDate: string | null;
  createdAt?: string | Date | null;
  category: string;
}

function getRecommendedStorage(category: string): {
  zone: string;
  temp: string;
  advice: string;
} {
  const cat = category.toLowerCase();
  if (cat.includes("dairy") || cat.includes("milk") || cat.includes("yogurt") || cat.includes("cheese")) {
    return {
      zone: "Refrigerator (Cold Shelf)",
      temp: "2°C - 4°C",
      advice: "Store on middle or lower shelves; avoid door compartments where temperatures fluctuate.",
    };
  }
  if (cat.includes("meat") || cat.includes("poultry") || cat.includes("beef") || cat.includes("chicken")) {
    return {
      zone: "Refrigerator (Lowest Shelf)",
      temp: "0°C - 2°C",
      advice: "Keep sealed in original packaging on the bottom shelf to avoid any accidental drippage.",
    };
  }
  if (cat.includes("fish") || cat.includes("seafood") || cat.includes("salmon")) {
    return {
      zone: "Chilled Refrigerator",
      temp: "0°C - 1°C",
      advice: "Cook within 24-48 hours of purchase or wrap securely and freeze immediately.",
    };
  }
  if (cat.includes("produce") || cat.includes("fruit") || cat.includes("veg")) {
    return {
      zone: "Crisper Humidity Drawer",
      temp: "4°C - 7°C",
      advice: "Maintain controlled humidity. Keep ethylene emitters (apples, bananas) separate.",
    };
  }
  if (cat.includes("bakery") || cat.includes("bread")) {
    return {
      zone: "Dry Breadbox / Pantry",
      temp: "18°C - 21°C",
      advice: "Store in a cool dry area away from direct sunlight; avoid refrigeration as it accelerates staling.",
    };
  }
  if (cat.includes("frozen") || cat.includes("ice")) {
    return {
      zone: "Deep Freezer",
      temp: "-18°C",
      advice: "Keep frozen solid. Wrap tightly to prevent freezer burn.",
    };
  }
  return {
    zone: "Dry Ambient Pantry",
    temp: "15°C - 22°C",
    advice: "Store in a dark, cool cupboard away from heat sources and direct sunlight.",
  };
}

export default function ExpirationVisualizer({
  expiryDate,
  createdAt,
  category,
}: ExpirationVisualizerProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const days = getDaysUntilExpiry(expiryDate);
  const storage = getRecommendedStorage(category);

  // Calculate elapsed lifecycle percentage
  const { percentElapsed, totalDaysExpected, entryDateFormatted, expiryDateFormatted } = useMemo(() => {
    if (!expiryDate) {
      return {
        percentElapsed: 0,
        totalDaysExpected: null,
        entryDateFormatted: "Catalog entry",
        expiryDateFormatted: "Not specified",
      };
    }

    const expiry = new Date(expiryDate).getTime();
    const entry = createdAt ? new Date(createdAt).getTime() : expiry - 14 * 86400000;
    const now = Date.now();

    const totalDuration = Math.max(86400000, expiry - entry);
    const elapsed = Math.max(0, now - entry);
    const calculatedPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

    return {
      percentElapsed: calculatedPercent,
      totalDaysExpected: Math.round(totalDuration / 86400000),
      entryDateFormatted: new Date(entry).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      expiryDateFormatted: new Date(expiry).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  }, [expiryDate, createdAt]);

  // Smooth ease-out fill animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(percentElapsed);
    }, 80);
    return () => clearTimeout(timer);
  }, [percentElapsed]);

  const isExpired = Number.isFinite(days) && days < 0;
  const isExpiringSoon = Number.isFinite(days) && days >= 0 && days <= 3;

  // Status styling tokens
  const statusColor = isExpired
    ? "from-rose-500 to-rose-600"
    : isExpiringSoon
    ? "from-amber-500 to-amber-600"
    : "from-emerald-500 to-emerald-600";

  return (
    <div className="sl-editorial-card p-5 sm:p-6 space-y-5">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--app-border-subtle)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-accent-emerald)]/10 text-[var(--app-accent-emerald)]">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-[var(--app-text-display)]">
              Shelf-Life Progression
            </h3>
            <p className="text-xs text-[var(--app-text-muted)]">
              Visual physical-to-digital twin freshness countdown
            </p>
          </div>
        </div>

        {/* Big Tabular Days Readout */}
        <div className="flex items-center gap-2">
          {Number.isFinite(days) ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]">
              {isExpired ? (
                <AlertTriangle size={15} className="text-rose-500" />
              ) : isExpiringSoon ? (
                <AlertTriangle size={15} className="text-amber-500" />
              ) : (
                <ShieldCheck size={15} className="text-[var(--app-accent-emerald)]" />
              )}
              <span className="sl-tabular-num font-mono text-xs sm:text-sm font-bold text-[var(--app-text-display)]">
                {days < 0
                  ? `Expired ${Math.abs(days)} day(s) ago`
                  : days === 0
                  ? "Expires today"
                  : `${days} day(s) remaining`}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] text-xs text-[var(--app-text-muted)]">
              No date set
            </div>
          )}
        </div>
      </div>

      {/* Progress Track & Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[var(--app-text-muted)]">Freshness Journey</span>
          <span className="font-mono text-xs font-bold text-[var(--app-text-display)]">
            {animatedPercent}% elapsed
          </span>
        </div>

        {/* Track Container */}
        <div
          role="progressbar"
          aria-valuenow={animatedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${animatedPercent}% shelf-life elapsed, ${days} days remaining`}
          className="relative h-3 w-full overflow-hidden rounded-full bg-[var(--app-surface-base)] border border-[var(--app-border-subtle)]"
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${statusColor} transition-all duration-500 ease-out shadow-xs`}
            style={{ width: `${animatedPercent}%` }}
          />
        </div>

        {/* Milestone Tick Marks */}
        <div className="flex justify-between items-center text-[11px] text-[var(--app-text-muted)] font-medium pt-1">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent-emerald)]" />
            Added ({entryDateFormatted})
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[var(--app-text-muted)]">
            Optimal Freshness Zone
          </span>
          <span className="flex items-center gap-1">
            Target Expiry ({expiryDateFormatted})
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isExpired ? "bg-rose-500" : isExpiringSoon ? "bg-amber-500" : "bg-[var(--app-accent-emerald)]"
              }`}
            />
          </span>
        </div>
      </div>

      {/* Environmental & Storage Conditions Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface-elevated)] border border-[var(--app-border-subtle)] text-[var(--app-accent-emerald)]">
            <Thermometer size={14} />
          </div>
          <div>
            <span className="font-bold text-[var(--app-text-display)]">
              {storage.zone}
            </span>
            <span className="text-[var(--app-text-muted)] ml-2">
              (Target: {storage.temp})
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[var(--app-text-muted)] sm:text-right max-w-sm">
          {storage.advice}
        </p>
      </div>
    </div>
  );
}
