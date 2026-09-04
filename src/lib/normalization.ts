export type UnitCategory = "weight" | "volume" | "count" | "incompatible";

const UNIT_ALIASES = {
  weight: ["mg", "g", "gm", "gram", "grams", "kg", "kilogram", "kilograms", "tonne", "tonnes", "t", "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds"],
  volume: ["ml", "millilitre", "millilitres", "milliliter", "milliliters", "l", "litre", "litres", "liter", "liters", "cl", "gallon", "gallons", "gal", "fl oz"],
  count: ["piece", "pieces", "pc", "pcs", "unit", "units", "pack", "packs", "packet", "packets", "bottle", "bottles", "box", "boxes", "can", "cans", "jar", "jars"],
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
    if (u === "fl oz") return { normalizedValue: quantity * 29.5735, category: cat };
  }

  if (cat === "count") {
    return { normalizedValue: quantity, category: cat };
  }

  // Fallback for incompatible or unrecognized units
  return { normalizedValue: quantity, category: "incompatible" };
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
