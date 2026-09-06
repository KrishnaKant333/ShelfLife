"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Sparkles, CheckCircle2, FileSpreadsheet, Activity, ShieldCheck, Check, Trash2, ArrowRight } from "lucide-react";

type NotificationItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

type ActivityEvent = {
  id: string;
  category: "Import" | "AI" | "Usage" | "System";
  title: string;
  detail: string;
  timestamp: string;
  icon: typeof Sparkles;
  iconBg: string;
  link?: string;
};

export default function NotificationCenter({ inventory, isBusiness = false }: { inventory: NotificationItem[]; isBusiness?: boolean }) {
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";
  const [activeTab, setActiveTab] = useState<"All" | "Import" | "AI" | "Usage" | "System">("All");
  const [cleared, setCleared] = useState(false);

  // Generate informational activity stream from current system state
  const mockSystemEvents: ActivityEvent[] = [
    {
      id: "evt-1",
      category: "Import",
      title: "Batch Inventory Sync Complete",
      detail: `${inventory.length} total product items are synchronized and active on your shelf.`,
      timestamp: "Just now",
      icon: FileSpreadsheet,
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      link: `${prefix}/inventory`,
    },
    {
      id: "evt-2",
      category: "AI",
      title: "Groq AI Recipe Engine Ready",
      detail: "ShelfLife AI scanned your non-expired ingredients and generated smart recipe recommendations.",
      timestamp: "10m ago",
      icon: Sparkles,
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      link: `${prefix}/recipes`,
    },
    {
      id: "evt-3",
      category: "Usage",
      title: "Consumption Tracking Active",
      detail: "Usage logs recorded automatically when ingredients are marked consumed.",
      timestamp: "1h ago",
      icon: Activity,
      iconBg: "bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]",
      link: `${prefix}/inventory`,
    },
    {
      id: "evt-4",
      category: "System",
      title: "Account Security & Verification",
      detail: "Your email session is authenticated and protected with Auth.js credentials security.",
      timestamp: "Today",
      icon: ShieldCheck,
      iconBg: "bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]",
      link: `${prefix}/settings`,
    },
  ];

  const events = cleared ? [] : mockSystemEvents.filter(e => activeTab === "All" || e.category === activeTab);

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6 md:p-10 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-[var(--sl-color-surface)] via-[var(--sl-color-surface)] to-[var(--sl-color-action-soft)]/40 p-6 rounded-2xl border border-[var(--shelf-border)] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)]">
            <Bell size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--sl-color-action)]">
              Informational Stream
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
              Activity & Updates
            </h1>
          </div>
        </div>

        {!cleared && events.length > 0 && (
          <button
            type="button"
            onClick={() => setCleared(true)}
            className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)] transition shrink-0"
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-[var(--shelf-surface)] border border-[var(--shelf-border)] p-1.5 rounded-xl shadow-xs">
        {(["All", "Import", "AI", "Usage", "System"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === tab
                ? "bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)] shadow-xs"
                : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-10 text-center shadow-xs">
            <CheckCircle2 className="mx-auto text-[var(--shelf-forest)] h-10 w-10" />
            <h3 className="mt-3 text-base font-bold text-[var(--shelf-dark)]">All Caught Up</h3>
            <p className="mt-1 text-xs text-[var(--shelf-muted)]">No new informational notifications in your stream.</p>
            {cleared && (
              <button
                type="button"
                onClick={() => setCleared(false)}
                className="mt-4 text-xs font-semibold text-[var(--shelf-forest)] hover:underline"
              >
                Restore Activity Log
              </button>
            )}
          </div>
        ) : (
          events.map(({ id, title, detail, timestamp, icon: Icon, iconBg, link, category }) => (
            <div
              key={id}
              className="flex items-start gap-4 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 sm:p-5 transition hover:border-[var(--shelf-sage)] shadow-xs justify-between"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon size={18} />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[var(--shelf-dark)] text-sm truncate">{title}</p>
                    <span className="rounded-full bg-[var(--shelf-cream)] px-2 py-0.5 text-[9px] font-bold text-[var(--shelf-muted)] uppercase tracking-wider shrink-0">
                      {category}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--shelf-muted)] leading-relaxed">{detail}</p>
                  <p className="text-[10px] font-medium text-[var(--shelf-muted)] pt-0.5">{timestamp}</p>
                </div>
              </div>

              {link && (
                <Link
                  href={link}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--shelf-border)] px-3 py-1.5 text-xs font-semibold text-[var(--shelf-forest)] hover:bg-[var(--shelf-cream)] transition shrink-0 self-center"
                >
                  View
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
