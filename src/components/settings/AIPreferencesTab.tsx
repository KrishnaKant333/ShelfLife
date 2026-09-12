"use client";

import { Sparkles, ChefHat, FileText, GitMerge, Cpu } from "lucide-react";

interface AIPreferencesTabProps {
  formData: {
    recipeAiMode: string;
    invoiceAutoCategorize: boolean;
    duplicateAutoMerge: boolean;
  };
  onChange: (field: string, value: any) => void;
  isBusiness?: boolean;
}

export default function AIPreferencesTab({
  formData,
  onChange,
  isBusiness = false,
}: AIPreferencesTabProps) {
  return (
    <div className="space-y-6">
      {/* Recipe AI Generation Strategy (Consumer Only) */}
      {!isBusiness && (
        <section className="sl-editorial-card p-6 space-y-5">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <ChefHat size={18} className="text-[var(--shelf-forest)]" />
            Culinary AI Recipe Engine Strategy
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Controls how our Groq AI balances strictly expiring pantry ingredients against culinary creativity.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              id: "strict_fifo",
              title: "Strict Pantry FIFO (Zero-Waste)",
              desc: "Strictly prioritizes using items closest to expiration. Excludes all fresh items if expiring substitutes exist.",
              badge: "Highest Preservation",
            },
            {
              id: "balanced",
              title: "Balanced Culinary Creativity",
              desc: "Combines expiring items with pantry staples and culinary harmony for richer recipe compositions.",
              badge: "Culinary Standard",
            },
          ].map((mode) => {
            const isSelected = formData.recipeAiMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChange("recipeAiMode", mode.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-[var(--shelf-forest)] bg-[var(--shelf-cream)]/70 dark:bg-emerald-950/40 shadow-xs"
                    : "border-[var(--shelf-border)] bg-[var(--shelf-surface)] hover:border-[var(--shelf-border)]/80 hover:bg-[var(--shelf-cream)]/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-semibold ${isSelected ? "text-[var(--shelf-forest)]" : "text-[var(--shelf-dark)]"}`}>
                    {mode.title}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-[var(--shelf-forest)]">
                    {mode.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--shelf-muted)] leading-relaxed">
                  {mode.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>
      )}

      {/* Invoice & Document Intelligence */}
      <section className="sl-editorial-card p-6 space-y-5">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <FileText size={18} className="text-[var(--shelf-forest)]" />
            Ingestion & Invoice Automation
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Configure how machine intelligence parses receipts, invoices, and product packaging.
          </p>
        </div>

        <div className="divide-y divide-[var(--shelf-border)]">
          {/* Invoice Auto Categorize */}
          <div className="py-3.5 first:pt-0 last:pb-0">
            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--shelf-dark)] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[var(--shelf-forest)]" />
                  Semantic Product Categorization
                </span>
                <p className="text-[11px] text-[var(--shelf-muted)] max-w-md">
                  Automatically maps ambiguous vendor abbreviations (e.g. "ORG KALE BNC") into structured categories (Produce, Dairy, Pantry).
                </p>
              </div>
              <div className="relative inline-flex items-center shrink-0">
                <input
                  type="checkbox"
                  checked={formData.invoiceAutoCategorize}
                  onChange={(e) => onChange("invoiceAutoCategorize", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--shelf-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--shelf-forest)]" />
              </div>
            </label>
          </div>

          {/* Duplicate Ingestion Auto-Merge */}
          <div className="py-3.5 first:pt-0 last:pb-0">
            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[var(--shelf-dark)] flex items-center gap-1.5">
                  <GitMerge size={14} className="text-[var(--shelf-forest)]" />
                  Intelligent Inventory Duplicate Merging
                </span>
                <p className="text-[11px] text-[var(--shelf-muted)] max-w-md">
                  When newly scanned or imported goods match existing pantry records, automatically increments existing quantity rather than creating duplicate product entries.
                </p>
              </div>
              <div className="relative inline-flex items-center shrink-0">
                <input
                  type="checkbox"
                  checked={formData.duplicateAutoMerge}
                  onChange={(e) => onChange("duplicateAutoMerge", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--shelf-border)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--shelf-forest)]" />
              </div>
            </label>
          </div>
        </div>

        {/* Model Spec Card */}
        <div className="p-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 dark:bg-white/[0.02] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Cpu size={16} className="text-[var(--shelf-forest)]" />
            <div>
              <p className="text-xs font-medium text-[var(--shelf-dark)]">
                Active Inference Engine: Groq Vision Llama 3.3
              </p>
              <p className="text-[11px] text-[var(--shelf-muted)]">
                Ultra-low latency inference with deterministic JSON schema enforcement.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-[var(--shelf-forest)] font-semibold uppercase">
            Online · 0.8s
          </span>
        </div>
      </section>
    </div>
  );
}
