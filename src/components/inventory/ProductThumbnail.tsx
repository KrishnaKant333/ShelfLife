"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Milk,
  Apple,
  Beef,
  Fish,
  Wheat,
  Coffee,
  Snowflake,
  Package,
  Egg,
  Cookie,
  LucideIcon,
} from "lucide-react";

export type ProductThumbnailSize = "xs" | "sm" | "md" | "lg" | "xl" | "fill";

export interface ProductThumbnailProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
  priority?: boolean;
  size?: ProductThumbnailSize;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
}

interface CategoryMeta {
  icon: LucideIcon;
  bgGradient: string;
  iconColor: string;
  label: string;
}

/**
 * Maps product category strings to curated, high-contrast Lucide icons & gradients
 * adhering to Tier 6 (Category Fallback Icon) in the ShelfLife Image Hierarchy.
 */
export function getCategoryMeta(category = ""): CategoryMeta {
  const cat = category.toLowerCase().trim();

  if (cat.includes("egg")) {
    return {
      icon: Egg,
      bgGradient: "from-amber-100/80 to-amber-50/50 dark:from-amber-950/40 dark:to-stone-900/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      label: "Eggs",
    };
  }
  if (
    cat.includes("dairy") ||
    cat.includes("milk") ||
    cat.includes("cheese") ||
    cat.includes("yogurt") ||
    cat.includes("butter") ||
    cat.includes("paneer") ||
    cat.includes("cream")
  ) {
    return {
      icon: Milk,
      bgGradient: "from-emerald-100/70 to-teal-50/50 dark:from-emerald-950/40 dark:to-stone-900/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      label: "Dairy",
    };
  }
  if (
    cat.includes("produce") ||
    cat.includes("fruit") ||
    cat.includes("veg") ||
    cat.includes("tomato") ||
    cat.includes("apple") ||
    cat.includes("banana") ||
    cat.includes("spinach") ||
    cat.includes("onion") ||
    cat.includes("salad")
  ) {
    return {
      icon: Apple,
      bgGradient: "from-emerald-100/70 to-lime-50/50 dark:from-emerald-950/40 dark:to-stone-900/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      label: "Produce",
    };
  }
  if (cat.includes("fish") || cat.includes("salmon") || cat.includes("seafood") || cat.includes("tuna") || cat.includes("prawn")) {
    return {
      icon: Fish,
      bgGradient: "from-cyan-100/70 to-sky-50/50 dark:from-cyan-950/40 dark:to-stone-900/60",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      label: "Seafood",
    };
  }
  if (
    cat.includes("meat") ||
    cat.includes("chicken") ||
    cat.includes("beef") ||
    cat.includes("poultry") ||
    cat.includes("pork") ||
    cat.includes("mutton")
  ) {
    return {
      icon: Beef,
      bgGradient: "from-rose-100/70 to-red-50/50 dark:from-rose-950/40 dark:to-stone-900/60",
      iconColor: "text-rose-600 dark:text-rose-400",
      label: "Meat & Poultry",
    };
  }
  if (
    cat.includes("bakery") ||
    cat.includes("bread") ||
    cat.includes("grain") ||
    cat.includes("rice") ||
    cat.includes("pasta") ||
    cat.includes("flour") ||
    cat.includes("bun") ||
    cat.includes("toast")
  ) {
    return {
      icon: Wheat,
      bgGradient: "from-amber-100/70 to-orange-50/50 dark:from-amber-950/40 dark:to-stone-900/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      label: "Bakery & Grains",
    };
  }
  if (
    cat.includes("beverage") ||
    cat.includes("drink") ||
    cat.includes("coffee") ||
    cat.includes("tea") ||
    cat.includes("juice") ||
    cat.includes("water") ||
    cat.includes("soda")
  ) {
    return {
      icon: Coffee,
      bgGradient: "from-stone-200/80 to-amber-50/40 dark:from-stone-900/60 dark:to-amber-950/30",
      iconColor: "text-amber-700 dark:text-amber-400",
      label: "Beverages",
    };
  }
  if (cat.includes("frozen") || cat.includes("ice") || cat.includes("pea")) {
    return {
      icon: Snowflake,
      bgGradient: "from-sky-100/70 to-indigo-50/50 dark:from-sky-950/40 dark:to-stone-900/60",
      iconColor: "text-sky-600 dark:text-sky-400",
      label: "Frozen",
    };
  }
  if (
    cat.includes("snack") ||
    cat.includes("chip") ||
    cat.includes("cookie") ||
    cat.includes("crisp") ||
    cat.includes("biscuit") ||
    cat.includes("chocolate") ||
    cat.includes("candy")
  ) {
    return {
      icon: Cookie,
      bgGradient: "from-amber-100/70 to-yellow-50/50 dark:from-amber-950/40 dark:to-stone-900/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      label: "Snacks",
    };
  }

  return {
    icon: Package,
    bgGradient: "from-stone-200/70 to-stone-100/80 dark:from-stone-900/60 dark:to-neutral-950/60",
    iconColor: "text-emerald-600 dark:text-emerald-500",
    label: "Pantry",
  };
}

