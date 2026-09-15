export type UnitCategory = "weight" | "volume" | "count" | "incompatible";

const UNIT_ALIASES = {
  weight: ["mg", "g", "gm", "gram", "grams", "kg", "kilogram", "kilograms", "tonne", "tonnes", "t", "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds"],
  volume: [
    "ml", "millilitre", "millilitres", "milliliter", "milliliters",
    "l", "litre", "litres", "liter", "liters",
    "cl", "gallon", "gallons", "gal",
    "fl oz", "fluid ounce", "fluid ounces",
    "tsp", "tsps", "teaspoon", "teaspoons",
    "tbsp", "tbsps", "tablespoon", "tablespoons", "tbs",
    "dstsp", "dessertspoon", "dessertspoons",
    "cup", "cups",
    "pint", "pints", "pt",
    "quart", "quarts", "qt",
    "dash", "dashes",
    "pinch", "pinches",
  ],
  count: [
    "piece", "pieces", "pc", "pcs", "unit", "units", "item", "items",
    "pack", "packs", "packet", "packets", "bottle", "bottles", "box", "boxes",
    "can", "cans", "tin", "tins", "jar", "jars", "tub", "tubs",
    "loaf", "loaves", "carton", "cartons", "head", "heads", "bunch", "bunches",
    "bar", "bars", "bag", "bags", "pouch", "pouches", "container", "containers",
  ],
} as const;

export function getUnitCategory(unit: string): UnitCategory {
  const u = unit.toLowerCase().trim();
  if (UNIT_ALIASES.weight.includes(u as (typeof UNIT_ALIASES.weight)[number])) {
    return "weight";
  }
  if (UNIT_ALIASES.volume.includes(u as (typeof UNIT_ALIASES.volume)[number])) {
    return "volume";
  }
  if (
    UNIT_ALIASES.count.includes(u as (typeof UNIT_ALIASES.count)[number])
  ) {
    return "count";
  }
  return "incompatible";
}

/**
 * Normalizes a quantity to its respective base unit:
 * - Weight: grams (g)
 * - Volume: milliliters (ml)
 * - Count: pieces / units
 */
export function normalizeQuantity(
  quantity: number,
  unit: string
): { normalizedValue: number; category: UnitCategory } {
  const u = unit.toLowerCase().trim();
  const cat = getUnitCategory(u);

  if (cat === "weight") {
    if (u === "mg") return { normalizedValue: quantity / 1000, category: cat };
    if (["g", "gm", "gram", "grams"].includes(u)) return { normalizedValue: quantity, category: cat };
    if (["kg", "kilogram", "kilograms"].includes(u)) return { normalizedValue: quantity * 1000, category: cat };
    if (["tonne", "tonnes", "t"].includes(u)) return { normalizedValue: quantity * 1000000, category: cat };
    if (["oz", "ounce", "ounces"].includes(u)) return { normalizedValue: quantity * 28.3495, category: cat };
    if (["lb", "lbs", "pound", "pounds"].includes(u)) return { normalizedValue: quantity * 453.592, category: cat };
  }

  if (cat === "volume") {
    if (["ml", "millilitre", "millilitres", "milliliter", "milliliters"].includes(u)) return { normalizedValue: quantity, category: cat };
    if (["l", "litre", "litres", "liter", "liters"].includes(u)) return { normalizedValue: quantity * 1000, category: cat };
    if (u === "cl") return { normalizedValue: quantity * 10, category: cat };
    if (["gallon", "gallons", "gal"].includes(u)) return { normalizedValue: quantity * 3785.41, category: cat };
    if (["fl oz", "fluid ounce", "fluid ounces"].includes(u)) return { normalizedValue: quantity * 29.5735, category: cat };
    if (["tsp", "tsps", "teaspoon", "teaspoons"].includes(u)) return { normalizedValue: quantity * 5, category: cat };
    if (["tbsp", "tbsps", "tablespoon", "tablespoons", "tbs"].includes(u)) return { normalizedValue: quantity * 15, category: cat };
    if (["dstsp", "dessertspoon", "dessertspoons"].includes(u)) return { normalizedValue: quantity * 10, category: cat };
    if (["cup", "cups"].includes(u)) return { normalizedValue: quantity * 240, category: cat };
    if (["pint", "pints", "pt"].includes(u)) return { normalizedValue: quantity * 473.176, category: cat };
    if (["quart", "quarts", "qt"].includes(u)) return { normalizedValue: quantity * 946.353, category: cat };
    if (["dash", "dashes"].includes(u)) return { normalizedValue: quantity * 0.6, category: cat };
    if (["pinch", "pinches"].includes(u)) return { normalizedValue: quantity * 0.3, category: cat };
  }

  if (cat === "count") {
    return { normalizedValue: quantity, category: cat };
  }

  // Fallback for incompatible or unrecognized units
  return { normalizedValue: quantity, category: "incompatible" };
}

