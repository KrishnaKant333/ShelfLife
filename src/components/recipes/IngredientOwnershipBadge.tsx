"use client";

import { Check, ShoppingBag, Clock } from "lucide-react";
import { RecipeIngredient } from "@/lib/actions/recipes";

interface IngredientOwnershipBadgeProps {
  ingredient: RecipeIngredient;
  compact?: boolean;
}

export default function IngredientOwnershipBadge({
  ingredient,
  compact = false,
}: IngredientOwnershipBadgeProps) {
  const isExpiring = ingredient.status === "expiring_soon";
  const isAvailable = ingredient.status === "available";
  const isStaple = ingredient.status === "pantry_item";

  if (isExpiring) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--shelf-amber)]/40 bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)] ${
          compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
        }`}
        title="Expiring soon in your pantry"
      >
        <Clock size={11} className="shrink-0" />
        <span className="font-semibold text-[var(--shelf-dark)]">{ingredient.name}</span>
        <span className="opacity-80 font-mono">({ingredient.quantityUsed})</span>
        <span className="text-[10px] font-bold text-[var(--shelf-amber)] uppercase tracking-wider">
          Expiring
        </span>
      </span>
    );
  }

  if (isAvailable) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--shelf-forest)]/30 bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)] ${
          compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
        }`}
        title="In your pantry"
      >
        <Check size={11} className="shrink-0" />
        <span className="font-semibold text-[var(--shelf-dark)]">{ingredient.name}</span>
        <span className="opacity-80 font-mono text-[var(--shelf-muted)]">
          ({ingredient.quantityUsed})
        </span>
      </span>
    );
  }

  // Pantry staple / Missing
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 text-[var(--shelf-muted)] ${
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
      title="Common pantry item or add to shopping list"
    >
      <ShoppingBag size={11} className="shrink-0 text-[var(--shelf-blue)]" />
      <span className="font-medium text-[var(--shelf-dark)]">{ingredient.name}</span>
      <span className="opacity-75 font-mono text-[10px]">({ingredient.quantityUsed})</span>
      <span className="text-[9px] font-bold text-[var(--shelf-blue)] uppercase tracking-wider">
        Staple
      </span>
    </span>
  );
}
