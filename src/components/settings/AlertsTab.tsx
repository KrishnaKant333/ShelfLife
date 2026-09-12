"use client";

import { Bell, ShieldAlert, Mail, AlertTriangle, CheckSquare } from "lucide-react";

interface AlertsTabProps {
  formData: {
    expiryAlerts: boolean;
    lowStockAlerts: boolean;
    expiryThreshold: string;
    emailDigest: boolean;
    urgentBanner: boolean;
  };
  onChange: (field: string, value: any) => void;
}

export default function AlertsTab({
  formData,
  onChange,
}: AlertsTabProps) {
  return (
    <div className="space-y-6">
      {/* Safeguard Alert Thresholds */}
      <section className="sl-editorial-card p-6 space-y-5">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <Bell size={18} className="text-[var(--shelf-forest)]" />
            Inventory Safeguard Thresholds
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Configure when items are promoted to high-urgency status on your Alerts Command Center.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="settings-expiry-threshold" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Imminent Expiration Horizon
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                id="settings-expiry-threshold"
                value={formData.expiryThreshold}
                onChange={(e) => onChange("expiryThreshold", e.target.value)}
                className="w-full sm:max-w-xs h-11 px-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                <option value="2">2 Days (Critical intervention window)</option>
                <option value="3">3 Days (Fast-paced kitchen cycle)</option>
                <option value="5">5 Days (Standard warning window)</option>
                <option value="7">7 Days (Weekly planning window)</option>
                <option value="14">14 Days (Extended foresight)</option>
              </select>
            </div>
            <p className="text-[11px] text-[var(--shelf-muted)]">
              Items expiring within this number of days are flagged with warm amber safeguards and appear in priority alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Toggle Preferences */}
      <section className="sl-editorial-card p-6 space-y-5">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <ShieldAlert size={18} className="text-[var(--shelf-forest)]" />
            Safeguard Routing & Triggers
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Control which automated checks trigger immediate operational attention.
          </p>
        </div>

        <div className="divide-y divide-[var(--shelf-border)]">
          {/* Expiry Alerts Toggle */}
          <div className="py-3.5 first:pt-0 last:pb-0">
            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--shelf-dark)] flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Enable Expiration Safeguards
                </span>
                <p className="text-[11px] text-[var(--shelf-muted)] max-w-md">
                  Continuously monitors pantry items against real-time clock and routes expiring and expired goods to the Alerts workspace.
                </p>
              </div>
              <div className="relative inline-flex items-center shrink-0">
                <input
                  type="checkbox"
                  checked={formData.expiryAlerts}
                  onChange={(e) => onChange("expiryAlerts", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--shelf-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--shelf-forest)]" />
              </div>
            </label>
          </div>

          {/* Low-Stock Alerts Toggle */}
          <div className="py-3.5 first:pt-0 last:pb-0">
            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--shelf-dark)] flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-blue-500" />
                  Enable Critical Low-Stock Alerts
                </span>
                <p className="text-[11px] text-[var(--shelf-muted)] max-w-md">
                  Flags products whose remaining volume is below 1 package or approaching exhaustion.
                </p>
              </div>
              <div className="relative inline-flex items-center shrink-0">
                <input
                  type="checkbox"
                  checked={formData.lowStockAlerts}
                  onChange={(e) => onChange("lowStockAlerts", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--shelf-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--shelf-forest)]" />
              </div>
            </label>
          </div>

          {/* Urgent Banner Notification Toggle */}
          <div className="py-3.5 first:pt-0 last:pb-0">
            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--shelf-dark)] flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-red-500" />
                  Executive Dashboard Urgent Risk Banner
                </span>
                <p className="text-[11px] text-[var(--shelf-muted)] max-w-md">
                  Shows high-contrast terracotta safeguard banner across the Dashboard when critical expired products require discard.
                </p>
              </div>
              <div className="relative inline-flex items-center shrink-0">
                <input
                  type="checkbox"
                  checked={formData.urgentBanner}
                  onChange={(e) => onChange("urgentBanner", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--shelf-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--shelf-forest)]" />
              </div>
            </label>
          </div>

          {/* Daily Email Digest Toggle */}
          <div className="py-3.5 first:pt-0 last:pb-0">
            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--shelf-dark)] flex items-center gap-1.5">
                  <Mail size={14} className="text-[var(--shelf-forest)]" />
                  Quiet Activity Digest
                </span>
                <p className="text-[11px] text-[var(--shelf-muted)] max-w-md">
                  Consolidates routine receipts and intake confirmations into a single unobtrusive morning ledger.
                </p>
              </div>
              <div className="relative inline-flex items-center shrink-0">
                <input
                  type="checkbox"
                  checked={formData.emailDigest}
                  onChange={(e) => onChange("emailDigest", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--shelf-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--shelf-forest)]" />
              </div>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
