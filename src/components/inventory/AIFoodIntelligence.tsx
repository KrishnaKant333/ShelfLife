"use client";

import Link from "next/link";
import { Sparkles, ChefHat, AlertCircle, ShieldAlert, ArrowRight, Lightbulb } from "lucide-react";
import { getDaysUntilExpiry } from "@/lib/format-expiry";

interface AIFoodIntelligenceProps {
  productName: string;
  category: string;
  expiryDate: string | null;
  isBusiness?: boolean;
}

function getCategoryIntelligence(category: string, productName: string, days: number): {
  executiveSummary: string;
  spoilageSigns: string[];
  shelfExtender: string;
  culinaryPairings: string[];
} {
  const cat = category.toLowerCase();
  const isUrgent = Number.isFinite(days) && days <= 3;

  if (cat.includes("dairy") || cat.includes("milk") || cat.includes("yogurt") || cat.includes("cheese")) {
    return {
      executiveSummary: isUrgent
        ? `${productName} is nearing its optimal freshness threshold. Protein stability and lactic acidity are transitioning. Best utilized within 48 hours in warm baking, smooth purees, or sauces before sour notes emerge.`
        : `${productName} maintains high structural purity and standard bacterial cultures. Keep sealed between uses to prevent odor absorption from ambient refrigerator items.`,
      spoilageSigns: [
        "Sour, pungent, or fermented aroma upon uncapping",
        "Curdling, phase separation, or uneven textural graininess",
        "Discoloration or yellowing around packaging rims",
      ],
      shelfExtender:
        "Can be frozen in silicone cubes for up to 3 months; thaw overnight in refrigeration for cooking uses.",
      culinaryPairings: ["Rolled oats", "Blueberries", "Vanilla", "Honey", "Cinnamon"],
    };
  }

  if (cat.includes("meat") || cat.includes("poultry") || cat.includes("chicken") || cat.includes("beef") || cat.includes("salmon") || cat.includes("fish")) {
    return {
      executiveSummary: isUrgent
        ? `Critical protein consumption window: ${productName} should be cooked thoroughly today or pre-seasoned and frozen immediately to halt bacterial enzymatic breakdown.`
        : `${productName} exhibits optimal color saturation and moisture retention. Maintain strict cold-chain refrigeration below 3°C until preparation.`,
      spoilageSigns: [
        "Unpleasant, sulfurous, or acidic odor",
        "Slimy, tacky, or unusually slick surface sheen",
        "Dull grayish, greenish, or brown tonal shift in meat fibers",
      ],
      shelfExtender:
        "Freeze airtight in vacuum-sealed wrap for 6 months. Defrost strictly in the refrigerator, never at room temperature.",
      culinaryPairings: ["Garlic", "Rosemary", "Olive oil", "Lemon zest", "Cracked pepper"],
    };
  }

  if (cat.includes("produce") || cat.includes("fruit") || cat.includes("veg") || cat.includes("tomato") || cat.includes("spinach")) {
    return {
      executiveSummary: isUrgent
        ? `Moisture transpirational loss is commencing in ${productName}. Crispness will diminish within 24-48h. Ideal candidate for roasting, soup bases, stir-fries, or pestos.`
        : `${productName} is in prime nutritional condition. Rich in active dietary antioxidants, vitamins, and dietary fiber.`,
      spoilageSigns: [
        "Soft spots, wrinkling skin, or collapsed watery areas",
        "Visible mold filaments or dark bruising",
        "Uncharacteristic musty or alcoholic scent",
      ],
      shelfExtender:
        "Line crisper container with paper towels to absorb excess condensation. Wash immediately prior to consumption, not beforehand.",
      culinaryPairings: ["Extra virgin olive oil", "Sea salt", "Balsamic glaze", "Feta", "Shallots"],
    };
  }

  if (cat.includes("bakery") || cat.includes("bread")) {
    return {
      executiveSummary: isUrgent
        ? `Starch retrogradation is active. Slice remaining portions and freeze immediately to preserve crumb structure for quick toasting.`
        : `${productName} possesses fresh aromatic crust and soft interior crumb. Keep sealed away from airflow.`,
      spoilageSigns: [
        "Green, white, or dark mold colonies spreading on crumb",
        "Hard, unyielding staling throughout the core",
        "Yeasty sour odor",
      ],
      shelfExtender:
        "Slice before freezing. Toast directly from frozen state for identical fresh-baked texture.",
      culinaryPairings: ["Salted butter", "Avocado", "Poached eggs", "Artisan jam"],
    };
  }

  return {
    executiveSummary: `${productName} is stable and safely stored. Rotate stock using FIFO discipline to ensure items closest to expiration are consumed first.`,
    spoilageSigns: [
      "Compromised packaging seals or puffing canisters",
      "Off-odors, rancidity, or flavor bitterness",
      "Moisture infiltration into dry ingredients",
    ],
    shelfExtender:
      "Keep tightly sealed in an opaque airtight container protected from ambient humidity and heat.",
    culinaryPairings: ["Fresh herbs", "Aromatics", "Citrus", "Olive oil"],
  };
}

