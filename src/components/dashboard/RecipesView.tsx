"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Clock,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Loader2,
  X,
  Check,
  ChevronRight,
  RefreshCw,
  Info,
} from "lucide-react";
import { generateRecipesAction, consumeIngredientsAction, type Recipe, type RecipeIngredient, type RecipeMode } from "@/lib/actions/recipes";
import { ToastProvider, useToast } from "@/components/ui/Toast";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

interface RecipesViewProps {
  initialInventory: InventoryItem[];
}

const RECIPE_MODES: { value: RecipeMode; label: string; description: string }[] = [
  {
    value: "use_soon",
    label: "Use Soon",
    description: "Prioritize ingredients that should be used soon.",
  },
  {
    value: "quick_meal",
    label: "Quick Meal",
    description: "Find something quick to prepare.",
  },
  {
    value: "use_what_i_have",
    label: "Use What I Have",
    description: "Make a recipe mostly from your current inventory.",
  },
];

function RecipesViewInner({ initialInventory }: RecipesViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [consuming, setConsuming] = useState(false);
  const [consumeQuantities, setConsumeQuantities] = useState<Record<number, number>>({});
  const [consumeSelected, setConsumeSelected] = useState<Record<number, boolean>>({});
  const [recipeMode, setRecipeMode] = useState<RecipeMode>("use_soon");
  const [excludedExpiredCount, setExcludedExpiredCount] = useState(0);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateRecipesAction(recipeMode);
      if (res.success && res.recipes) {
        setRecipes(res.recipes);
        setExcludedExpiredCount(res.excludedCount || 0);
      } else {
        setError(res.error || "Failed to generate recipes.");
        setExcludedExpiredCount(res.excludedCount || 0);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    
    // Initialize consumption states
    const quantities: Record<number, number> = {};
    const selected: Record<number, boolean> = {};
    
    recipe.ingredients.forEach((ing) => {
      if (ing.itemId) {
        // Attempt to parse quantity from text or default to 1
        const matchedItem = initialInventory.find((x) => x.id === ing.itemId);
        const maxQty = matchedItem ? matchedItem.quantity : 1;
        quantities[ing.itemId] = 1; // default to consume 1 unit
        selected[ing.itemId] = true; // default checked
      }
    });

    setConsumeQuantities(quantities);
    setConsumeSelected(selected);
  };

  const handleCloseRecipe = () => {
    setSelectedRecipe(null);
  };

  const handleMarkConsumed = async () => {
    if (!selectedRecipe) return;

    const itemsToConsume = Object.keys(consumeSelected)
      .map(Number)
      .filter((id) => consumeSelected[id] && consumeQuantities[id] > 0)
      .map((id) => ({
        itemId: id,
        quantityUsed: consumeQuantities[id],
      }));

    if (itemsToConsume.length === 0) {
      showToast("No ingredients selected for consumption.", "error");
      return;
    }

    setConsuming(true);
    try {
      const res = await consumeIngredientsAction(itemsToConsume);
      if (res.success) {
        showToast("Selected ingredients have been marked as consumed!", "success");
        handleCloseRecipe();
        router.refresh();
        // Update local list if we have it
        handleGenerate(); // re-generate to update recipe lists based on new stock levels
      } else {
        showToast(res.error || "Failed to mark ingredients as consumed.", "error");
      }
    } catch (err: any) {
      showToast("Failed to update inventory.", "error");
    } finally {
      setConsuming(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-[var(--shelf-forest)]">
          AI Meal Planner
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--shelf-dark)] md:text-4xl">
          Cook With What You Have
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Generate custom recipes using the ingredients closest to expiry in your fridge or pantry.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--shelf-terracotta)]/20 bg-[var(--shelf-terracotta)]/10 p-4 text-sm text-[var(--shelf-terracotta)] flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--shelf-terracotta)] mt-0.5" />
          <div>
            <h4 className="font-semibold text-[var(--shelf-terracotta)]">Recipe Generation Failed</h4>
            <p className="mt-1 text-[var(--shelf-terracotta)]">{error}</p>
            {excludedExpiredCount > 0 && (
              <p className="mt-2 text-xs text-[var(--shelf-terracotta)]">
                <Info className="inline h-3.5 w-3.5 mr-1" />
                {excludedExpiredCount} expired item{excludedExpiredCount !== 1 ? "s were" : " was"} excluded from recipe suggestions for your safety.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main View */}
      {recipes.length === 0 && !loading ? (
        /* Empty / Prompt State */
        <div className="space-y-6">
          {/* Recipe Mode Selector */}
          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-[var(--shelf-dark)] uppercase tracking-wider">
                How should ShelfLife help?
              </h3>
              <p className="mt-1 text-xs text-[var(--shelf-muted)]">
                Choose a recipe mode to personalize your meal suggestions.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {RECIPE_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setRecipeMode(mode.value)}
                  className={`text-left rounded-xl border-2 p-4 transition ${
                    recipeMode === mode.value
                      ? "border-[var(--shelf-forest)] bg-[var(--shelf-cream)]/60 shadow-sm"
                      : "border-[var(--shelf-border)] bg-[var(--shelf-surface)] hover:border-[var(--shelf-border)]"
                  }`}
                >
                  <h4 className="font-bold text-[var(--shelf-dark)]">{mode.label}</h4>
                  <p className="mt-1 text-xs text-[var(--shelf-muted)]">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button & Info */}
          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
              <Utensils size={32} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-[var(--shelf-dark)]">Ready to cook?</h3>
            <p className="mt-2 text-sm text-[var(--shelf-muted)] max-w-md mx-auto">
              ShelfLife will analyze your safe inventory and create customized recipes. Expired items are automatically excluded.
            </p>

            <div className="mt-8 flex justify-center">
              {initialInventory.length === 0 ? (
                <div className="text-sm text-[var(--shelf-muted)]">
                  Please add items to your <span className="font-bold">Inventory</span> first to unlock AI recipe generation.
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
                >
                  Generate Custom Recipes
                </button>
              )}
            </div>
          </div>
        </div>
      ) : loading ? (
        /* Loading state */
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--shelf-forest)]" />
          <h3 className="text-lg font-bold text-[var(--shelf-dark)]">Finding recipes...</h3>
          <p className="text-sm text-[var(--shelf-muted)] max-w-xs">
            Analyzing your safe ingredients and generating delicious meal ideas.
          </p>
        </div>
      ) : (
        /* Recipes Grid list */
        <div className="space-y-6">
          {excludedExpiredCount > 0 && (
            <div className="rounded-xl border border-[var(--shelf-blue)]/20 bg-[var(--shelf-blue)]/10 p-4 text-sm text-[var(--shelf-blue)] flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 text-[var(--shelf-blue)] mt-0.5" />
              <div>
                <h4 className="font-semibold text-[var(--shelf-blue)]">Expired Items Excluded</h4>
                <p className="mt-1 text-[var(--shelf-blue)]">
                  {excludedExpiredCount} expired item{excludedExpiredCount !== 1 ? "s were" : " was"} excluded from recipe suggestions. ShelfLife protects you by never recommending expired food.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--shelf-muted)]">
              We found {recipes.length} custom recipe{recipes.length !== 1 ? "s" : ""}:
            </p>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--shelf-forest)] hover:underline"
            >
              <RefreshCw size={14} />
              Re-generate
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {recipes.map((recipe) => (
              <div
                key={recipe.name}
                className="flex flex-col justify-between rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm hover:border-[var(--shelf-sage)] transition duration-250"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-[var(--shelf-dark)] leading-snug">
                      {recipe.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-[var(--shelf-cream)] px-2.5 py-1 text-xs font-semibold text-[var(--shelf-forest)]">
                      <Clock size={12} />
                      {recipe.estimatedPrepTime} min
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[var(--shelf-muted)] line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="mt-4 rounded-xl bg-[var(--shelf-cream)]/40 border border-[var(--shelf-border)]/55 p-3 text-xs text-[var(--shelf-dark)]">
                    <span className="font-bold text-[var(--shelf-forest)]">Why recommended:</span>{" "}
                    {recipe.whyRecommended}
                  </div>

                  {/* Ingredient checklist preview */}
                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--shelf-muted)]">
                      Key Ingredients:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.slice(0, 5).map((ing, i) => {
                        let statusIcon = <Check className="h-3 w-3 text-[var(--shelf-forest)]" />;
                        let style = "bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)] border-[var(--shelf-forest)]/20";

                        if (ing.status === "expiring_soon") {
                          statusIcon = <AlertTriangle className="h-3 w-3 text-[var(--shelf-amber)]" />;
                          style = "bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)] border-[var(--shelf-amber)]/20";
                        } else if (ing.status === "pantry_item") {
                          statusIcon = <HelpCircle className="h-3 w-3 text-[var(--shelf-muted)]" />;
                          style = "bg-[var(--shelf-cream)] text-[var(--shelf-muted)] border-[var(--shelf-border)]";
                        }

                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}
                          >
                            {statusIcon}
                            {ing.name}
                          </span>
                        );
                      })}
                      {recipe.ingredients.length > 5 && (
                        <span className="text-xs text-[var(--shelf-muted)] py-0.5">
                          +{recipe.ingredients.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--shelf-border)]/50 flex justify-end">
                  <button
                    onClick={() => handleOpenRecipe(recipe)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-[var(--shelf-forest)] hover:underline"
                  >
                    View Recipe <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative flex flex-col w-full max-w-2xl max-h-[85vh] bg-[var(--shelf-surface)] rounded-2xl shadow-xl overflow-hidden border border-[var(--shelf-border)]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 pr-12">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--shelf-forest)]">
                <Clock size={14} />
                <span>{selectedRecipe.estimatedPrepTime} min preparation</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-[var(--shelf-dark)]">
                {selectedRecipe.name}
              </h2>
              <p className="mt-2 text-sm text-[var(--shelf-muted)]">
                {selectedRecipe.description}
              </p>
              
              <button
                onClick={handleCloseRecipe}
                className="absolute top-6 right-6 text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] rounded-lg p-1.5 hover:bg-[var(--shelf-cream)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Recommendation advisory */}
              <div className="rounded-xl bg-[var(--shelf-forest)]/10 border border-[var(--shelf-forest)]/20 p-4">
                <h4 className="text-sm font-semibold text-[var(--shelf-forest)] flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-[var(--shelf-forest)]" />
                  ShelfLife Recommendation
                </h4>
                <p className="mt-1 text-sm text-[var(--shelf-forest)]">
                  {selectedRecipe.whyRecommended}
                </p>
              </div>

              {/* Ingredients Checklist */}
              <div>
                <h3 className="text-base font-bold text-[var(--shelf-dark)] mb-3">
                  Ingredients Needed
                </h3>
                <div className="border border-[var(--shelf-border)] rounded-xl divide-y divide-[var(--shelf-border)]">
                  {selectedRecipe.ingredients.map((ing, i) => {
                    const matchedItem = ing.itemId ? initialInventory.find((x) => x.id === ing.itemId) : null;
                    const stockText = matchedItem
                      ? `(${matchedItem.quantity} ${matchedItem.unit} in stock)`
                      : "";

                    let badgeColor = "bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)] border-[var(--shelf-forest)]/20";
                    let badgeLabel = "Available";

                    if (ing.status === "expiring_soon") {
                      badgeColor = "bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)] border-[var(--shelf-amber)]/20";
                      badgeLabel = "Expiring soon";
                    } else if (ing.status === "pantry_item") {
                      badgeColor = "bg-[var(--shelf-cream)] text-[var(--shelf-muted)] border-[var(--shelf-border)]";
                      badgeLabel = "Pantry Item";
                    }

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 text-sm hover:bg-[var(--shelf-cream)]/20"
                      >
                        <div className="flex items-center gap-3">
                          {ing.itemId ? (
                            <input
                              type="checkbox"
                              checked={!!consumeSelected[ing.itemId]}
                              onChange={(e) => {
                                setConsumeSelected({
                                  ...consumeSelected,
                                  [ing.itemId!]: e.target.checked,
                                });
                              }}
                              className="h-4.5 w-4.5 rounded-sm border-[var(--shelf-border)] text-[var(--shelf-forest)] focus:ring-[var(--shelf-forest)]"
                            />
                          ) : (
                            <div className="h-4.5 w-4.5 rounded-full bg-[var(--shelf-cream)] border border-[var(--shelf-border)] flex items-center justify-center">
                              <span className="text-[10px] font-bold text-[var(--shelf-muted)]">○</span>
                            </div>
                          )}

                          <div>
                            <span className="font-semibold text-[var(--shelf-dark)]">
                              {ing.name}
                            </span>
                            {ing.quantityUsed && (
                              <span className="text-[var(--shelf-muted)] ml-1.5">
                                — {ing.quantityUsed}
                              </span>
                            )}
                            {stockText && (
                              <span className="text-xs text-[var(--shelf-muted)] block mt-0.5">
                                {stockText}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeColor}`}
                          >
                            {badgeLabel}
                          </span>

                          {/* Editable consumption quantity if it's an inventory item */}
                          {ing.itemId && consumeSelected[ing.itemId] && matchedItem && (
                            <div className="flex items-center gap-1.5">
                              <label className="text-[10px] text-[var(--shelf-muted)] font-medium">Use:</label>
                              <input
                                type="number"
                                min={1}
                                max={matchedItem.quantity}
                                value={consumeQuantities[ing.itemId] || 1}
                                onChange={(e) => {
                                  const val = Math.min(
                                    matchedItem.quantity,
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  );
                                  setConsumeQuantities({
                                    ...consumeQuantities,
                                    [ing.itemId!]: val,
                                  });
                                }}
                                className="w-12 rounded-lg border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 py-1 text-center text-xs font-bold focus:outline-none focus:border-[var(--shelf-forest)]"
                              />
                              <span className="text-xs text-[var(--shelf-muted)]">{matchedItem.unit}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions steps */}
              <div>
                <h3 className="text-base font-bold text-[var(--shelf-dark)] mb-3">
                  Instructions
                </h3>
                <ol className="space-y-3.5 list-decimal pl-5">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="text-sm text-[var(--shelf-dark)] leading-relaxed pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 flex justify-between gap-3">
              <button
                onClick={handleCloseRecipe}
                className="rounded-xl border border-[var(--shelf-border)] px-5 py-2.5 text-sm font-semibold text-[var(--shelf-dark)] bg-[var(--shelf-surface)] hover:bg-[var(--shelf-cream)] transition"
              >
                Close
              </button>

              <button
                onClick={handleMarkConsumed}
                disabled={consuming}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition shadow-xs"
              >
                {consuming && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                Mark ingredients as used
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function RecipesView(props: RecipesViewProps) {
  return (
    <ToastProvider>
      <RecipesViewInner {...props} />
    </ToastProvider>
  );
}
