"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Lightbulb, ChefHat, CheckCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import { PreventionAdvisoryItem } from "@/lib/waste";

interface AIPreventionAdvisoryProps {
  advisories: PreventionAdvisoryItem[];
  isBusiness?: boolean;
}

export default function AIPreventionAdvisory({
  advisories,
  isBusiness = false,
}: AIPreventionAdvisoryProps) {
  const router = useRouter();

  return (
    <section aria-labelledby="prevention-advisory-heading" className="sl-editorial-card p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--shelf-forest)]">
            <Sparkles className="h-3.5 w-3.5" />
            Operational Intelligence
          </div>
          <h2 id="prevention-advisory-heading" className="mt-1 font-serif text-xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-2xl">
            AI Waste Prevention Advisory
          </h2>
          <p className="mt-1 text-xs text-[var(--shelf-muted)] sm:text-sm">
            {isBusiness
              ? "Targeted storage and purchasing adjustments calibrated to your commercial kitchen discard trends."
              : "Targeted storage and purchasing adjustments calibrated to your pantry's actual discard trends."}
          </p>
        </div>

        {isBusiness ? (
          <button
            onClick={() => router.push("/business/dashboard/strategy")}
            className="sl-focus-ring inline-flex items-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 cursor-pointer self-start sm:self-auto"
          >
            <TrendingUp className="h-4 w-4" />
            Inventory Strategy
            <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
          </button>
        ) : (
          <button
            onClick={() => router.push("/dashboard/recipes")}
            className="sl-focus-ring inline-flex items-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 cursor-pointer self-start sm:self-auto"
          >
            <ChefHat className="h-4 w-4" />
            Cook With Expiring Items
            <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {advisories.map((item) => {
          let badgeColor = "text-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10 border-[var(--shelf-forest)]/20";
          let Icon = Lightbulb;

          if (item.type === "rescue_win") {
            badgeColor = "text-[var(--shelf-amber)] bg-[var(--shelf-amber)]/10 border-[var(--shelf-amber)]/20";
            Icon = CheckCircle;
          } else if (item.type === "prep_action") {
            badgeColor = "text-[var(--shelf-terracotta)] bg-[var(--shelf-terracotta)]/10 border-[var(--shelf-terracotta)]/20";
            Icon = Sparkles;
          }

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 p-5 transition hover:border-[var(--shelf-forest)]/40 hover:bg-[var(--shelf-cream)]/35 shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                    <Icon className="h-3 w-3" />
                    {item.type.replace("_", " ")}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[var(--shelf-forest)]">
                    {item.impactEstimate}
                  </span>
                </div>

                <h3 className="mt-3 font-serif text-sm font-bold text-[var(--shelf-dark)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-[var(--shelf-muted)] leading-relaxed">
                  {item.advice}
                </p>
              </div>

              {item.category && (
                <div className="mt-4 border-t border-[var(--shelf-border)]/50 pt-2 text-[10px] font-medium text-[var(--shelf-muted)]">
                  Focus: <strong className="text-[var(--shelf-dark)]">{item.category}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
