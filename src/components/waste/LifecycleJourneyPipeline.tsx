"use client";

import { Package, Utensils, ShieldAlert, ArrowRight, ArrowDown } from "lucide-react";
import { LifecycleMilestone } from "@/lib/waste";

interface LifecycleJourneyPipelineProps {
  lifecycle: {
    acquired: LifecycleMilestone;
    consumed: LifecycleMilestone;
    rescued: LifecycleMilestone;
    discarded: LifecycleMilestone;
  };
}

export default function LifecycleJourneyPipeline({
  lifecycle,
}: LifecycleJourneyPipelineProps) {
  const steps = [
    {
      ...lifecycle.acquired,
      icon: Package,
      badge: "Stock Inflow",
      colorClass: "border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-dark)]",
      iconBg: "bg-[var(--shelf-cream)] text-[var(--shelf-dark)]",
    },
    {
      ...lifecycle.consumed,
      icon: Utensils,
      badge: `${lifecycle.consumed.conversionRate}% Rate`,
      colorClass: "border-[var(--shelf-forest)]/30 bg-[var(--shelf-forest)]/5 text-[var(--shelf-forest)]",
      iconBg: "bg-[var(--shelf-forest)]/15 text-[var(--shelf-forest)]",
    },
    {
      ...lifecycle.rescued,
      icon: ShieldAlert,
      badge: `${lifecycle.rescued.conversionRate}% of Used`,
      colorClass: "border-[var(--shelf-amber)]/30 bg-[var(--shelf-amber)]/5 text-[var(--shelf-amber)]",
      iconBg: "bg-[var(--shelf-amber)]/15 text-[var(--shelf-amber)]",
    },
    {
      ...lifecycle.discarded,
      icon: ShieldAlert,
      badge: `${lifecycle.discarded.conversionRate}% Loss`,
      colorClass: "border-[var(--shelf-terracotta)]/30 bg-[var(--shelf-terracotta)]/5 text-[var(--shelf-terracotta)]",
      iconBg: "bg-[var(--shelf-terracotta)]/15 text-[var(--shelf-terracotta)]",
    },
  ];

  return (
    <section aria-labelledby="lifecycle-pipeline-heading" className="sl-editorial-card p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="lifecycle-pipeline-heading" className="font-serif text-xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-2xl">
            Food Lifecycle Journey
          </h2>
          <p className="mt-1 text-xs text-[var(--shelf-muted)] sm:text-sm">
            Deterministic flow tracking how acquired pantry inventory moves from purchase to table or loss.
          </p>
        </div>
        <span className="self-start rounded-md border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/50 px-2.5 py-1 text-[11px] font-mono text-[var(--shelf-muted)]">
          Audit Verified
        </span>
      </div>

      {/* Screen reader textual transcript */}
      <div className="sr-only">
        Food lifecycle flow: {lifecycle.acquired.count} items acquired; {lifecycle.consumed.count} items safely consumed ({lifecycle.consumed.conversionRate}% of acquired); {lifecycle.rescued.count} items rescued within 48h of expiry; and {lifecycle.discarded.count} items discarded.
      </div>

      {/* Pipeline Grid (Horizontal on desktop, vertical step list on mobile) */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="relative flex flex-col">
              <div className={`flex flex-col justify-between rounded-xl border p-5 transition hover:shadow-2xs ${step.colorClass} h-full`}>
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${step.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {step.badge}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="font-mono text-2xl font-extrabold tracking-tight">
                    {step.count}
                    <span className="ml-1.5 text-xs font-sans font-medium opacity-70">
                      items
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-[var(--shelf-dark)]">
                    {step.label}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--shelf-muted)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Desktop connector arrow */}
              {!isLast && (
                <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-[var(--shelf-muted)]/50 bg-[var(--shelf-surface)] rounded-full p-0.5 border border-[var(--shelf-border)]" aria-hidden="true">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}

              {/* Mobile vertical connector arrow */}
              {!isLast && (
                <div className="flex lg:hidden justify-center my-1 text-[var(--shelf-muted)]/60" aria-hidden="true">
                  <ArrowDown className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
