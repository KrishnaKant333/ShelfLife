"use client";

import { Sparkles, UtensilsCrossed, AlertTriangle, ChefHat, RefreshCw } from "lucide-react";

interface RecipeEditorialMastheadProps {
  totalSafeCount?: number;
  candidateCount?: number;
  expiringCount?: number;
  expiringSoonCount?: number;
  onGenerate?: () => void;
  onQuickGenerate?: () => void;
  loading?: boolean;
  isGenerating?: boolean;
  hasRecipes?: boolean;
}

export function RecipeEditorialMasthead({
  totalSafeCount,
  candidateCount,
  expiringCount,
  expiringSoonCount,
  onGenerate,
  onQuickGenerate,
  loading,
  isGenerating,
  hasRecipes,
}: RecipeEditorialMastheadProps) {
  const safeCount = totalSafeCount ?? candidateCount ?? 0;
  const expiring = expiringCount ?? expiringSoonCount ?? 0;
  const isLoading = loading ?? isGenerating ?? false;
  const handleTrigger = () => {
    if (onQuickGenerate) onQuickGenerate();
    else if (onGenerate) onGenerate();
  };

  return (
    <header className="border-b border-[var(--shelf-border)]/60 pb-6 pt-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--shelf-forest)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--shelf-forest)]">
              <ChefHat size={12} />
              Culinary Food Editorial
            </span>
            <span className="text-xs text-[var(--shelf-muted)]">
              Vol. 2 • Pantry Intelligence
            </span>
          </div>

          <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-4xl">
            The ShelfLife Kitchen
          </h1>
          <p className="mt-1 text-sm text-[var(--shelf-muted)]">
            Cook with what you have. Zero waste, maximum flavor, grounded in active inventory.
          </p>
        </div>

        {/* Live Status Pill & Editorial Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 px-3.5 py-2 text-xs">
            <UtensilsCrossed size={14} className="text-[var(--shelf-forest)]" />
            <span className="font-bold text-[var(--shelf-dark)]">
              {safeCount} fresh ingredient{safeCount !== 1 ? "s" : ""}
            </span>
            {expiring > 0 && (
              <>
                <span className="text-[var(--shelf-muted)]">•</span>
                <span className="inline-flex items-center gap-1 text-[var(--shelf-amber)] font-medium">
                  <AlertTriangle size={12} />
                  {expiring} urgent
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleTrigger}
            disabled={isLoading || safeCount === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Crafting Menu...
              </>
            ) : (
              <>
                <Sparkles size={13} />
                {hasRecipes ? "Refresh Recommendations" : "Compose Editorial Menu"}
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default RecipeEditorialMasthead;
