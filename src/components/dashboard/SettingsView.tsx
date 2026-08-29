"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { User, Bell, ShieldAlert, LogOut } from "lucide-react";

interface SettingsViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    accountType: "consumer" | "business";
  };
}

export default function SettingsView({ user }: SettingsViewProps) {
  const [expiryAlerts, setExpiryAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [expiryThreshold, setExpiryThreshold] = useState("7");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load local settings
    const storedExpiry = localStorage.getItem("shelf_expiry_alerts");
    const storedLowStock = localStorage.getItem("shelf_lowstock_alerts");
    const storedThreshold = localStorage.getItem("shelf_expiry_threshold");

    if (storedExpiry !== null) setExpiryAlerts(storedExpiry === "true");
    if (storedLowStock !== null) setLowStockAlerts(storedLowStock === "true");
    if (storedThreshold !== null) setExpiryThreshold(storedThreshold);
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("shelf_expiry_alerts", String(expiryAlerts));
    localStorage.setItem("shelf_lowstock_alerts", String(lowStockAlerts));
    localStorage.setItem("shelf_expiry_threshold", expiryThreshold);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-[var(--shelf-forest)]">
          Configuration
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--shelf-dark)]">
          Settings
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Manage your account profile, threshold thresholds, and system alerts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Navigation Sidebar inside Settings */}
        <div className="space-y-1">
          <div className="rounded-xl bg-[var(--shelf-surface)] border border-[var(--shelf-border)] p-2">
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold bg-[var(--shelf-cream)] text-[var(--shelf-dark)]">
              <User size={18} />
              Profile & Preferences
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-[var(--shelf-dark)] border-b border-[var(--shelf-border)] pb-3">
              Profile Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
                  Name
                </label>
                <p className="mt-1 text-sm font-medium text-[var(--shelf-dark)]">
                  {user.name || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
                  Email Address
                </label>
                <p className="mt-1 text-sm font-medium text-[var(--shelf-dark)] truncate">
                  {user.email}
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
                  Account Type
                </label>
                <span className="mt-1.5 inline-block rounded-full bg-[var(--shelf-cream)] px-3 py-1 text-xs font-semibold uppercase tracking-wider border border-[var(--shelf-border)] text-[var(--shelf-dark)]">
                  {user.accountType}
                </span>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm space-y-6"
          >
            <h3 className="text-lg font-semibold text-[var(--shelf-dark)] border-b border-[var(--shelf-border)] pb-3">
              Notification Preferences
            </h3>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={expiryAlerts}
                  onChange={(e) => setExpiryAlerts(e.target.checked)}
                  className="mt-1 rounded border-[var(--shelf-border)] text-[var(--shelf-forest)] focus:ring-[var(--shelf-forest)]"
                />
                <div>
                  <span className="text-sm font-medium text-[var(--shelf-dark)]">
                    Enable Expiry Alerts
                  </span>
                  <p className="text-xs text-[var(--shelf-muted)]">
                    Notify me when items are approaching their expiration dates.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockAlerts}
                  onChange={(e) => setLowStockAlerts(e.target.checked)}
                  className="mt-1 rounded border-[var(--shelf-border)] text-[var(--shelf-forest)] focus:ring-[var(--shelf-forest)]"
                />
                <div>
                  <span className="text-sm font-medium text-[var(--shelf-dark)]">
                    Enable Low-Stock Alerts
                  </span>
                  <p className="text-xs text-[var(--shelf-muted)]">
                    Notify me when item quantities drop below critical stock levels.
                  </p>
                </div>
              </label>

              <div className="pt-2">
                <label className="block text-sm font-medium text-[var(--shelf-dark)]">
                  Expiration Alert Threshold (Days)
                </label>
                <select
                  value={expiryThreshold}
                  onChange={(e) => setExpiryThreshold(e.target.value)}
                  className="mt-1 block w-full max-w-[200px] rounded-xl border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                >
                  <option value="2">2 Days before expiry</option>
                  <option value="5">5 Days before expiry</option>
                  <option value="7">7 Days before expiry</option>
                  <option value="14">14 Days before expiry</option>
                  <option value="30">30 Days before expiry</option>
                </select>
              </div>
            </div>

            {saved && (
              <p className="text-sm text-green-700 font-medium">
                ✓ Preferences updated successfully.
              </p>
            )}

            <div className="flex justify-end border-t border-[var(--shelf-border)] pt-4">
              <button
                type="submit"
                className="rounded-xl bg-[var(--shelf-forest)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Save Preferences
              </button>
            </div>
          </form>

          {/* Danger Zone/Account Actions */}
          <section className="rounded-2xl border border-red-100 bg-red-50/50 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-red-950 border-b border-red-100 pb-3">
              Session Settings
            </h3>
            <p className="text-sm text-red-900">
              Disconnect from your active ShelfLife account and clear temporary local session state.
            </p>
            <div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