/**
 * Normalizes a count unit string to compare compatibility (e.g. bottles -> bottle, boxes -> box).
 */
export function normalizeCountUnit(unit: string): string {
  const u = unit.toLowerCase().trim();
  if (u === "loaves" || u === "loaf") return "loaf";
  if (u.endsWith("boxes") || u === "box") return "box";
  if (u.endsWith("bunches") || u === "bunch") return "bunch";
  if (u.endsWith("batches") || u === "batch") return "batch";
  if (u.endsWith("pouches") || u === "pouch") return "pouch";
  return u.replace(/s$/, "");
}

/**
 * Determines whether two count units can be interchanged / merged.
 */
export function areCountUnitsCompatible(fromUnit: string, toUnit: string): boolean {
  const f = fromUnit.toLowerCase().trim();
  const t = toUnit.toLowerCase().trim();
  if (f === t) return true;

  const normF = normalizeCountUnit(f);
  const normT = normalizeCountUnit(t);
  if (normF === normT) {
    return true;
  }

  const genericCounts = ["piece", "pieces", "pc", "pcs", "unit", "units", "item", "items"];
  if (genericCounts.includes(f) && genericCounts.includes(t)) {
    return true;
  }

  return false;
}

/**
 * Converts a quantity from one unit to another if they belong to the same compatible category.
 * Returns null if the units belong to incompatible categories or cannot be safely converted.
 */
export function convertQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const f = fromUnit.toLowerCase().trim();
  const t = toUnit.toLowerCase().trim();
  if (f === t) return quantity;

  const normFrom = normalizeQuantity(quantity, f);
  const targetCat = getUnitCategory(t);

  if (
    normFrom.category === "incompatible" ||
    targetCat === "incompatible" ||
    normFrom.category !== targetCat
  ) {
    return null;
  }

  if (normFrom.category === "weight") {
    const grams = normFrom.normalizedValue;
    if (["g", "gm", "gram", "grams"].includes(t)) return grams;
    if (["kg", "kilogram", "kilograms"].includes(t)) return grams / 1000;
    if (t === "mg") return grams * 1000;
    if (["tonne", "tonnes", "t"].includes(t)) return grams / 1000000;
    if (["oz", "ounce", "ounces"].includes(t)) return grams / 28.3495;
    if (["lb", "lbs", "pound", "pounds"].includes(t)) return grams / 453.592;
    return null;
  }

  if (normFrom.category === "volume") {
    const ml = normFrom.normalizedValue;
    if (["ml", "millilitre", "millilitres", "milliliter", "milliliters"].includes(t)) return ml;
    if (["l", "litre", "litres", "liter", "liters"].includes(t)) return ml / 1000;
    if (t === "cl") return ml / 10;
    if (["gallon", "gallons", "gal"].includes(t)) return ml / 3785.41;
    if (["fl oz", "fluid ounce", "fluid ounces"].includes(t)) return ml / 29.5735;
    if (["tsp", "tsps", "teaspoon", "teaspoons"].includes(t)) return ml / 5;
    if (["tbsp", "tbsps", "tablespoon", "tablespoons", "tbs"].includes(t)) return ml / 15;
    if (["dstsp", "dessertspoon", "dessertspoons"].includes(t)) return ml / 10;
    if (["cup", "cups"].includes(t)) return ml / 240;
    if (["pint", "pints", "pt"].includes(t)) return ml / 473.176;
    if (["quart", "quarts", "qt"].includes(t)) return ml / 946.353;
    if (["dash", "dashes"].includes(t)) return ml / 0.6;
    if (["pinch", "pinches"].includes(t)) return ml / 0.3;
    return null;
  }

  if (normFrom.category === "count") {
    if (areCountUnitsCompatible(f, t)) {
      return quantity;
    }
    return null;
  }

  return null;
}

/**
 * Compares two quantities.
 * Returns:
 * - < 0 if item A is less than item B
 * - > 0 if item A is greater than item B
 * - 0 if they are equal
 * - null if they cannot be compared (incompatible unit categories)
 */
export function compareQuantities(
  qtyA: number,
  unitA: string,
  qtyB: number,
  unitB: string
): number | null {
  const normA = normalizeQuantity(qtyA, unitA);
  const normB = normalizeQuantity(qtyB, unitB);

  if (
    normA.category === "incompatible" ||
    normB.category === "incompatible" ||
    normA.category !== normB.category
  ) {
    return null; // Incompatible categories
  }

  return normA.normalizedValue - normB.normalizedValue;
}

/**
 * Centralized low-stock checks using unit-aware normalization.
 * Conservative defaults:
 * - Weight: <= 200g (e.g. 0.2kg)
 * - Volume: <= 250ml (e.g. 0.25L)
 * - Count/Incompatible: <= 2 items
 */
