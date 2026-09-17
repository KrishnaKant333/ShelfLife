export type ExpiryType =
  | "MANUFACTURER_EXPIRY"
  | "BEST_BEFORE"
  | "MFG_PLUS_SHELF_LIFE"
  | "AI_ESTIMATED"
  | "UNKNOWN";

export type ExpiryEvidence = {
  expiryDate?: string | null;
  bestBeforeDate?: string | null;
  manufacturingDate?: string | null;
  shelfLifeDays?: number | null;
  name?: string | null;
  category?: string | null;
};

export type ResolvedExpiry = {
  expiryDate: string | null;
  expiryType: ExpiryType;
  isEstimated: boolean;
  daysEstimated?: number;
};

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Standard USDA FoodKeeper & cold chain commercial shelf-life heuristics (in days).
 * Sub-commodity keywords are matched first; if none match, category fallbacks apply.
 */
interface CommodityRule {
  keywords: string[];
  days: number;
}

const COMMODITY_RULES: CommodityRule[] = [
  // High-risk fresh poultry & seafood (2 days)
  {
    keywords: ["poultry", "chicken", "turkey", "fish", "salmon", "shrimp", "prawn", "seafood", "ground meat", "mince"],
    days: 2,
  },
  // Fresh red meat (3-5 days)
  {
    keywords: ["beef", "pork", "lamb", "mutton", "steak", "veal"],
    days: 4,
  },
  // Fast-respiring fresh produce & leafy greens (3-4 days)
  {
    keywords: ["berry", "berries", "strawberry", "spinach", "lettuce", "kale", "salad", "cilantro", "coriander", "herb", "mushroom", "sprout"],
    days: 4,
  },
  // Fresh bakery / bread (5 days)
  {
    keywords: ["bread", "loaf", "baguette", "croissant", "bun", "muffin", "bagel", "bakery", "roti", "pita"],
    days: 5,
  },
  // Fresh dairy (7 days)
  {
    keywords: ["milk", "yogurt", "curd", "cream", "paneer", "cottage cheese", "ricotta"],
    days: 7,
  },
  // Standard fresh fruits & vegetables (7 days)
  {
    keywords: ["banana", "tomato", "cucumber", "bell pepper", "capsicum", "carrot", "apple", "orange", "lemon", "lime", "grape", "avocado", "broccoli", "cauliflower"],
    days: 7,
  },
  // Cured / processed meats (10 days)
  {
    keywords: ["bacon", "sausage", "ham", "salami", "hot dog", "deli meat"],
    days: 10,
  },
  // Eggs (21 days)
  {
    keywords: ["egg", "eggs"],
    days: 21,
  },
  // Hard produce / root vegetables (28 days)
  {
    keywords: ["potato", "potatoes", "onion", "onions", "garlic", "shallot", "ginger", "squash", "pumpkin", "sweet potato"],
    days: 28,
  },
  // Aged / hard dairy (30 days)
  {
    keywords: ["cheddar", "parmesan", "gouda", "hard cheese", "butter", "ghee"],
    days: 30,
  },
  // Packaged bakery & tortillas (30 days)
  {
    keywords: ["tortilla", "wrap", "cookie", "cookies", "biscuit", "cracker"],
    days: 30,
  },
  // Frozen foods (90 days)
  {
    keywords: ["frozen", "ice cream", "frozen peas", "frozen berries", "nuggets"],
    days: 90,
  },
  // Dry pantry staples (180 days)
  {
    keywords: ["rice", "pasta", "spaghetti", "noodle", "flour", "grain", "oats", "cereal", "lentil", "dal", "bean", "chickpea", "quinoa"],
    days: 180,
  },
  // Canned and preserved goods (365 days)
  {
    keywords: ["canned", "tin", "canned beans", "canned tomato", "tuna can", "olive oil", "oil", "vinegar", "honey", "sugar", "salt"],
    days: 365,
  },
];

export const CATEGORY_DEFAULT_DAYS: Record<string, number> = {
  meat: 3,
  "meat & poultry": 3,
  seafood: 2,
  dairy: 7,
  bakery: 5,
  produce: 5,
  beverages: 14,
  snacks: 60,
  frozen: 90,
  pantry: 180,
  grains: 180,
  "canned goods": 365,
};

