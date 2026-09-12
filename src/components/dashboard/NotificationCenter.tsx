"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Activity,
  Check,
  Trash2,
  Calendar,
  Filter,
} from "lucide-react";
import {
  ActivityNotification,
  NotificationCategory,
  buildNotificationFeed,
  groupNotificationsChronologically,
  RawActivityRecord,
  RawConsumptionRecord,
  RawInventoryItem,
} from "@/lib/notifications";
import NotificationFeedItem from "@/components/notifications/NotificationFeedItem";

interface NotificationCenterProps {
  inventory: RawInventoryItem[];
  consumptions?: RawConsumptionRecord[];
  activities?: RawActivityRecord[];
  isBusiness?: boolean;
}

export default function NotificationCenter({
  inventory,
  consumptions = [],
  activities = [],
  isBusiness = false,
}: NotificationCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("all");
  const [cleared, setCleared] = useState(false);

  const currentDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Generate verified activity notifications feed
  const allNotifications = useMemo(() => {
    if (cleared) return [];
    return buildNotificationFeed(activities, consumptions, inventory, isBusiness);
  }, [activities, consumptions, inventory, isBusiness, cleared]);

  const filteredNotifications = useMemo(() => {
    if (selectedCategory === "all") return allNotifications;
    return allNotifications.filter((n) => n.category === selectedCategory);
  }, [allNotifications, selectedCategory]);

  const chronologicalGroups = useMemo(() => {
    return groupNotificationsChronologically(filteredNotifications);
  }, [filteredNotifications]);

  const tabs: Array<{ id: NotificationCategory; label: string; count: number }> = [
    { id: "all", label: "All Activity", count: allNotifications.length },
    {
      id: "ingestion",
      label: "Ingestion & Imports",
      count: allNotifications.filter((n) => n.category === "ingestion").length,
    },
    {
      id: "ai",
      label: "AI Milestones",
      count: allNotifications.filter((n) => n.category === "ai").length,
    },
    {
      id: "consumption",
      label: "Kitchen Usage",
      count: allNotifications.filter((n) => n.category === "consumption").length,
    },
    {
      id: "system",
      label: "System Logs",
      count: allNotifications.filter((n) => n.category === "system").length,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* 1. Editorial Masthead matching Analytics, Recipes, and Waste */}
      <header className="border-b border-[var(--shelf-border)]/60 pb-6 pt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <Bell size={12} />
                Activity Milestone Feed
              </span>
              <span className="text-xs text-[var(--shelf-muted)]">
                {isBusiness ? "Commercial Operations" : "Household Pantry"} • {currentDate}
              </span>
            </div>

            <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-4xl">
              Activity & Notifications
            </h1>
            <p className="mt-1 text-sm text-[var(--shelf-muted)]">
              Quiet chronological record of stock ingestion, AI synchronizations, and pantry usage.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:self-end">
            <button
              type="button"
              onClick={() => setCleared(true)}
              disabled={allNotifications.length === 0}
              className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--shelf-dark)] shadow-xs transition hover:bg-[var(--shelf-cream)]/40 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={13} className="text-[var(--shelf-muted)]" />
              Clear Feed
            </button>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--shelf-border)]/50 bg-[var(--shelf-cream)]/30 px-3 py-1 text-xs font-medium text-[var(--shelf-dark)]">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>
              <strong>Activity Stream:</strong> {allNotifications.length} Events Logged
            </span>
            <span className="text-[var(--shelf-muted)]">•</span>
            <span>Zero False Urgency Pings</span>
          </div>
        </div>
      </header>

      {/* 2. Category Filter Navigation Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const active = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`sl-focus-ring inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                active
                  ? "bg-[var(--shelf-forest)] text-white shadow-xs"
                  : "border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)]/40"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] font-bold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-[var(--shelf-cream)] text-[var(--shelf-dark)]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Chronologically Grouped Notification Stream */}
      {chronologicalGroups.length === 0 ? (
        <div className="sl-editorial-card flex flex-col items-center justify-center p-12 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CheckCircle2 size={30} />
          </div>
          <h3 className="mt-4 font-serif text-xl font-normal text-[var(--shelf-dark)]">
            Activity Feed Up to Date
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-[var(--shelf-muted)] sm:text-sm">
            All system actions and background tasks have been cleared. New imports and cooking logs will populate here automatically.
          </p>
          <div className="mt-5">
            <Link
              href={isBusiness ? "/business/dashboard" : "/dashboard"}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] shadow-xs transition hover:bg-[var(--shelf-cream)]/40"
            >
              Return to Command Center →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {chronologicalGroups.map((group) => (
            <div key={group.groupLabel} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--shelf-muted)]">
                  {group.groupLabel}
                </span>
                <div className="flex-1 h-px bg-[var(--shelf-border)]/50" />
              </div>

              <div className="space-y-2.5">
                {group.items.map((item) => (
                  <NotificationFeedItem key={item.id} notification={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
