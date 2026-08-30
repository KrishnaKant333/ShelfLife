export type UnitCategory = "weight" | "volume" | "count" | "incompatible";

export function getUnitCategory(unit: string): UnitCategory {
  const u = unit.toLowerCase().trim();
  if (["mg", "g", "gm", "gram", "grams", "kg", "tonne"].includes(u)) {
    return "weight";
  }
  if (["ml", "l", "litre", "liter", "litres", "cl"].includes(u)) {
    return "volume";
  }
  if (
    [
      "piece",
      "pieces",
      "unit",
      "units",
      "pack",
      "packs",
      "bottle",
      "bottles",
      "box",
      "boxes",
      "can",
      "cans",
    ].includes(u)
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
    if (u === "kg") return { normalizedValue: quantity * 1000, category: cat };
    if (u === "tonne") return { normalizedValue: quantity * 1000000, category: cat };
  }

  if (cat === "volume") {
    if (u === "ml") return { normalizedValue: quantity, category: cat };
    if (["l", "litre", "liter", "litres"].includes(u)) return { normalizedValue: quantity * 1000, category: cat };
    if (u === "cl") return { normalizedValue: quantity * 10, category: cat };
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
  
  // Default for count/unrecognized units
  return quantity <= 2;
}
