"use client";

import { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  Activity,
  TrendingDown,
  Clock,
  ShieldCheck,
  Flame,
} from "lucide-react";

export type MetricIconType =
  | "package"
  | "alert"
  | "activity"
  | "trending-down"
  | "clock"
  | "shield"
  | "flame";

const ICONS: Record<MetricIconType, React.ElementType> = {
  package: Package,
  alert: AlertTriangle,
  activity: Activity,
  "trending-down": TrendingDown,
  clock: Clock,
  shield: ShieldCheck,
  flame: Flame,
};

interface MetricCounterProps {
  label: string;
  value: number | string;
  description?: string;
  iconType?: MetricIconType;
  icon?: React.ElementType;
  variant?: "default" | "warning" | "danger" | "success";
  suffix?: string;
  isPrimary?: boolean;
}

export default function MetricCounter({
  label,
  value,
  description,
  iconType = "package",
  icon,
  variant = "default",
  suffix = "",
  isPrimary = false,
}: MetricCounterProps) {
  // Resolve icon safely on the client side
  const IconComponent = icon || ICONS[iconType] || Package;

  const numericValue = typeof value === "number" ? value : parseFloat(value.toString());
  const isNumber = !isNaN(numericValue);
  const [displayValue, setDisplayValue] = useState(isNumber ? 0 : value);

  useEffect(() => {
    if (!isNumber) {
      setDisplayValue(value);
      return;
    }

    // Check for prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(numericValue);
      return;
    }

    let start = 0;
    const end = numericValue;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 700; // ms
    const startTime = performance.now();

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(end);
      }
    }

    requestAnimationFrame(update);
  }, [value, numericValue, isNumber]);

  // Variant styles
  const variantStyles = {
    default: {
      border: "border-[var(--app-border-subtle)]",
      iconBg: "bg-[var(--app-surface-base)] text-[var(--app-text-muted)]",
      numberColor: "text-[var(--app-text-display)]",
    },
    success: {
      border: "border-[var(--app-accent-emerald)]/30",
      iconBg: "bg-[var(--app-accent-emerald)]/10 text-[var(--app-accent-emerald)]",
      numberColor: "text-[var(--app-accent-emerald)]",
    },
    warning: {
      border: "border-[var(--app-accent-amber)]/30",
      iconBg: "bg-[var(--app-accent-amber)]/10 text-[var(--app-accent-amber)]",
      numberColor: "text-[var(--app-accent-amber)]",
    },
    danger: {
      border: "border-[var(--app-accent-terracotta)]/30",
      iconBg: "bg-[var(--app-accent-terracotta)]/10 text-[var(--app-accent-terracotta)]",
      numberColor: "text-[var(--app-accent-terracotta)]",
    },
  };

  const style = variantStyles[variant];

  const formattedValue =
    typeof displayValue === "number"
      ? Number.isInteger(displayValue)
        ? displayValue.toLocaleString()
        : Math.round(displayValue * 100) / 100
      : displayValue;

  return (
    <div
      className={`sl-editorial-card p-5 transition-all duration-200 hover:-translate-y-0.5 ${style.border} ${
        isPrimary ? "shadow-sm bg-[var(--app-surface-elevated)]" : "bg-[var(--app-surface-elevated)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
            {label}
          </p>

          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={`sl-tabular-num font-bold tracking-tight ${style.numberColor} ${
                isPrimary ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              }`}
            >
              {formattedValue}
            </span>
            {suffix && (
              <span className="text-lg font-semibold text-[var(--app-text-muted)]">
                {suffix}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-1.5 truncate text-xs text-[var(--app-text-muted)]">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${style.iconBg}`}
        >
          <IconComponent size={18} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}
