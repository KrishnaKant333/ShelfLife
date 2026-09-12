"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Utensils,
  AlertTriangle,
  RefreshCw,
  Info,
  ChefHat,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  generateRecipesAction,
  consumeIngredientsAction,
  type Recipe,
  type RecipeMode,
} from "@/lib/actions/recipes";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { RecipeEditorialMasthead } from "@/components/recipes/RecipeEditorialMasthead";
import { RecipeModeSelector } from "@/components/recipes/RecipeModeSelector";
import { EditorialRecipeCard } from "@/components/recipes/EditorialRecipeCard";
import { KitchenCookingDrawer } from "@/components/recipes/KitchenCookingDrawer";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface RecipesViewProps {
  initialInventory: InventoryItem[];
}

const CULINARY_LOADING_TIPS = [
  "Pairing near-expiry herbs with hearty pantry grains...",
  "Auditing pantry staples for balanced nutrition...",
  "Calculating minimal-waste prep techniques...",
  "Filtering out expired ingredients for kitchen safety...",
  "Drafting step-by-step culinary instructions...",
];

function RecipesViewInner({ initialInventory }: RecipesViewProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [consuming, setConsuming] = useState(false);
  const [recipeMode, setRecipeMode] = useState<RecipeMode>("use_soon");
  const [excludedExpiredCount, setExcludedExpiredCount] = useState(0);

  // Compute safe ingredients and urgency counts
  const { candidateCount, expiringSoonCount } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let candidates = 0;
    let expiringSoon = 0;

    for (const item of initialInventory) {
      if (!item.expiryDate) {
        candidates++;
        continue;
      }
      const expTime = new Date(item.expiryDate).getTime();
      if (expTime >= startOfToday) {
        candidates++;
        const diffDays = Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && diffDays >= 0) {
          expiringSoon++;
        }
      }
    }

    return { candidateCount: candidates, expiringSoonCount: expiringSoon };
  }, [initialInventory]);

  // Rotate loading tips during AI generation
  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setLoadingTipIndex((prev) => (prev + 1) % CULINARY_LOADING_TIPS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [loading]);

  const handleGenerate = async () => {
    if (initialInventory.length === 0) {
      showToast("Please add items to your Inventory before generating recipes.", "error");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await generateRecipesAction(recipeMode);
      if (res.success && res.recipes) {
        setRecipes(res.recipes);
        setExcludedExpiredCount(res.excludedCount || 0);
      } else {
        setError(res.error || "Failed to generate recipes. Please try again.");
        setExcludedExpiredCount(res.excludedCount || 0);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected culinary intelligence error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCookRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseDrawer = () => {
    setSelectedRecipe(null);
  };

  const handleIngredientsDeducted = async (
    itemsToConsume: { itemId: number; quantityUsed: number }[]
  ) => {
    if (itemsToConsume.length === 0) {
      showToast("No pantry items selected to deduct.", "error");
      return;
    }

    setConsuming(true);
    try {
      const res = await consumeIngredientsAction(itemsToConsume);
      if (res.success) {
        showToast("Success! Used pantry items have been logged and deducted.", "success");
        handleCloseDrawer();
        router.refresh();
      } else {
        showToast(res.error || "Failed to deduct ingredients.", "error");
      }
    } catch {
      showToast("Network error while updating pantry records.", "error");
    } finally {
      setConsuming(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* 1. Food Editorial Masthead */}
      <RecipeEditorialMasthead
        candidateCount={candidateCount}
        expiringSoonCount={expiringSoonCount}
        onQuickGenerate={handleGenerate}
        isGenerating={loading}
      />

      {/* 2. Recipe Mode Selector */}
      <RecipeModeSelector
        selectedMode={recipeMode}
        onSelectMode={(mode: RecipeMode) => setRecipeMode(mode)}
        disabled={loading}
      />

      {/* Safety & Error Feedback */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-2xl border border-[var(--shelf-terracotta)]/25 bg-[var(--shelf-terracotta)]/10 p-5 text-sm text-[var(--shelf-terracotta)] flex items-start gap-3.5 shadow-xs"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-[var(--shelf-terracotta)]" />
          <div className="flex-1">
            <h4 className="font-serif font-bold text-base text-[var(--shelf-terracotta)]">
              Culinary Dispatch Interrupted
            </h4>
            <p className="mt-1 text-xs text-[var(--shelf-dark)] opacity-90">{error}</p>
            <button
              onClick={handleGenerate}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[var(--shelf-terracotta)]/30 bg-[var(--shelf-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--shelf-terracotta)] hover:bg-[var(--shelf-cream)] transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Generation
            </button>
          </div>
        </div>
      )}

      {/* Deterministic Safety Badge when expired items were excluded */}
      {excludedExpiredCount > 0 && (
        <div className="rounded-2xl border border-[var(--shelf-blue)]/20 bg-[var(--shelf-blue)]/5 p-4 text-xs sm:text-sm text-[var(--shelf-dark)] flex items-start gap-3">
          <Info className="h-5 w-5 shrink-0 text-[var(--shelf-blue)] mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[var(--shelf-dark)]">
              Kitchen Safety Guarantee Active:
            </span>{" "}
            <span className="text-[var(--shelf-muted)]">
              {excludedExpiredCount} expired item{excludedExpiredCount !== 1 ? "s were" : " was"}{" "}
              strictly excluded from recipe suggestions. ShelfLife ensures only safe, edible
              ingredients are recommended.
            </span>
          </div>
        </div>
      )}

      {/* 3. Main Content State (Empty / Loading / Recipe Grid) */}
      {recipes.length === 0 && !loading ? (
        /* Editorial Culinary Studio Empty State */
        <div className="rounded-3xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-8 sm:p-14 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[var(--shelf-forest)]/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-radial from-[var(--shelf-amber)]/5 to-transparent pointer-events-none" />

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--shelf-cream)] border border-[var(--shelf-border)] text-[var(--shelf-forest)] shadow-xs">
            <Utensils className="h-9 w-9" />
          </div>

          <h3 className="mt-5 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
            Your Kitchen Studio Is Ready
          </h3>
          <p className="mt-2.5 text-xs sm:text-sm text-[var(--shelf-muted)] max-w-lg mx-auto leading-relaxed">
            ShelfLife analyzes the ingredients in your safe inventory and drafts tailored, gourmet
            home recipes designed to maximize flavor and minimize food waste.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {initialInventory.length === 0 ? (
              <div className="rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 px-5 py-3 text-xs text-[var(--shelf-muted)]">
                Add fresh ingredients to your <span className="font-bold text-[var(--shelf-dark)]">Inventory</span> to unlock AI recipe generation.
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--shelf-forest)] px-7 py-3.5 text-sm font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Draft Seasonal Recipes Now
              </button>
            )}
          </div>

          {/* Editorial Highlights Row */}
          <div className="mt-12 pt-8 border-t border-[var(--shelf-border)]/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)] flex items-center justify-center shrink-0">
                <ChefHat className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--shelf-dark)]">
                  Zero Waste Focus
                </h4>
                <p className="text-xs text-[var(--shelf-muted)] mt-1">
                  Prioritizes ingredients within 48h of expiration before they spoil.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)] flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--shelf-dark)]">
                  Pantry Ownership
                </h4>
                <p className="text-xs text-[var(--shelf-muted)] mt-1">
                  Clearly marks owned ingredients versus pantry additions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[var(--shelf-blue)]/10 text-[var(--shelf-blue)] flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--shelf-dark)]">
                  Kitchen Counter Mode
                </h4>
                <p className="text-xs text-[var(--shelf-muted)] mt-1">
                  Countertop view with checkable steps and 1-click inventory deduction.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        /* Warm Editorial Loading Animation */
        <div
          role="status"
          aria-live="polite"
          className="rounded-3xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-6"
        >
          <div className="relative flex items-center justify-center h-20 w-20">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--shelf-forest)]/30 animate-spin" />
            <div className="h-14 w-14 rounded-full bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)] flex items-center justify-center">
              <ChefHat className="h-7 w-7 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--shelf-dark)]">
              Consulting Culinary Archives
            </h3>
            <p className="text-xs sm:text-sm font-mono text-[var(--shelf-forest)] transition-all duration-300 min-h-5">
              {CULINARY_LOADING_TIPS[loadingTipIndex]}
            </p>
          </div>
        </div>
      ) : (
        /* Recipes Editorial Results Grid */
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <h2 className="font-serif text-xl font-bold text-[var(--shelf-dark)]">
                Curated Recipe Collection
              </h2>
              <p className="text-xs text-[var(--shelf-muted)]">
                {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} tailored to your available pantry
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--shelf-forest)] hover:bg-[var(--shelf-cream)] transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Re-generate Collection
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {recipes.map((recipe, idx) => (
              <EditorialRecipeCard
                key={`${recipe.name}-${idx}`}
                recipe={recipe}
                inventory={initialInventory}
                onCook={handleCookRecipe}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Kitchen Cooking Drawer */}
      {selectedRecipe && (
        <KitchenCookingDrawer
          recipe={selectedRecipe}
          inventory={initialInventory}
          isOpen={Boolean(selectedRecipe)}
          onClose={handleCloseDrawer}
          onCooked={handleIngredientsDeducted}
          consuming={consuming}
        />
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
