"use client";

import { RecipeMode } from "@/lib/actions/recipes";
import { Clock, Leaf, PackageCheck, Sparkles } from "lucide-react";

interface RecipeModeSelectorProps {
  currentMode?: RecipeMode;
  selectedMode?: RecipeMode;
  onSelectMode: (mode: RecipeMode) => void;
  disabled?: boolean;
}

const MODES: Array<{
  id: RecipeMode;
  label: string;
  tagline: string;
  icon: React.ElementType;
}> = [
  {
    id: "use_soon",
    label: "Use Soon",
    tagline: "Prioritizes products closest to expiry",
    icon: Leaf,
  },
  {
    id: "quick_meal",
    label: "Quick Meal",
    tagline: "Swift recipes under 25 minutes",
    icon: Clock,
  },
  {
    id: "use_what_i_have",
    label: "Pantry Challenge",
    tagline: "Maximizes usage of current stock",
    icon: PackageCheck,
  },
  {
    id: "culinary_exploration",
    label: "Chef's Craft",
    tagline: "Creative artisanal pairings",
    icon: Sparkles,
  },
];

export function RecipeModeSelector({
  currentMode,
  selectedMode,
  onSelectMode,
  disabled = false,
}: RecipeModeSelectorProps) {
  const activeMode = selectedMode ?? currentMode ?? "use_soon";

  return (
    <section aria-label="Recipe Mode Selection" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectMode(mode.id)}
            aria-pressed={isActive}
            className={`group flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
              isActive
                ? "border-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10 shadow-xs"
                : "border-[var(--shelf-border)] bg-[var(--shelf-surface)] hover:border-[var(--shelf-border)] hover:bg-[var(--shelf-cream)]/20"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-[var(--shelf-forest)] text-white"
                    : "bg-[var(--shelf-cream)] text-[var(--shelf-muted)] group-hover:text-[var(--shelf-dark)]"
                }`}
              >
                <Icon size={14} />
              </span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--shelf-forest)]" />
              )}
            </div>

            <div className="mt-3">
              <p
                className={`text-xs font-bold ${
                  isActive ? "text-[var(--shelf-forest)]" : "text-[var(--shelf-dark)]"
                }`}
              >
                {mode.label}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-[var(--shelf-muted)] line-clamp-1">
                {mode.tagline}
              </p>
            </div>
          </button>
        );
      })}
    </section>
  );
}

export default RecipeModeSelector;
