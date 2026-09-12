"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Scale, Clock, UtensilsCrossed } from "lucide-react";

interface PreferencesTabProps {
  formData: {
    shelfLifeBuffer: string;
    unitSystem: string;
    showCulinaryDualDisplay: boolean;
  };
  onChange: (field: string, value: any) => void;
  isBusiness?: boolean;
}

export default function PreferencesTab({
  formData,
  onChange,
  isBusiness = false,
}: PreferencesTabProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Theme / Appearance Selection */}
      <section className="sl-editorial-card p-6 space-y-4">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <Sun size={18} className="text-[var(--shelf-forest)]" />
            Workspace Theme & Appearance
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Select your visual aesthetic. System matches your operating system preference automatically.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          {[
            { value: "light", label: "Light", Icon: Sun, desc: "Crisp ivory surfaces" },
            { value: "dark", label: "Dark", Icon: Moon, desc: "Deep atmospheric depth" },
            { value: "system", label: "System", Icon: Monitor, desc: "Synchronized with OS" },
          ].map(({ value, label, Icon, desc }) => {
            const isSelected = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all group ${
                  isSelected
                    ? "border-[var(--shelf-forest)] bg-[var(--shelf-cream)]/70 dark:bg-emerald-950/40 shadow-xs"
                    : "border-[var(--shelf-border)] bg-[var(--shelf-surface)] hover:border-[var(--shelf-border)]/80 hover:bg-[var(--shelf-cream)]/30"
                }`}
              >
                <div className={`p-2 rounded-xl mb-2 transition-colors ${
                  isSelected 
                    ? "bg-[var(--shelf-forest)] text-white" 
                    : "bg-[var(--shelf-border)]/50 text-[var(--shelf-muted)] group-hover:text-[var(--shelf-dark)]"
                }`}>
                  <Icon size={18} />
                </div>
                <span className={`text-xs font-semibold ${isSelected ? "text-[var(--shelf-forest)]" : "text-[var(--shelf-dark)]"}`}>
                  {label}
                </span>
                <span className="text-[10px] text-[var(--shelf-muted)] mt-0.5">
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Freshness & Expiry Calculation Rules */}
      <section className="sl-editorial-card p-6 space-y-5">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <Clock size={18} className="text-[var(--shelf-forest)]" />
            Freshness Safeguards & Shelf-Life Buffers
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Heuristics used to estimate freshness windows when products lack printed expiry dates.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Default Freshness Buffer Days */}
          <div className="space-y-1.5">
            <label htmlFor="settings-buffer" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Estimated Shelf-Life Buffer
            </label>
            <select
              id="settings-buffer"
              value={formData.shelfLifeBuffer}
              onChange={(e) => onChange("shelfLifeBuffer", e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              <option value="3">3 Days (Strict conservative guard)</option>
              <option value="5">5 Days (Recommended for fresh produce)</option>
              <option value="7">7 Days (Standard grocery cycle)</option>
              <option value="10">10 Days (Extended fresh foods)</option>
              <option value="14">14 Days (Conservative pantry items)</option>
            </select>
            <p className="text-[11px] text-[var(--shelf-muted)]">
              Applied automatically during receipt scanning when no manufacturer expiry date is legible.
            </p>
          </div>

          {/* Unit System Selector */}
          <div className="space-y-1.5">
            <label htmlFor="settings-units" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Default Measurement Unit System
            </label>
            <select
              id="settings-units"
              value={formData.unitSystem}
              onChange={(e) => onChange("unitSystem", e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              <option value="metric">Metric Standards (g, kg, ml, L)</option>
              <option value="imperial">Imperial Standards (oz, lb, fl oz)</option>
            </select>
            <p className="text-[11px] text-[var(--shelf-muted)]">
              Determines default units when manually registering new inventory items.
            </p>
          </div>
        </div>

        {/* Culinary Dual Display Toggle */}
        <div className="pt-2 border-t border-[var(--shelf-border)]">
          <label className="flex items-start justify-between gap-4 cursor-pointer group">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[var(--shelf-dark)] flex items-center gap-1.5">
                <UtensilsCrossed size={14} className="text-[var(--shelf-forest)]" />
                Culinary Volume Dual-Display Mode
              </span>
              <p className="text-[11px] text-[var(--shelf-muted)] max-w-md">
                Preserve {isBusiness ? "commercial kitchen" : "recipe"} measurements (tbsp, tsp, cup) while rendering normalized volume equivalents (<code className="font-mono text-[10px] px-1 py-0.5 rounded bg-[var(--shelf-cream)] dark:bg-white/5 border border-[var(--shelf-border)]">Use 2 tbsp · ≈30 ml</code>) for inventory auditing.
              </p>
            </div>
            <div className="relative inline-flex items-center shrink-0">
              <input
                type="checkbox"
                checked={formData.showCulinaryDualDisplay}
                onChange={(e) => onChange("showCulinaryDualDisplay", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--shelf-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--shelf-forest)]" />
            </div>
          </label>
        </div>
      </section>
    </div>
  );
}
