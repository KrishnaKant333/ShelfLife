"use client";

import Link from "next/link";
import {
  FileSpreadsheet,
  Sparkles,
  Utensils,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ActivityNotification } from "@/lib/notifications";

interface NotificationFeedItemProps {
  notification: ActivityNotification;
}

export default function NotificationFeedItem({
  notification,
}: NotificationFeedItemProps) {
  // Category-specific quiet styling
  let iconBg = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  let Icon = Activity;
  let categoryLabel = "System";

  if (notification.category === "ingestion") {
    iconBg = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    Icon = FileSpreadsheet;
    categoryLabel = "Ingestion";
  } else if (notification.category === "ai") {
    iconBg = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    Icon = Sparkles;
    categoryLabel = "AI Intelligence";
  } else if (notification.category === "consumption") {
    iconBg = "bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)] border-[var(--shelf-forest)]/20";
    Icon = Utensils;
    categoryLabel = "Kitchen Usage";
  }

  function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  }

  return (
    <div
      role="log"
      className="sl-editorial-card p-4 sm:p-5 transition hover:-translate-y-0.5 hover:shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconBg}`}>
          <Icon size={16} />
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              {categoryLabel}
            </span>
            <span className="text-[10px] text-[var(--shelf-muted)] font-mono flex items-center gap-1">
              <Clock size={10} />
              {formatRelativeTime(notification.occurredAt)}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-[var(--shelf-dark)] truncate">
            {notification.title}
          </h4>

          <p className="text-xs text-[var(--shelf-muted)] leading-relaxed line-clamp-2">
            {notification.detail}
          </p>
        </div>
      </div>

      {notification.link && (
        <Link
          href={notification.link}
          className="sl-focus-ring self-start sm:self-center shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[var(--shelf-forest)] hover:underline px-2.5 py-1 rounded-lg hover:bg-[var(--shelf-cream)]/50 transition cursor-pointer"
        >
          <span>{notification.linkLabel || "View Details"}</span>
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}
