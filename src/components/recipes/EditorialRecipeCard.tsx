"use client";

import { Recipe } from "@/lib/actions/recipes";
import { Clock, ChefHat, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import IngredientOwnershipBadge from "./IngredientOwnershipBadge";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface EditorialRecipeCardProps {
  recipe: Recipe;
  index?: number;
  inventory?: InventoryItem[];
  onCook?: (recipe: Recipe) => void;
  onOpenCookingMode?: (recipe: Recipe) => void;
}

export function EditorialRecipeCard({
  recipe,
  index = 0,
  onCook,
  onOpenCookingMode,
}: EditorialRecipeCardProps) {
  const totalIngredients = recipe.ingredients.length;
  const ownedIngredients = recipe.ingredients.filter((i) => i.status !== "pantry_item").length;
  const expiringIngredients = recipe.ingredients.filter((i) => i.status === "expiring_soon").length;
  const matchPercentage =
    totalIngredients > 0 ? Math.round((ownedIngredients / totalIngredients) * 100) : 100;

  // Curated color accents for recipe cards
  const accents = [
    "from-emerald-900/10 to-transparent border-[var(--shelf-forest)]/25",
    "from-amber-900/10 to-transparent border-[var(--shelf-amber)]/25",
    "from-sky-900/10 to-transparent border-[var(--shelf-blue)]/25",
    "from-stone-900/10 to-transparent border-[var(--shelf-border)]",
  ];
  const accentStyle = accents[index % accents.length];

  const handleTriggerCook = () => {
    if (onCook) {
      onCook(recipe);
    } else if (onOpenCookingMode) {
      onOpenCookingMode(recipe);
    }
  };

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* Top Banner Gradient & Quick Badges */}
      <div className={`h-2.5 w-full bg-gradient-to-r ${accentStyle}`} />

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--shelf-cream)]/40 px-2.5 py-1 text-xs font-mono font-bold text-[var(--shelf-dark)]">
                <Clock size={12} className="text-[var(--shelf-forest)]" />
                {recipe.estimatedPrepTime}m Prep
              </span>

              <span
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-mono font-bold ${
                  matchPercentage >= 80
                    ? "bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]"
                    : "bg-[var(--shelf-blue)]/10 text-[var(--shelf-blue)]"
                }`}
              >
                <CheckCircle2 size={12} />
                {matchPercentage}% Pantry Match
              </span>
            </div>

            {expiringIngredients > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--shelf-amber)]/15 px-2 py-0.5 text-[11px] font-bold text-[var(--shelf-amber)]">
                <Sparkles size={11} />
                Rescues {expiringIngredients} item{expiringIngredients > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Recipe Name & Flavor Notes */}
          <h3 className="mt-3 font-serif text-xl font-bold tracking-tight text-[var(--shelf-dark)] sm:text-2xl">
            {recipe.name}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--shelf-muted)] line-clamp-2">
            {recipe.description}
          </p>

          {/* Chef's Recommendation Quote */}
          {recipe.whyRecommended && (
            <div className="mt-3 rounded-lg border border-[var(--shelf-border)]/40 bg-[var(--shelf-cream)]/20 p-2.5 text-[11px] text-[var(--shelf-muted)] italic">
              &ldquo;{recipe.whyRecommended}&rdquo;
            </div>
          )}

          {/* Ingredients Matrix */}
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--shelf-muted)]">
              Ingredients Required ({ownedIngredients}/{totalIngredients} owned)
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recipe.ingredients.map((ing, idx) => (
                <IngredientOwnershipBadge key={`${ing.name}-${idx}`} ingredient={ing} compact />
              ))}
            </div>
          </div>
        </div>

        {/* Start Cooking Drawer Action */}
        <div className="mt-6 border-t border-[var(--shelf-border)]/50 pt-4 flex items-center justify-between">
          <span className="text-[11px] text-[var(--shelf-muted)] font-mono">
            {recipe.instructions.length} culinary steps
          </span>

          <button
            type="button"
            onClick={handleTriggerCook}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--shelf-dark)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[var(--shelf-forest)] active:scale-[0.98] cursor-pointer"
          >
            <ChefHat size={14} />
            <span>Cook Step-by-Step</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default EditorialRecipeCard;