export function isLowStock(quantity: number, unit: string): boolean {
  const { normalizedValue, category } = normalizeQuantity(quantity, unit);
  
  if (category === "weight") {
    return normalizedValue <= 200;
  }
  if (category === "volume") {
    return normalizedValue <= 250;
  }
  
  if (category === "count") {
    return normalizedValue <= 2;
  }

  return false;
}

/**
 * Determines whether a unit is strictly an integer/count unit (e.g. pieces, units, cans, bottles).
 * Weight and volume units allow fractional / decimal amounts.
 */
export function isIntegerUnit(unit: string): boolean {
  const cat = getUnitCategory(unit);
  return cat === "count";
}

/**
 * Parses a recipe quantity string (e.g. "200 ml", "0.2 L", "250 g", "1/2 cup", "3 pieces", "1 1/2 tsp")
 * into a numeric quantity and unit string.
 */
export function parseRecipeQuantityAndUnit(text: string): { quantity: number; unit: string } | null {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();

  // Mixed fraction e.g. "1 1/2 cups"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]);
    const num = parseFloat(mixedMatch[2]);
    const den = parseFloat(mixedMatch[3]);
    if (den !== 0) {
      return {
        quantity: whole + num / den,
        unit: mixedMatch[4].trim(),
      };
    }
  }

  // Simple fraction e.g. "1/2 cup", "3/4 tsp"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    if (den !== 0) {
      return {
        quantity: num / den,
        unit: fractionMatch[3].trim(),
      };
    }
  }

  // Standard numeric e.g. "200 ml", "0.25 kg", "2.5", "100g"
  const standardMatch = trimmed.match(/^([\d\.]+)\s*(.*)$/);
  if (standardMatch) {
    const qty = parseFloat(standardMatch[1]);
    if (!isNaN(qty) && Number.isFinite(qty)) {
      return {
        quantity: qty,
        unit: standardMatch[2].trim(),
      };
    }
  }

  return null;
}

/**
 * Checks whether a unit is a culinary volume measurement (e.g. tsp, tbsp, cup, pinch, dash).
 */
export function isCulinaryVolumeUnit(unit: string): boolean {
  const u = unit.toLowerCase().trim();
  const culinaryUnits = [
    "tsp", "tsps", "teaspoon", "teaspoons",
    "tbsp", "tbsps", "tablespoon", "tablespoons", "tbs",
    "dstsp", "dessertspoon", "dessertspoons",
    "cup", "cups",
    "dash", "dashes",
    "pinch", "pinches",
  ];
  return culinaryUnits.includes(u);
}

/**
 * Returns the normalized ml equivalent string for a culinary measurement.
 * Example: 2, "tbsp" -> "≈30 ml"
 * Example: 1, "tsp" -> "≈5 ml"
 * Example: 1, "cup" -> "≈240 ml"
 */
export function getCulinaryVolumeEquivalent(quantity: number, unit: string): string | null {
  if (!isCulinaryVolumeUnit(unit)) return null;
  const ml = convertQuantity(quantity, unit, "ml");
  if (ml === null || !Number.isFinite(ml) || ml <= 0) return null;
  const cleanMl = Math.round(ml * 100) / 100;
  return `≈${cleanMl} ml`;
}

export type CulinaryProductContext = {
  name?: string;
  category?: string;
};

export type CulinaryConversionResult = {
  value: number;
  isEstimated: boolean;
};

/**
 * Determines an approximate culinary weight-to-volume ratio (g/ml)
 * based on intuitive culinary product classification without scientific terminology.
 * Standard culinary kitchen baselines:
 * - Syrups / Honey / Molasses: ~1.4 g/ml (1 tbsp ≈ 21 g)
 * - Heavy Pastes / Nut Butters / Spreads: ~1.15 g/ml (1 tbsp ≈ 17 g)
 * - Oils and fats: ~0.92 g/ml (1 tbsp ≈ 14 g)
 * - Flours and light powders: ~0.55 g/ml (1 tbsp ≈ 8 g, 1 cup ≈ 130 g)
 * - Sugars: ~0.85 g/ml (1 tbsp ≈ 13 g, 1 cup ≈ 200 g)
 * - Condiments, Sauces, Chutneys, Dairy, Liquids, General food: 1.0 g/ml (1 tbsp ≈ 15 g)
 */
