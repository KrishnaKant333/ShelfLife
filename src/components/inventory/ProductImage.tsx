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

interface ProductImageProps {
  src?: string | null;
  alt: string;
  category: string;
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
}

// Map categories to high-contrast icons for fallback
function getCategoryMeta(category: string): {
  icon: LucideIcon;
  bgGradient: string;
  iconColor: string;
  label: string;
} {
  const cat = category.toLowerCase();
  if (cat.includes("egg")) {
    return {
      icon: Egg,
      bgGradient: "from-amber-100/70 to-stone-100/80 dark:from-amber-950/40 dark:to-stone-900/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      label: "Eggs",
    };
  }
  if (cat.includes("dairy") || cat.includes("milk") || cat.includes("cheese") || cat.includes("yogurt") || cat.includes("butter")) {
    return {
      icon: Milk,
      bgGradient: "from-emerald-100/60 to-stone-100/80 dark:from-emerald-950/40 dark:to-stone-900/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      label: "Dairy",
    };
  }
  if (cat.includes("produce") || cat.includes("fruit") || cat.includes("veg") || cat.includes("tomato") || cat.includes("apple") || cat.includes("banana") || cat.includes("spinach") || cat.includes("onion")) {
    return {
      icon: Apple,
      bgGradient: "from-emerald-100/60 to-stone-100/80 dark:from-emerald-950/40 dark:to-stone-900/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      label: "Produce",
    };
  }
  if (cat.includes("fish") || cat.includes("salmon") || cat.includes("seafood") || cat.includes("tuna")) {
    return {
      icon: Fish,
      bgGradient: "from-cyan-100/60 to-stone-100/80 dark:from-cyan-950/40 dark:to-stone-900/60",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      label: "Seafood",
    };
  }
  if (cat.includes("meat") || cat.includes("chicken") || cat.includes("beef") || cat.includes("poultry") || cat.includes("pork")) {
    return {
      icon: Beef,
      bgGradient: "from-rose-100/60 to-stone-100/80 dark:from-rose-950/40 dark:to-stone-900/60",
      iconColor: "text-rose-600 dark:text-rose-400",
      label: "Meat & Poultry",
    };
  }
  if (cat.includes("bakery") || cat.includes("bread") || cat.includes("grain") || cat.includes("rice") || cat.includes("pasta") || cat.includes("flour") || cat.includes("bun")) {
    return {
      icon: Wheat,
      bgGradient: "from-amber-100/60 to-stone-100/80 dark:from-amber-950/40 dark:to-stone-900/60",
      iconColor: "text-amber-600 dark:text-amber-300",
      label: "Bakery & Grains",
    };
  }
  if (cat.includes("beverage") || cat.includes("drink") || cat.includes("coffee") || cat.includes("tea") || cat.includes("juice") || cat.includes("water")) {
    return {
      icon: Coffee,
      bgGradient: "from-stone-200/70 to-stone-100/80 dark:from-stone-900/60 dark:to-neutral-950/60",
      iconColor: "text-amber-600 dark:text-amber-500",
      label: "Beverages",
    };
  }
  if (cat.includes("frozen") || cat.includes("ice") || cat.includes("pea")) {
    return {
      icon: Snowflake,
      bgGradient: "from-cyan-100/60 to-stone-100/80 dark:from-cyan-950/40 dark:to-stone-900/60",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      label: "Frozen",
    };
  }
  if (cat.includes("snack") || cat.includes("chip") || cat.includes("cookie") || cat.includes("crisp")) {
    return {
      icon: Cookie,
      bgGradient: "from-amber-100/60 to-stone-100/80 dark:from-amber-950/40 dark:to-stone-900/60",
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

export default function ProductImage({
  src,
  alt,
  category,
  className = "",
  priority = false,
  size = "md",
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  const iconSizes = {
    sm: 18,
    md: 38,
    lg: 54,
  };

  // If no image source provided or image loading failed, render category visual
  if (!src || imageError) {
    if (size === "sm") {
      return (
        <div
          className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-[var(--app-border-subtle)] bg-gradient-to-br ${meta.bgGradient} ${className}`}
          aria-label={`${alt} (${category})`}
        >
          <Icon size={18} className={`${meta.iconColor} shrink-0`} strokeWidth={2} />
        </div>
      );
    }

    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-[var(--app-border-subtle)] bg-gradient-to-br ${meta.bgGradient} ${className}`}
        aria-label={`${alt} (${category})`}
      >
        <div className="flex flex-col items-center gap-1.5 p-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-stone-200/80 dark:border-white/5 bg-white/90 dark:bg-black/30 shadow-xs dark:shadow-inner">
            <Icon size={iconSizes[size]} className={meta.iconColor} strokeWidth={1.75} />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
            {meta.label}
          </span>
        </div>
      </div>
    );
  }

  // Next.js Image with unoptimized flag fallback for external hosts or optimized for configured hosts
  const isConfiguredHost =
    src.startsWith("https://images.openfoodfacts.org") ||
    src.startsWith("https://static.openfoodfacts.org");

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${
        size === "sm" ? "rounded-lg" : "rounded-xl"
      } bg-black/20 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={priority}
        unoptimized={!isConfiguredHost}
        onError={() => setImageError(true)}
        className="object-contain p-2.5 transition-transform duration-300 ease-out group-hover:scale-105"
      />
    </div>
  );
}
