"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Check, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight 
} from "lucide-react";
import { 
  getPlansByAccountType, 
  getPlan, 
  type Plan,
  type PlanId 
} from "@/lib/plans";

interface BillingTabProps {
  user: {
    accountType: "consumer" | "business";
    plan?: PlanId;
  };
}

export default function BillingTab({ user }: BillingTabProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const isBusiness = user.accountType === "business";
  const currentPlanId: PlanId = user.plan || (isBusiness ? "business_starter" : "consumer_free");
  const currentPlan = getPlan(currentPlanId) || getPlan(isBusiness ? "business_starter" : "consumer_free");
  const availablePlans: Plan[] = getPlansByAccountType(user.accountType);

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <section className="sl-editorial-card p-6 space-y-5">
        <div className="border-b border-[var(--shelf-border)] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
              <CreditCard size={18} className="text-[var(--shelf-forest)]" />
              Active Subscription & Plan Quotas
            </h3>
            <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
              Your active license tier, consumption allowances, and AI token limits.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-[var(--shelf-forest)] border border-emerald-500/20 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active · {currentPlan.name}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 dark:bg-white/[0.02]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Subscription Tier
            </span>
            <p className="text-lg font-serif font-semibold text-[var(--shelf-dark)] mt-1">
              {currentPlan.name}
            </p>
            <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
              {currentPlan.price === 0 ? "Complimentary Community Plan" : `₹${currentPlan.price}/month billed ${billingCycle}`}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 dark:bg-white/[0.02]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Active Feature Scope
            </span>
            <p className="text-lg font-serif font-semibold text-[var(--shelf-dark)] mt-1">
              {currentPlan.features.length} Features
            </p>
            <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
              Enabled culinary and stock capabilities
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 dark:bg-white/[0.02]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Workspace Profile
            </span>
            <p className="text-lg font-serif font-semibold text-[var(--shelf-dark)] mt-1">
              {isBusiness ? "Commercial Org" : "Household Pantry"}
            </p>
            <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
              {isBusiness ? "Multi-batch FIFO tracking" : "Smart recipes & expiry tracking"}
            </p>
          </div>
        </div>
      </section>

      {/* Plan Matrix & Billing Cycle Switcher */}
      <section className="sl-editorial-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--shelf-border)] pb-4">
          <div>
            <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
              <Zap size={18} className="text-[var(--shelf-forest)]" />
              Available License Tiers
            </h3>
            <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
              Upgrade your workspace to unlock advanced culinary algorithms and enterprise team features.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[var(--shelf-cream)] dark:bg-white/5 border border-[var(--shelf-border)]">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                billingCycle === "monthly"
                  ? "bg-[var(--shelf-surface)] text-[var(--shelf-dark)] font-semibold shadow-xs"
                  : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
                billingCycle === "yearly"
                  ? "bg-[var(--shelf-surface)] text-[var(--shelf-dark)] font-semibold shadow-xs"
                  : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-[var(--shelf-forest)]">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Tier Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availablePlans.map((plan: Plan) => {
            const isCurrent = plan.id === currentPlanId;
            const price = billingCycle === "yearly" ? Math.round(plan.price * 0.8) : plan.price;

            return (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "border-[var(--shelf-forest)] bg-[var(--shelf-cream)]/50 dark:bg-emerald-950/30 shadow-xs"
                    : "border-[var(--shelf-border)] bg-[var(--shelf-surface)] hover:border-[var(--shelf-border)]/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[var(--shelf-dark)]">
                      {plan.name}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--shelf-forest)] text-white uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--shelf-muted)] mt-1 min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="mt-4 mb-4">
                    <span className="text-2xl font-serif font-bold text-[var(--shelf-dark)]">
                      ₹{price}
                    </span>
                    <span className="text-xs text-[var(--shelf-muted)] ml-1">
                      / month
                    </span>
                  </div>

                  <ul className="space-y-2 border-t border-[var(--shelf-border)] pt-3 text-xs text-[var(--shelf-muted)]">
                    {plan.features.slice(0, 5).map((feat: string) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span className="capitalize">{feat.replace(/_/g, " ")}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-auto">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--shelf-cream)] dark:bg-white/5 border border-[var(--shelf-border)] text-[var(--shelf-muted)] cursor-default text-center"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <Link
                      href="/#pricing"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--shelf-forest)] text-white hover:opacity-90 active:scale-95 transition shadow-xs"
                    >
                      <span>Upgrade Plan</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
