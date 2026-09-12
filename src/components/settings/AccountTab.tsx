"use client";

import { User as UserIcon, Building2, CheckCircle2, Lock, Shield } from "lucide-react";

interface AccountTabProps {
  user: {
    name?: string | null;
    email?: string | null;
    accountType: "consumer" | "business";
    businessId?: string | number | null;
  };
  business?: {
    name?: string | null;
    industry?: string | null;
  } | null;
  formData: {
    name: string;
    businessName: string;
    industry: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function AccountTab({
  user,
  business,
  formData,
  onChange,
}: AccountTabProps) {
  const isBusiness = user.accountType === "business";
  const initials = (formData.name || user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Profile Overview Banner */}
      <div className="sl-editorial-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--shelf-cream)]/70 dark:bg-emerald-950/40 border border-emerald-600/30 flex items-center justify-center text-xl font-serif font-bold text-[var(--shelf-forest)] shadow-xs shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-normal text-[var(--shelf-dark)]">
                {formData.name || user.name || "ShelfLife Member"}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[var(--shelf-cream)] dark:bg-emerald-950/40 border border-[var(--shelf-border)] text-[var(--shelf-forest)]">
                <Shield size={11} />
                {isBusiness ? "Business Pro" : "Consumer Free"}
              </span>
            </div>
            <p className="text-xs text-[var(--shelf-muted)] mt-1 flex items-center gap-1.5">
              <span>{user.email}</span>
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 size={12} /> Verified
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <section className="sl-editorial-card p-6 space-y-5">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <UserIcon size={18} className="text-[var(--shelf-forest)]" />
            Identity & Contact
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Your name and primary identity across culinary workflows and team activity.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label htmlFor="settings-name" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Full Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={formData.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. Elena Rostova"
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] placeholder-[var(--shelf-muted)]/50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
            <p className="text-[11px] text-[var(--shelf-muted)]">
              Visible on {isBusiness ? "inventory" : "recipe"} logs, intake reports, and notifications.
            </p>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label htmlFor="settings-email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Email Address
            </label>
            <div className="relative">
              <input
                id="settings-email"
                type="email"
                readOnly
                disabled
                value={user.email || ""}
                className="w-full h-11 px-3.5 pr-10 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 dark:bg-white/[0.02] text-sm text-[var(--shelf-muted)] cursor-not-allowed outline-none"
              />
              <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--shelf-muted)]" />
            </div>
            <p className="text-[11px] text-[var(--shelf-muted)]">
              Email is verified and tied to your authentication provider.
            </p>
          </div>

          {/* Account Workspace Type */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Workspace Profile Type
            </label>
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 dark:bg-white/[0.01]">
              <div className="p-2 rounded-lg bg-[var(--shelf-surface)] border border-[var(--shelf-border)] text-[var(--shelf-forest)]">
                {isBusiness ? <Building2 size={18} /> : <UserIcon size={18} />}
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs font-semibold text-[var(--shelf-dark)]">
                  {isBusiness ? "Commercial Business Operating Space" : "Personal Household Pantry Workspace"}
                </p>
                <p className="text-[11px] text-[var(--shelf-muted)] mt-0.5">
                  {isBusiness
                    ? "Configured with FIFO inventory enforcement, batch tracking, and commercial supplier imports."
                    : "Optimized for home pantry management, recipe generation, and household waste elimination."}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)] border border-[var(--shelf-forest)]/20">
                {user.accountType}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Business Organization Settings (Visible for Business Accounts) */}
      {isBusiness && (
        <section className="sl-editorial-card p-6 space-y-5">
          <div className="border-b border-[var(--shelf-border)] pb-3">
            <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
              <Building2 size={18} className="text-[var(--shelf-forest)]" />
              Organization & Commercial Details
            </h3>
            <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
              Operating enterprise metadata displayed on commercial reports and invoices.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="settings-business-name" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
                Commercial Business Name
              </label>
              <input
                id="settings-business-name"
                type="text"
                value={formData.businessName}
                onChange={(e) => onChange("businessName", e.target.value)}
                placeholder="e.g. Apex Hospitality Group"
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] placeholder-[var(--shelf-muted)]/50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="settings-industry" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
                Industry Sector
              </label>
              <select
                id="settings-industry"
                value={formData.industry}
                onChange={(e) => onChange("industry", e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                <option value="Restaurant & Culinary">Restaurant & Culinary Kitchen</option>
                <option value="Bakery & Patisserie">Bakery & Patisserie</option>
                <option value="Catering & Events">Catering & Event Operations</option>
                <option value="Grocery & Retail">Grocery & Specialty Food Retail</option>
                <option value="Hotel & Hospitality">Hotel & Hospitality Foodservice</option>
                <option value="Other">Other Food Industry</option>
              </select>
            </div>

            {user.businessId && (
              <div className="sm:col-span-2 pt-1">
                <p className="text-[11px] text-[var(--shelf-muted)]">
                  Workspace Tenant Reference: <code className="font-mono px-1.5 py-0.5 rounded bg-[var(--shelf-cream)] dark:bg-white/5 border border-[var(--shelf-border)] text-[var(--shelf-dark)]">SL-BIZ-{user.businessId}</code>
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