export const ESTIMATED_SHELF_LIFE_DAYS = CATEGORY_DEFAULT_DAYS;

/**
 * Determines estimated shelf-life days based on product name and category.
 * Returns null if the item cannot be reliably estimated.
 */
export function estimateShelfLifeDays(name?: string | null, category?: string | null): number | null {
  const normName = (name ?? "").toLowerCase().trim();
  const normCat = (category ?? "").toLowerCase().trim();

  // 1. Try commodity rule matches based on product name
  if (normName) {
    for (const rule of COMMODITY_RULES) {
      if (rule.keywords.some((kw) => normName.includes(kw))) {
        return rule.days;
      }
    }
  }

  // 2. Try category defaults
  if (normCat && CATEGORY_DEFAULT_DAYS[normCat] != null) {
    return CATEGORY_DEFAULT_DAYS[normCat];
  }

  // 3. Fallback for common word substrings in category
  for (const [catKey, days] of Object.entries(CATEGORY_DEFAULT_DAYS)) {
    if (normCat.includes(catKey)) {
      return days;
    }
  }

  // If completely ambiguous or non-perishable
  return null;
}

/**
 * Resolves product expiry through the 5-Tier Expiry Intelligence Hierarchy:
 * Tier 1: Explicit Manufacturer Expiry Date
 * Tier 2: Explicit Best-Before / Use-By Date
 * Tier 3: Manufacturing Date + Stated Shelf Life
 * Tier 4: AI / Category-Estimated Shelf Life from reference date
 * Tier 5: Unknown Freshness (Date Not Available)
 */
export function resolveExpiryProvenance(
  evidence: ExpiryEvidence,
  referenceDateInput?: string | Date | null
): ResolvedExpiry {
  // Tier 1: Explicit printed manufacturer expiry date
  const explicitExp = parseDate(evidence.expiryDate);
  if (explicitExp) {
    return {
      expiryDate: formatDateString(explicitExp),
      expiryType: "MANUFACTURER_EXPIRY",
      isEstimated: false,
    };
  }

  // Tier 2: Explicit printed best-before / use-by date
  const explicitBB = parseDate(evidence.bestBeforeDate);
  if (explicitBB) {
    return {
      expiryDate: formatDateString(explicitBB),
      expiryType: "BEST_BEFORE",
      isEstimated: false,
    };
  }

  // Tier 3: Stated manufacturing date + stated shelf-life duration
  const mfgDate = parseDate(evidence.manufacturingDate);
  const statedDays = evidence.shelfLifeDays;
  if (mfgDate && Number.isFinite(statedDays) && statedDays && statedDays > 0) {
    const calculated = new Date(mfgDate.getTime());
    calculated.setUTCDate(calculated.getUTCDate() + statedDays);
    return {
      expiryDate: formatDateString(calculated),
      expiryType: "MFG_PLUS_SHELF_LIFE",
      isEstimated: false,
    };
  }

  // Tier 4: AI / Category-Estimated shelf life from reference date (invoice/purchase date or today)
  const estimatedDays = estimateShelfLifeDays(evidence.name, evidence.category);
  if (estimatedDays != null && estimatedDays > 0) {
    const baseDate = parseDate(referenceDateInput) ?? new Date();
    const estDate = new Date(baseDate.getTime());
    estDate.setUTCDate(estDate.getUTCDate() + estimatedDays);
    return {
      expiryDate: formatDateString(estDate),
      expiryType: "AI_ESTIMATED",
      isEstimated: true,
      daysEstimated: estimatedDays,
    };
  }

  // Tier 5: Unknown freshness
  return {
    expiryDate: null,
    expiryType: "UNKNOWN",
    isEstimated: false,
  };
}

/**
 * Backward-compatible helper that returns only the derived ISO date string or null.
 */
export function deriveExpiryDate(evidence: ExpiryEvidence, referenceDate?: string | Date | null): string | null {
  return resolveExpiryProvenance(evidence, referenceDate).expiryDate;
}