export default function AIFoodIntelligence({
  productName,
  category,
  expiryDate,
  isBusiness = false,
}: AIFoodIntelligenceProps) {
  const days = getDaysUntilExpiry(expiryDate);
  const intel = getCategoryIntelligence(category, productName, days);

  return (
    <div className="space-y-4">
      {/* Primary AI Executive Briefing */}
      <div className="sl-editorial-card p-5 sm:p-6 relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-[var(--app-accent-emerald)] font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} />
            <span>AI Food Intelligence & Advisory</span>
          </div>

          <span className="rounded-full bg-[var(--app-accent-emerald)]/10 px-2.5 py-0.5 text-[10px] font-bold text-[var(--app-accent-emerald)]">
            Verified Engine
          </span>
        </div>

        <p className="text-sm text-[var(--app-text-display)] leading-relaxed font-medium">
          {intel.executiveSummary}
        </p>

        {/* Shelf-Life Extender Tip */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3 text-xs">
          <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[var(--app-text-display)]">
              Preservation Strategy:
            </span>{" "}
            <span className="text-[var(--app-text-muted)]">
              {intel.shelfExtender}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Insights: Spoilage Checklist & Culinary Pairings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sensory Spoilage Verification */}
        <div className="sl-editorial-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldAlert size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Spoilage Indicators Checklist
            </h4>
          </div>

          <p className="text-[11px] text-[var(--app-text-muted)]">
            Always verify sensory checkpoints before discarding food to reduce false waste:
          </p>

          <ul className="space-y-2 text-xs text-[var(--app-text-body)]">
            {intel.spoilageSigns.map((sign, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <AlertCircle size={13} className="text-rose-500/70 shrink-0 mt-0.5" />
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Culinary Pairings */}
        <div className="sl-editorial-card p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--app-accent-emerald)]">
              <ChefHat size={16} />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {isBusiness ? "Commercial Ingredient Pairings" : "Kitchen Pairings & Recipes"}
              </h4>
            </div>

            <p className="text-[11px] text-[var(--app-text-muted)]">
              {isBusiness
                ? "Harmonious ingredients for prep stations and commercial menu pairing:"
                : "Harmonious ingredients already commonly found in consumer and commercial kitchens:"}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {intel.culinaryPairings.map((pairing) => (
                <span
                  key={pairing}
                  className="rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-2.5 py-1 text-xs font-medium text-[var(--app-text-body)]"
                >
                  {pairing}
                </span>
              ))}
            </div>
          </div>

          {!isBusiness && (
            <div className="pt-2 border-t border-[var(--app-border-subtle)]">
              <Link
                href={`/dashboard/recipes?ingredient=${encodeURIComponent(productName)}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-surface-base)] hover:bg-[var(--app-accent-emerald)]/10 border border-[var(--app-border-subtle)] hover:border-[var(--app-accent-emerald)]/40 px-3.5 py-2 text-xs font-semibold text-[var(--app-accent-emerald)] transition"
              >
                <Sparkles size={13} />
                <span>Generate AI Recipes with {productName}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