export function getCulinaryVolumeToWeightRatio(context?: CulinaryProductContext): number {
  if (!context) return 1.0;
  const name = (context.name || "").toLowerCase();
  const category = (context.category || "").toLowerCase();

  // Dense Syrups, Honey, Molasses (~1.4 g/ml)
  if (
    name.includes("honey") ||
    name.includes("molasses") ||
    name.includes("syrup") ||
    name.includes("agave") ||
    name.includes("condensed milk")
  ) {
    return 1.4;
  }

  // Heavy Pastes, Nut Butters, Spreads (~1.15 g/ml)
  if (
    name.includes("peanut butter") ||
    name.includes("almond butter") ||
    name.includes("tahini") ||
    name.includes("nutella") ||
    name.includes("tomato paste") ||
    name.includes("paste") ||
    name.includes("mayo") ||
    name.includes("mayonnaise")
  ) {
    return 1.15;
  }

  // Oils and liquid fats (~0.92 g/ml)
  if (
    name.includes("oil") ||
    name.includes("ghee") ||
    name.includes("butter") ||
    category.includes("oil") ||
    category.includes("fat")
  ) {
    return 0.92;
  }

  // Flours and light powders (~0.55 g/ml)
  if (
    name.includes("flour") ||
    name.includes("cocoa") ||
    name.includes("starch") ||
    name.includes("baking powder") ||
    name.includes("baking soda") ||
    name.includes("cornstarch")
  ) {
    return 0.55;
  }

  // Sugars (~0.85 g/ml)
  if (name.includes("sugar")) {
    return 0.85;
  }

  // Baseline standard for sauces, chutneys, condiments, liquids, dairy, general food:
  // 1 ml = 1 g (1 tbsp = 15 g, 1 tsp = 5 g, 1 cup = 240 g)
  return 1.0;
}

/**
 * Intelligent culinary unit conversion.
 * - If units are in the same category (volume<->volume, weight<->weight, count<->count),
 *   delegates to exact convertQuantity (isEstimated: false).
 * - If converting between volume and weight, uses product/ingredient context
 *   to determine an appropriate culinary equivalent (isEstimated: true).
 * - Returns null if units are genuinely incompatible (e.g. pieces vs weight/volume).
 */
export function convertCulinaryQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  context?: CulinaryProductContext
): CulinaryConversionResult | null {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  const f = fromUnit.toLowerCase().trim();
  const t = toUnit.toLowerCase().trim();
  if (f === t) {
    return { value: quantity, isEstimated: false };
  }

  // 1. Check exact same-category conversion first
  const exact = convertQuantity(quantity, f, t);
  if (exact !== null) {
    return { value: exact, isEstimated: false };
  }

  const catFrom = getUnitCategory(f);
  const catTo = getUnitCategory(t);

  // 2. Volume to Weight
  if (catFrom === "volume" && catTo === "weight") {
    const ml = convertQuantity(quantity, f, "ml");
    if (ml === null) return null;
    const ratio = getCulinaryVolumeToWeightRatio(context);
    const grams = ml * ratio;
    const targetVal = convertQuantity(grams, "g", t);
    if (targetVal === null) return null;
    return { value: targetVal, isEstimated: true };
  }

  // 3. Weight to Volume
  if (catFrom === "weight" && catTo === "volume") {
    const grams = convertQuantity(quantity, f, "g");
    if (grams === null) return null;
    const ratio = getCulinaryVolumeToWeightRatio(context);
    const ml = grams / ratio;
    const targetVal = convertQuantity(ml, "ml", t);
    if (targetVal === null) return null;
    return { value: targetVal, isEstimated: true };
  }

  // Incompatible (e.g. count vs weight/volume)
  return null;
}

/**
 * Generates user-friendly approximate equivalent string for culinary displays.
 * Example: 1, "tbsp", "g", { name: "Schezwan Chutney" } -> "≈15 g"
 * Example: 1, "tbsp", "L", { name: "Olive Oil" } -> "≈15 ml"
 */
export function getCulinaryEquivalentDisplay(
  quantity: number,
  fromUnit: string,
  targetPantryUnit: string,
  context?: CulinaryProductContext
): string | null {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  const f = fromUnit.toLowerCase().trim();
  const t = targetPantryUnit.toLowerCase().trim();

  // If already the exact same unit, no secondary equivalent needed
  if (f === t) return null;

  const conv = convertCulinaryQuantity(quantity, f, t, context);
  if (!conv) {
    // If culinary conversion to pantry unit is not possible, but fromUnit is a volume unit,
    // fallback to standard ml volume equivalent if pantry isn't volume
    if (isCulinaryVolumeUnit(f)) {
      return getCulinaryVolumeEquivalent(quantity, f);
    }
    return null;
  }

  // If both are volume units (e.g. tbsp and L), display as ml equivalent for user clarity (e.g. "≈15 ml")
  if (getUnitCategory(f) === "volume" && getUnitCategory(t) === "volume") {
    return getCulinaryVolumeEquivalent(quantity, f);
  }

  // Otherwise, display equivalent in target pantry unit (e.g. "≈15 g")
  const rounded = conv.value >= 10 ? Math.round(conv.value) : Math.round(conv.value * 10) / 10;
  return `≈${rounded} ${targetPantryUnit}`;
}
