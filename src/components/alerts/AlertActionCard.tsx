"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Flame,
  TrendingDown,
  Trash2,
  Utensils,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatExpiry } from "@/lib/format-expiry";

export type AlertSeverity = "Expired" | "Expiring" | "Low Stock";

export interface AlertCardData {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  status: AlertSeverity;
  urgencyText: string;
}

interface AlertActionCardProps {
  alert: AlertCardData;
  onConsume: (alert: AlertCardData) => void;
  onDiscard: (alert: AlertCardData) => void;
  isBusiness?: boolean;
}

export default function AlertActionCard({
  alert,
  onConsume,
  onDiscard,
  isBusiness = false,
}: AlertActionCardProps) {
  const [isResolving, setIsResolving] = useState(false);
  const recipesUrl = "/dashboard/recipes";

  const isExpired = alert.status === "Expired";
  const isExpiring = alert.status === "Expiring";
  const isLowStock = alert.status === "Low Stock";

  // Visual styling mapped to urgency
  let borderLeftColor = "border-l-4 border-l-[var(--shelf-forest)]";
  let badgeStyle = "text-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10 border-[var(--shelf-forest)]/20";
  let StatusIcon = AlertTriangle;

  if (isExpired) {
    borderLeftColor = "border-l-4 border-l-[var(--shelf-terracotta)]";
    badgeStyle = "text-[var(--shelf-terracotta)] bg-[var(--shelf-terracotta)]/10 border-[var(--shelf-terracotta)]/20";
    StatusIcon = AlertTriangle;
  } else if (isExpiring) {
    borderLeftColor = "border-l-4 border-l-[var(--shelf-amber)]";
    badgeStyle = "text-[var(--shelf-amber)] bg-[var(--shelf-amber)]/10 border-[var(--shelf-amber)]/20";
    StatusIcon = Clock;
  } else if (isLowStock) {
    borderLeftColor = "border-l-4 border-l-[var(--shelf-blue)]";
    badgeStyle = "text-[var(--shelf-blue)] bg-[var(--shelf-blue)]/10 border-[var(--shelf-blue)]/20";
    StatusIcon = TrendingDown;
  }

  const handleDiscardClick = () => {
    setIsResolving(true);
    onDiscard(alert);
  };

  const handleConsumeClick = () => {
    onConsume(alert);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`sl-editorial-card ${borderLeftColor} p-5 sm:p-6 transition-all duration-300 ${
        isResolving ? "opacity-30 scale-[0.98]" : "hover:-translate-y-0.5"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Product Details & Urgency Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${badgeStyle}`}>
              <StatusIcon className="h-3 w-3" />
              {alert.status}
            </span>
            <span className="rounded-md border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 px-2 py-0.5 text-[11px] font-medium text-[var(--shelf-muted)]">
              {alert.category}
            </span>
            <span className="text-[11px] font-mono text-[var(--shelf-muted)]">
              Stock: <strong className="text-[var(--shelf-dark)]">{alert.quantity} {alert.unit}</strong>
            </span>
          </div>

          <h3 className="text-base font-bold text-[var(--shelf-dark)] truncate">
            {alert.name}
          </h3>

          <p className="text-xs text-[var(--shelf-muted)] leading-relaxed">
            {isExpired ? (
              <>
                Exceeded shelf limit <strong className="text-[var(--shelf-terracotta)] font-semibold">{formatExpiry(alert.expiryDate)}</strong>. Discard to maintain food safety.
              </>
            ) : isExpiring ? (
              <>
                Expires <strong className="text-[var(--shelf-amber)] font-semibold">{formatExpiry(alert.expiryDate)}</strong>. Consume immediately in tonight's meal.
              </>
            ) : (
              <>
                Depleted stock level below reorder threshold. Replenish item to avoid kitchen shortage.
              </>
            )}
          </p>
        </div>

        {/* 1-Click Action Dock */}
        <div className="flex flex-col sm:flex-col items-stretch gap-2 shrink-0 sm:min-w-32 w-full sm:w-auto">
          {/* Action 1: Consume (for Expiring items) */}
          {!isExpired && (
            <button
              onClick={handleConsumeClick}
              className="sl-focus-ring flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[36px] text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition cursor-pointer"
            >
              <Utensils size={14} />
              <span>Use Stock</span>
            </button>
          )}

          {/* Action 2: Cook in Recipe (for non-expired items in consumer mode) */}
          {!isBusiness && !isExpired && (
            <Link
              href={recipesUrl}
              className="sl-focus-ring flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[36px] text-xs font-semibold text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)]/60 transition cursor-pointer"
            >
              <Sparkles size={14} className="text-[var(--shelf-forest)]" />
              <span>Cook Recipe</span>
            </Link>
          )}

          {/* Action 3: Discard (primary for expired items, secondary for damaged) */}
          <button
            onClick={handleDiscardClick}
            className={`sl-focus-ring flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 sm:py-1.5 min-h-[44px] sm:min-h-[36px] text-xs font-semibold transition cursor-pointer ${
              isExpired
                ? "bg-[var(--shelf-terracotta)] text-white shadow-2xs hover:opacity-90"
                : "border border-[var(--shelf-border)] text-[var(--shelf-terracotta)] hover:bg-[var(--shelf-terracotta)]/10"
            }`}
          >
            <Trash2 size={14} />
            <span>{isExpired ? "Discard & Log" : "Discard"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
