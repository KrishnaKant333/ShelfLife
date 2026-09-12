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
