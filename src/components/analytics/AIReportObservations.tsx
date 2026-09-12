"use client";

import { Sparkles, ArrowRight, ShieldAlert, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface AIReportObservationsProps {
  observations: Array<{
    title: string;
    description: string;
    type: "positive" | "warning" | "neutral" | "urgent";
  }>;
  isBusiness?: boolean;
}

export default function AIReportObservations({
  observations,
  isBusiness = false,
}: AIReportObservationsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <ShieldAlert size={16} className="text-[var(--shelf-terracotta)] shrink-0" />;
      case "warning":
        return <AlertTriangle size={16} className="text-[var(--shelf-amber)] shrink-0" />;
      case "positive":
        return <CheckCircle size={16} className="text-[var(--shelf-forest)] shrink-0" />;
      default:
        return <Sparkles size={16} className="text-[var(--shelf-blue)] shrink-0" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-l-[var(--shelf-terracotta)]";
      case "warning":
        return "border-l-[var(--shelf-amber)]";
      case "positive":
        return "border-l-[var(--shelf-forest)]";
      default:
        return "border-l-[var(--shelf-blue)]";
    }
  };

  return (
    <section
      aria-labelledby="ai-observations-title"
      className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-forest)]">
            <Sparkles size={14} />
            Diagnostic Intelligence
          </div>
          <h2
            id="ai-observations-title"
            className="mt-1 font-serif text-lg font-semibold text-[var(--shelf-dark)] sm:text-xl"
          >
            What Is Driving This? (Executive Observations)
          </h2>
          <p className="mt-1 text-xs text-[var(--shelf-muted)]">
            Synthesized operational patterns and actionable recommendations derived directly from current inventory records.
          </p>
        </div>

        <Link
          href={isBusiness ? "/business/dashboard/inventory" : "/dashboard/inventory"}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--shelf-forest)] hover:underline self-start sm:self-auto"
        >
          View Inventory
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {observations.map((obs, idx) => (
          <div
            key={idx}
            className={`rounded-xl border border-[var(--shelf-border)]/60 border-l-4 bg-[var(--shelf-cream)]/10 p-4 transition-all hover:bg-[var(--shelf-cream)]/20 ${getBorderColor(
              obs.type
            )}`}
          >
            <div className="flex items-center gap-2">
              {getIcon(obs.type)}
              <h3 className="text-sm font-bold text-[var(--shelf-dark)]">{obs.title}</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--shelf-muted)]">
              {obs.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