const SIZE_CONTAINER_CLASSES: Record<ProductThumbnailSize, string> = {
  xs: "w-7 h-7 min-w-7 min-h-7",
  sm: "w-10 h-10 min-w-10 min-h-10",
  md: "w-14 h-14 min-w-14 min-h-14",
  lg: "w-28 h-28 min-w-28 min-h-28",
  xl: "w-44 h-44 min-w-44 min-h-44",
  fill: "w-full h-full",
};

const ICON_SIZES: Record<ProductThumbnailSize, number> = {
  xs: 14,
  sm: 18,
  md: 26,
  lg: 44,
  xl: 64,
  fill: 36,
};

const ROUNDED_CLASSES: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  "2xl": "rounded-3xl",
  full: "rounded-full",
};

export default function ProductThumbnail({
  src,
  alt,
  category = "",
  className = "",
  priority = false,
  size = "md",
  rounded = "xl",
}: ProductThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(src));

  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  const iconSize = ICON_SIZES[size];
  const roundedClass = ROUNDED_CLASSES[rounded] ?? "rounded-xl";
  const sizeClass = SIZE_CONTAINER_CLASSES[size];

  // If no image provided or error occurred, render Tier 6 Category Fallback Icon
  if (!src || imageError) {
    const isSmall = size === "xs" || size === "sm";

    return (
      <div
        className={`relative aspect-square flex items-center justify-center overflow-hidden border border-[var(--app-border-subtle)] bg-gradient-to-br ${meta.bgGradient} ${roundedClass} ${sizeClass} ${className}`}
        aria-label={`${alt} (${meta.label})`}
        role="img"
      >
        {isSmall ? (
          <Icon size={iconSize} className={`${meta.iconColor} shrink-0`} strokeWidth={2} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-2 text-center select-none">
            <div className="flex items-center justify-center rounded-xl border border-stone-200/80 dark:border-white/10 bg-white/90 dark:bg-black/40 p-2.5 shadow-xs">
              <Icon size={iconSize} className={meta.iconColor} strokeWidth={1.8} />
            </div>
            {size === "xl" && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                {meta.label}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  const isConfiguredHost =
    src.startsWith("https://images.openfoodfacts.org") ||
    src.startsWith("https://static.openfoodfacts.org") ||
    src.includes(".public.blob.vercel-storage.com");

  return (
    <div
      className={`relative aspect-square flex items-center justify-center overflow-hidden border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] ${roundedClass} ${sizeClass} ${className}`}
    >
      {/* Loading Skeleton Shimmer */}
      {isLoading && (
        <div className="absolute inset-0 z-10 animate-pulse bg-stone-200/70 dark:bg-stone-800/80" />
      )}

      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={priority}
        unoptimized={!isConfiguredHost}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        className={`object-contain p-2 transition-transform duration-300 ease-out group-hover:scale-105 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
