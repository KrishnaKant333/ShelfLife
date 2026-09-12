"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Sparkles } from "lucide-react";

interface GreetingHeaderProps {
  userName?: string | null;
  badge: string;
  subtitle: string;
  isBusiness?: boolean;
}

function getLocalGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return "Good morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }
  if (hour >= 17 && hour < 22) {
    return "Good evening";
  }
  return "Good night";
}

export default function GreetingHeader({
  userName,
  badge,
  subtitle,
  isBusiness = false,
}: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState<string>("Welcome");
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  useEffect(() => {
    setGreeting(getLocalGreeting());
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[var(--app-border-subtle)]/70">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[var(--app-accent-emerald)] shadow-[0_0_6px_var(--app-accent-emerald)]" />
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--app-accent-emerald)]">
            {badge}
          </p>
        </div>
        <h1 className="sl-display-serif mt-1 text-3xl font-bold tracking-tight text-[var(--app-text-display)] sm:text-4xl">
          {greeting}{userName ? `, ${userName}` : ""}.
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[var(--app-text-muted)] max-w-xl">
          {subtitle}
        </p>
      </div>

      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <Link
          href={`${prefix}/inventory/new`}
          className="sl-focus-ring inline-flex items-center gap-1.5 rounded-lg bg-[var(--app-accent-emerald)] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition"
        >
          <Plus size={15} />
          <span>Add Product</span>
        </Link>
        <Link
          href={`${prefix}/inventory/invoice`}
          className="sl-focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3 py-2 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition shadow-2xs"
        >
          <Upload size={14} />
          <span>Scan Invoice / Label</span>
        </Link>
        <Link
          href={`${prefix}/inventory/export`}
          className="sl-focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3 py-2 text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition shadow-2xs"
        >
          <Download size={14} />
          <span>Export Hub</span>
        </Link>
      </div>
    </div>
  );
}
