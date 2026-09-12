"use client";

import { 
  User, 
  SlidersHorizontal, 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  CreditCard 
} from "lucide-react";

export type SettingsTabId = 
  | "account"
  | "preferences"
  | "alerts"
  | "ai"
  | "security"
  | "data"
  | "billing";

export interface SettingsTabItem {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

export function getSettingsTabs(isBusiness: boolean = false): SettingsTabItem[] {
  return [
    {
      id: "account",
      label: "Account & Profile",
      description: "Personal identity and workspace details",
      icon: User,
    },
    {
      id: "preferences",
      label: "Freshness & Rules",
      description: "Shelf life, measurement units, and theme",
      icon: SlidersHorizontal,
    },
    {
      id: "alerts",
      label: "Alerts & Routing",
      description: "Thresholds, frequency, and safeguard triggers",
      icon: Bell,
    },
    {
      id: "ai",
      label: "AI Intelligence",
      description: isBusiness
        ? "Invoice parsing heuristics and duplicate detection"
        : "Recipe creativity and invoice heuristics",
      icon: Sparkles,
    },
    {
      id: "security",
      label: "Security & Sessions",
      description: "Passwords, active sessions, and access",
      icon: ShieldCheck,
    },
    {
      id: "data",
      label: "Data & Export Hub",
      description: "JSON backups, export shortcuts, danger zone",
      icon: Database,
    },
    {
      id: "billing",
      label: "Plan & Billing",
      description: "Tier quotas, subscription, and invoices",
      icon: CreditCard,
    },
  ];
}

export const SETTINGS_TABS = getSettingsTabs(false);

interface SettingsNavRailProps {
  activeTab: SettingsTabId;
  onTabChange: (tabId: SettingsTabId) => void;
  hasUnsavedChanges?: boolean;
  isBusiness?: boolean;
}

export default function SettingsNavRail({
  activeTab,
  onTabChange,
  hasUnsavedChanges = false,
  isBusiness = false,
}: SettingsNavRailProps) {
  const tabs = getSettingsTabs(isBusiness);

  return (
    <>
      {/* Mobile Horizontal Pill Carousel (320px–768px) */}
      <div className="md:hidden w-full overflow-x-auto no-scrollbar pb-2 mb-4 border-b border-[var(--shelf-border)]">
        <div className="flex items-center gap-1.5 min-w-max px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--shelf-forest)] text-white shadow-sm font-semibold"
                    : "bg-[var(--shelf-surface)] text-[var(--shelf-muted)] border border-[var(--shelf-border)] hover:text-[var(--shelf-dark)] hover:border-[var(--shelf-dark)]/20"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-[var(--shelf-muted)]"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Vertical Sub-Nav Rail (240px) */}
      <aside className="hidden md:block w-60 shrink-0">
        <nav className="sticky top-24 space-y-1.5 rounded-2xl bg-[var(--shelf-surface)] border border-[var(--shelf-border)] p-2.5 shadow-sm">
          <div className="px-3 py-2 border-b border-[var(--shelf-border)] mb-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Workspace Settings
            </p>
            {hasUnsavedChanges && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved modifications
              </span>
            )}
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all group ${
                  isActive
                    ? "bg-[var(--shelf-cream)]/70 dark:bg-emerald-950/30 text-[var(--shelf-dark)] font-semibold border border-emerald-600/30 dark:border-emerald-500/30 shadow-xs"
                    : "text-[var(--shelf-muted)] hover:bg-[var(--shelf-cream)]/30 dark:hover:bg-white/[0.03] hover:text-[var(--shelf-dark)] border border-transparent"
                }`}
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[var(--shelf-forest)] text-white shadow-2xs"
                      : "bg-[var(--shelf-border)]/50 text-[var(--shelf-muted)] group-hover:text-[var(--shelf-dark)]"
                  }`}
                >
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${isActive ? "font-semibold text-[var(--shelf-dark)]" : "font-medium"}`}>
                      {tab.label}
                    </p>
                    {tab.badge && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-[var(--shelf-forest)]">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--shelf-muted)] truncate mt-0.5 leading-tight">
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
