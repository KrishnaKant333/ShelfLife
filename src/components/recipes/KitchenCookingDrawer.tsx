"use client";

import { useState, useEffect } from "react";
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Sparkles,
  ChefHat,
  Check,
  RotateCcw,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";
import type { Recipe } from "@/lib/actions/recipes";
import {
  convertCulinaryQuantity,
  getCulinaryEquivalentDisplay,
  isIntegerUnit,
  parseRecipeQuantityAndUnit,
} from "@/lib/normalization";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface KitchenCookingDrawerProps {
  recipe: Recipe;
  inventory: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onCooked: (itemsToConsume: { itemId: number; quantityUsed: number }[]) => Promise<void>;
  consuming: boolean;
}

type IngredientUsageState = {
  activeUnit: string;
  inputValue: string;
  error?: string;
};

export function KitchenCookingDrawer({
  recipe,
  inventory,
  isOpen,
  onClose,
  onCooked,
  consuming,
}: KitchenCookingDrawerProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [consumeSelected, setConsumeSelected] = useState<Record<number, boolean>>({});
  const [usageStates, setUsageStates] = useState<Record<number, IngredientUsageState>>({});
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Initialize consumption states whenever recipe opens
  useEffect(() => {
    if (!isOpen) return;

    setCompletedSteps({});
    const initialSelected: Record<number, boolean> = {};
    const initialStates: Record<number, IngredientUsageState> = {};

    recipe.ingredients.forEach((ing) => {
      if (!ing.itemId) return;
      const matchedItem = inventory.find((item) => item.id === ing.itemId);
      if (!matchedItem) return;

      initialSelected[ing.itemId] = true;

      const parsed = parseRecipeQuantityAndUnit(ing.quantityUsed);
      let activeUnit = matchedItem.unit;
      let defaultVal = isIntegerUnit(matchedItem.unit)
        ? Math.min(matchedItem.quantity, 1)
        : Math.min(matchedItem.quantity, 1);
      let error: string | undefined = undefined;

      if (parsed) {
        // First check culinary conversion (exact or intelligent culinary equivalent)
        const conversion = convertCulinaryQuantity(
          parsed.quantity,
          parsed.unit,
          matchedItem.unit,
          { name: matchedItem.name, category: matchedItem.category }
        );

        if (conversion !== null) {
          // Compatible: prefer displaying in recipe's natural unit so user sees e.g. "1 tbsp"
          activeUnit = parsed.unit;
          defaultVal = parsed.quantity;
        } else {
          // Genuinely incompatible (e.g. volume vs count/pieces):
          // Never silently assume 1 pantry unit. Clearly signal that equivalent is unavailable.
          activeUnit = matchedItem.unit;
          defaultVal = 0;
          error = `Equivalent unavailable — specify ${matchedItem.unit} to deduct`;
        }
      }

      initialStates[ing.itemId] = {
        activeUnit,
        inputValue: defaultVal > 0 ? String(defaultVal) : "",
        error,
      };
    });

    setConsumeSelected(initialSelected);
    setUsageStates(initialStates);
  }, [isOpen, recipe, inventory]);

  // Screen Wake Lock API for countertop cooking
  useEffect(() => {
    let sentinel: any = null;
    if (wakeLockActive && "wakeLock" in navigator) {
      (navigator as any).wakeLock
        ?.request("screen")
        .then((lock: any) => {
          sentinel = lock;
        })
        .catch(() => {
          setWakeLockActive(false);
        });
    }
    return () => {
      if (sentinel) {
        sentinel.release().catch(() => {});
      }
    };
  }, [wakeLockActive]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalSteps = recipe.instructions.length;
  const finishedStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((finishedStepsCount / totalSteps) * 100) : 0;

  const handleToggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleQuantityChange = (itemId: number, rawValue: string) => {
    setUsageStates((prev) => {
      const current = prev[itemId];
      if (!current) return prev;

      let error: string | undefined = undefined;
      const parsed = parseFloat(rawValue);
      const matchedItem = inventory.find((item) => item.id === itemId);

      if (matchedItem && rawValue.trim() !== "") {
        if (isNaN(parsed) || !Number.isFinite(parsed)) {
          error = "Invalid number";
        } else if (parsed <= 0) {
          error = "Must be > 0";
        } else {
          const isInt = isIntegerUnit(current.activeUnit);
          if (isInt && !Number.isInteger(parsed)) {
            error = "Whole number required";
          } else {
            const conversion = convertCulinaryQuantity(
              parsed,
              current.activeUnit,
              matchedItem.unit,
              { name: matchedItem.name, category: matchedItem.category }
            );
            if (conversion === null) {
              error = `Incompatible unit conversion to ${matchedItem.unit}`;
            } else if (conversion.value > matchedItem.quantity) {
              error = `Max ${matchedItem.quantity} ${matchedItem.unit}`;
            }
          }
        }
      }

      return {
        ...prev,
        [itemId]: {
          ...current,
          inputValue: rawValue,
          error,
        },
      };
    });
  };

  const handleToggleUnit = (itemId: number) => {
    setUsageStates((prev) => {
      const current = prev[itemId];
      const matchedItem = inventory.find((item) => item.id === itemId);
      if (!current || !matchedItem) return prev;

      // Determine target unit
      const parsedRecipe = parseRecipeQuantityAndUnit(
        recipe.ingredients.find((i) => i.itemId === itemId)?.quantityUsed || ""
      );
      const recipeUnit = parsedRecipe?.unit || matchedItem.unit;
      const targetUnit =
        current.activeUnit.toLowerCase() === matchedItem.unit.toLowerCase()
          ? recipeUnit
          : matchedItem.unit;

      const currentNum = parseFloat(current.inputValue);
      if (isNaN(currentNum) || currentNum <= 0) {
        return {
          ...prev,
          [itemId]: {
            ...current,
            activeUnit: targetUnit,
            error: undefined,
          },
        };
      }

      const conversion = convertCulinaryQuantity(
        currentNum,
        current.activeUnit,
        targetUnit,
        { name: matchedItem.name, category: matchedItem.category }
      );
      if (conversion === null) return prev;

      const cleanConverted =
        conversion.value >= 10
          ? Math.round(conversion.value * 10) / 10
          : Math.round(conversion.value * 100) / 100;

      return {
        ...prev,
        [itemId]: {
          activeUnit: targetUnit,
          inputValue: String(cleanConverted),
          error: undefined,
        },
      };
    });
  };

  const handleDeductAndComplete = async () => {
    const itemsToDeduct: { itemId: number; quantityUsed: number }[] = [];
    let hasError = false;

    for (const itemIdStr of Object.keys(consumeSelected)) {
      const itemId = Number(itemIdStr);
      if (!consumeSelected[itemId]) continue;

      const state = usageStates[itemId];
      const matchedItem = inventory.find((item) => item.id === itemId);
      if (!state || !matchedItem) continue;

      const parsed = parseFloat(state.inputValue);
      if (isNaN(parsed) || !Number.isFinite(parsed) || parsed <= 0) {
        hasError = true;
        setUsageStates((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], error: "Enter a valid quantity > 0" },
        }));
        continue;
      }

      const isInt = isIntegerUnit(state.activeUnit);
      if (isInt && !Number.isInteger(parsed)) {
        hasError = true;
        setUsageStates((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], error: "Must be a whole number" },
        }));
        continue;
      }

      const conversion = convertCulinaryQuantity(
        parsed,
        state.activeUnit,
        matchedItem.unit,
        { name: matchedItem.name, category: matchedItem.category }
      );
      if (conversion === null) {
        hasError = true;
        setUsageStates((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], error: `Incompatible unit conversion to ${matchedItem.unit}` },
        }));
        continue;
      }

      if (conversion.value > matchedItem.quantity) {
        hasError = true;
        setUsageStates((prev) => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            error: `Exceeds stock (${matchedItem.quantity} ${matchedItem.unit})`,
          },
        }));
        continue;
      }

      const cleanQty = Math.round(conversion.value * 10000) / 10000;
      itemsToDeduct.push({
        itemId,
        quantityUsed: cleanQty,
      });
    }

    if (hasError || itemsToDeduct.length === 0) {
      return;
    }

    await onCooked(itemsToDeduct);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cooking-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
    >
      <div className="relative flex h-full w-full max-w-3xl flex-col bg-[var(--shelf-surface)] border-l border-[var(--shelf-border)] shadow-2xl overflow-hidden">
        {/* Countertop Masthead Header */}
        <header className="relative shrink-0 border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/60 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--shelf-forest)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--shelf-forest)]">
                  <ChefHat className="h-3.5 w-3.5" />
                  Kitchen Cooking Mode
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--shelf-surface)] border border-[var(--shelf-border)] px-2.5 py-0.5 text-xs font-mono text-[var(--shelf-muted)]">
                  <Clock className="h-3 w-3" />
                  {recipe.estimatedPrepTime} min prep
                </span>
              </div>
              <h2
                id="cooking-drawer-title"
                className="font-serif text-2xl font-bold tracking-tight text-[var(--shelf-dark)] sm:text-3xl"
              >
                {recipe.name}
              </h2>
              <p className="text-xs text-[var(--shelf-muted)] sm:text-sm line-clamp-2">
                {recipe.description}
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close cooking drawer"
              className="rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-2 text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cooking Progress Bar & Controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--shelf-border)]/50 pt-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 rounded-full bg-[var(--shelf-border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--shelf-forest)] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-[var(--shelf-dark)]">
                {finishedStepsCount}/{totalSteps} steps ({progressPercent}%)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {"wakeLock" in (typeof navigator !== "undefined" ? navigator : {}) && (
                <button
                  type="button"
                  onClick={() => setWakeLockActive((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                    wakeLockActive
                      ? "border-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]"
                      : "border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
                  }`}
                  title="Keeps your screen awake while cooking on the countertop"
                >
                  <Sparkles className="h-3 w-3" />
                  {wakeLockActive ? "Screen Awake ON" : "Keep Screen Awake"}
                </button>
              )}

              {finishedStepsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setCompletedSteps({})}
                  className="inline-flex items-center gap-1 text-xs text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] transition cursor-pointer"
                  title="Reset step progress"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Cooking Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-8">
          {/* Editorial Recommendation Callout */}
          {recipe.whyRecommended && (
            <div className="rounded-2xl border border-[var(--shelf-forest)]/20 bg-[var(--shelf-forest)]/5 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--shelf-forest)]">
                <Sparkles className="h-4 w-4" />
                Editorial Chef Note
              </div>
              <p className="mt-1.5 text-sm text-[var(--shelf-dark)] leading-relaxed italic">
                &ldquo;{recipe.whyRecommended}&rdquo;
              </p>
            </div>
          )}

          {/* Section 1: Ingredients Checklist with Stock & Deduct Pickers */}
          <section aria-labelledby="ingredients-heading" className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3
                id="ingredients-heading"
                className="font-serif text-lg font-bold text-[var(--shelf-dark)] flex items-center gap-2"
              >
                <UtensilsCrossed className="h-4 w-4 text-[var(--shelf-forest)]" />
                Mise en Place (Ingredients)
              </h3>
              <span className="text-xs font-mono text-[var(--shelf-muted)]">
                {recipe.ingredients.filter((i) => i.itemId).length} owned in pantry
              </span>
            </div>

            <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] divide-y divide-[var(--shelf-border)] overflow-hidden shadow-xs">
              {recipe.ingredients.map((ing, i) => {
                const matchedItem = ing.itemId
                  ? inventory.find((item) => item.id === ing.itemId)
                  : null;
                const isSelected = !!consumeSelected[ing.itemId ?? -1];
                const isExpiringSoon = ing.status === "expiring_soon";
                const isOwned = Boolean(ing.itemId);
                const usageState = ing.itemId ? usageStates[ing.itemId] : null;

                // Check if unit conversion to pantry unit is active
                let equivalentInPantry: number | null = null;
                let isEstimatedInPantry = false;
                let culinaryEquivalent: string | null = null;
                let canToggleUnit = false;
                let otherUnit = "";

                if (matchedItem && usageState) {
                  const numVal = parseFloat(usageState.inputValue);
                  if (!isNaN(numVal) && numVal > 0) {
                    const conversion = convertCulinaryQuantity(
                      numVal,
                      usageState.activeUnit,
                      matchedItem.unit,
                      { name: matchedItem.name, category: matchedItem.category }
                    );
                    if (conversion !== null) {
                      equivalentInPantry =
                        conversion.value >= 10
                          ? Math.round(conversion.value * 10) / 10
                          : Math.round(conversion.value * 100) / 100;
                      isEstimatedInPantry = conversion.isEstimated;
                    }

                    culinaryEquivalent = getCulinaryEquivalentDisplay(
                      numVal,
                      usageState.activeUnit,
                      matchedItem.unit,
                      { name: matchedItem.name, category: matchedItem.category }
                    );
                  }

                  const parsedRecipe = parseRecipeQuantityAndUnit(ing.quantityUsed);
                  if (parsedRecipe && parsedRecipe.unit) {
                    const testConv = convertCulinaryQuantity(
                      1,
                      parsedRecipe.unit,
                      matchedItem.unit,
                      { name: matchedItem.name, category: matchedItem.category }
                    );
                    if (testConv !== null && parsedRecipe.unit.toLowerCase() !== matchedItem.unit.toLowerCase()) {
                      canToggleUnit = true;
                      otherUnit =
                        usageState.activeUnit.toLowerCase() === matchedItem.unit.toLowerCase()
                          ? parsedRecipe.unit
                          : matchedItem.unit;
                    }
                  }
                }

                return (
                  <div
                    key={i}
                    className={`flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 transition ${
                      isSelected
                        ? "bg-[var(--shelf-cream)]/20"
                        : "bg-[var(--shelf-surface)] opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isOwned ? (
                        <input
                          type="checkbox"
                          id={`ing-check-${i}`}
                          checked={isSelected}
                          onChange={(e) => {
                            if (ing.itemId) {
                              setConsumeSelected((prev) => ({
                                ...prev,
                                [ing.itemId!]: e.target.checked,
                              }));
                            }
                          }}
                          className="h-4.5 w-4.5 rounded-sm border-[var(--shelf-border)] text-[var(--shelf-forest)] focus:ring-[var(--shelf-forest)] cursor-pointer"
                        />
                      ) : (
                        <div
                          className="h-4.5 w-4.5 rounded-full border border-dashed border-[var(--shelf-border)] flex items-center justify-center bg-[var(--shelf-cream)]"
                          title="Missing ingredient — purchase or substitute"
                        >
                          <ShoppingBag className="h-2.5 w-2.5 text-[var(--shelf-muted)]" />
                        </div>
                      )}

                      <label
                        htmlFor={isOwned ? `ing-check-${i}` : undefined}
                        className="min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isSelected ? "text-[var(--shelf-dark)]" : "text-[var(--shelf-muted)]"
                            }`}
                          >
                            {ing.name}
                          </span>
                          {ing.quantityUsed && (
                            <span className="text-xs font-mono text-[var(--shelf-muted)]">
                              ({ing.quantityUsed})
                            </span>
                          )}
                        </div>

                        {matchedItem && (
                          <span className="block text-xs font-mono text-[var(--shelf-muted)] mt-0.5">
                            In pantry: {matchedItem.quantity} {matchedItem.unit}
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--shelf-amber)]/10 border border-[var(--shelf-amber)]/20 px-2 py-0.5 text-[11px] font-semibold text-[var(--shelf-amber)]">
                          <AlertTriangle className="h-3 w-3" />
                          Expiring Soon
                        </span>
                      ) : isOwned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--shelf-forest)]/10 border border-[var(--shelf-forest)]/20 px-2 py-0.5 text-[11px] font-semibold text-[var(--shelf-forest)]">
                          <CheckCircle2 className="h-3 w-3" />
                          In Pantry
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--shelf-cream)] border border-[var(--shelf-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--shelf-muted)]">
                          <ShoppingBag className="h-3 w-3" />
                          Pantry Addition
                        </span>
                      )}

                      {/* Unit-Aware Quantity Deduction Input for Owned Items */}
                      {isOwned && isSelected && matchedItem && usageState && (
                        <div className="flex flex-col items-end gap-0.5">
                          <div
                            className={`flex items-center gap-1.5 bg-[var(--shelf-surface)] border rounded-lg px-2 py-1 ${
                              usageState.error
                                ? "border-[var(--shelf-terracotta)]"
                                : "border-[var(--shelf-border)]"
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold text-[var(--shelf-muted)]">
                              Use:
                            </span>
                            <input
                              type="number"
                              step={isIntegerUnit(usageState.activeUnit) ? "1" : "any"}
                              min={isIntegerUnit(usageState.activeUnit) ? "1" : "0.001"}
                              value={usageState.inputValue}
                              onChange={(e) =>
                                handleQuantityChange(ing.itemId!, e.target.value)
                              }
                              placeholder={usageState.error ? "Qty" : undefined}
                              className="w-16 text-center font-mono text-xs font-bold text-[var(--shelf-dark)] bg-transparent outline-hidden"
                              aria-label={`Quantity of ${ing.name} to deduct`}
                            />

                            {canToggleUnit ? (
                              <button
                                type="button"
                                onClick={() => handleToggleUnit(ing.itemId!)}
                                title={`Click to switch unit to ${otherUnit}`}
                                className="text-[10px] font-mono font-bold text-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10 hover:bg-[var(--shelf-forest)]/20 px-1.5 py-0.5 rounded cursor-pointer transition"
                              >
                                {usageState.activeUnit} ⇄
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-[var(--shelf-muted)]">
                                {usageState.activeUnit}
                              </span>
                            )}

                            {/* Dual representation for culinary volume/weight units e.g. "· ≈15 g" or "· ≈15 ml" */}
                            {culinaryEquivalent && (
                              <span
                                className="text-[10px] font-mono font-semibold text-[var(--shelf-forest)] border-l border-[var(--shelf-border)] pl-1.5"
                                title="Approximate equivalent"
                              >
                                · {culinaryEquivalent}
                              </span>
                            )}
                          </div>

                          {/* Inline Conversion / Error Notice */}
                          {usageState.error ? (
                            <span className="text-[10px] font-mono text-[var(--shelf-terracotta)] font-semibold">
                              {usageState.error}
                            </span>
                          ) : usageState.activeUnit.toLowerCase() !==
                              matchedItem.unit.toLowerCase() &&
                            equivalentInPantry !== null ? (
                            <span className="text-[10px] font-mono text-[var(--shelf-muted)]">
                              (={isEstimatedInPantry ? " ≈" : " "}{equivalentInPantry} {matchedItem.unit} from {matchedItem.quantity} {matchedItem.unit} stock)
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-[var(--shelf-muted)]">
                              Stock: {matchedItem.quantity} {matchedItem.unit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Step-by-Step Countertop Cooking Instructions */}
          <section aria-labelledby="steps-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3
                id="steps-heading"
                className="font-serif text-lg font-bold text-[var(--shelf-dark)] flex items-center gap-2"
              >
                <ChefHat className="h-4 w-4 text-[var(--shelf-forest)]" />
                Preparation &amp; Cooking Method
              </h3>
              <span className="text-xs text-[var(--shelf-muted)]">
                Tap step card when completed
              </span>
            </div>

            <div className="space-y-3">
              {recipe.instructions.map((step, idx) => {
                const isDone = Boolean(completedSteps[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleStep(idx)}
                    role="checkbox"
                    aria-checked={isDone}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        handleToggleStep(idx);
                      }
                    }}
                    className={`group relative flex items-start gap-4 rounded-2xl border p-4 sm:p-5 transition cursor-pointer select-none ${
                      isDone
                        ? "border-[var(--shelf-forest)]/30 bg-[var(--shelf-forest)]/5 opacity-80"
                        : "border-[var(--shelf-border)] bg-[var(--shelf-surface)] hover:border-[var(--shelf-forest)]/40 hover:shadow-xs"
                    }`}
                  >
                    {/* Step indicator circle */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-mono font-bold transition ${
                        isDone
                          ? "bg-[var(--shelf-forest)] text-white"
                          : "bg-[var(--shelf-cream)] text-[var(--shelf-forest)] border border-[var(--shelf-border)] group-hover:border-[var(--shelf-forest)]"
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                    </div>

                    {/* Step description */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--shelf-muted)]">
                          Step {idx + 1}
                        </span>
                        {isDone && (
                          <span className="text-[11px] font-semibold text-[var(--shelf-forest)]">
                            Completed
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          isDone
                            ? "line-through text-[var(--shelf-muted)]"
                            : "text-[var(--shelf-dark)] font-normal"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Countertop Sticky Footer Bar */}
        <footer className="shrink-0 border-t border-[var(--shelf-border)] bg-[var(--shelf-cream)]/70 px-6 py-4 sm:px-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)] transition cursor-pointer"
          >
            Exit Cooking Mode
          </button>

          <button
            type="button"
            onClick={handleDeductAndComplete}
            disabled={consuming}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-6 py-3 text-sm font-bold text-white hover:opacity-95 disabled:opacity-50 transition shadow-sm cursor-pointer"
          >
            {consuming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deducting Pantry Stock...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                I Cooked This — Log Used Ingredients
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default KitchenCookingDrawer;
