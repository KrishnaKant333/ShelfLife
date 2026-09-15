import { convertQuantity } from "@/lib/normalization";

export type BaseExistingItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | Date | null;
  expiryType?: string | null;
};

export type BaseIncomingItem = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: Date | string | null;
  expiryType?: string | null;
};

/**
 * Deterministic product name normalization.
 * Collapses whitespace, trims, and converts to lowercase.
 * Examples:
 * "Whole Milk" -> "whole milk"
 * "WHOLE MILK" -> "whole milk"
 * "Whole  Milk" -> "whole milk"
 */
export function normalizeProductName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Resolves expiry date and type between an existing record and incoming item.
 * Preserves existing expiry if incoming has none, adopts incoming if existing has none,
 * and picks the earlier date (FIFO food-safety principle) if both are present.
 */
export function resolveMergedExpiry(
  existingExpiry: string | Date | null | undefined,
  existingType: string | null | undefined,
  incomingExpiry: string | Date | null | undefined,
  incomingType: string | null | undefined
): { expiryDate: string | null; expiryType: string | null } {
  const parseDate = (d: string | Date | null | undefined): Date | null => {
    if (!d) return null;
    const date = typeof d === "string" ? new Date(d) : d;
    return isNaN(date.getTime()) ? null : date;
  };

  const existing = parseDate(existingExpiry);
  const incoming = parseDate(incomingExpiry);

  if (!existing && !incoming) {
    return { expiryDate: null, expiryType: existingType || incomingType || "UNKNOWN" };
  }
  if (!existing && incoming) {
    return { expiryDate: incoming.toISOString(), expiryType: incomingType || "MANUFACTURER_EXPIRY" };
  }
  if (existing && !incoming) {
    return { expiryDate: existing.toISOString(), expiryType: existingType || "MANUFACTURER_EXPIRY" };
  }

  // Both exist: choose the earlier expiry date (safest for inventory/consumption)
  if (existing!.getTime() <= incoming!.getTime()) {
    return { expiryDate: existing!.toISOString(), expiryType: existingType || "MANUFACTURER_EXPIRY" };
  } else {
    return { expiryDate: incoming!.toISOString(), expiryType: incomingType || "MANUFACTURER_EXPIRY" };
  }
}

export function resolveMergedExpiryDate(
  existingExpiry: string | Date | null | undefined,
  incomingExpiry: string | Date | null | undefined
): string | null {
  return resolveMergedExpiry(existingExpiry, null, incomingExpiry, null).expiryDate;
}

export type WorkingInventoryItem = {
  id: number | null;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  expiryType: string | null;
  isNew: boolean;
  dirty: boolean;
};

export type MergePlanResult = {
  itemsToUpdate: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    expiryType: string | null;
  }>;
  itemsToCreate: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    expiryType: string | null;
  }>;
  workingList: WorkingInventoryItem[];
};

/**
 * Computes deterministic merge plan for imported products against existing inventory.
 * - Matches by normalized product name and unit compatibility.
 * - Consolidates intra-invoice duplicates.
 * - Prevents duplicate record creation when compatible match exists.
 * - Leaves incompatible items or non-matching products to be created as new records.
 * - Never modifies historical duplicates that weren't targeted by the merge.
 */
export function planInventoryMerge(
  existingInventory: BaseExistingItem[],
  incomingItems: BaseIncomingItem[]
): MergePlanResult {
  const workingList: WorkingInventoryItem[] = existingInventory.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString() : null,
    expiryType: item.expiryType ?? (item.expiryDate ? "MANUFACTURER_EXPIRY" : "UNKNOWN"),
    isNew: false,
    dirty: false,
  }));

  for (const item of incomingItems) {
    const normName = normalizeProductName(item.name);
    if (!normName || item.quantity <= 0) continue;

    // Search working list for an existing compatible product
    const matchIndex = workingList.findIndex((candidate) => {
      if (normalizeProductName(candidate.name) !== normName) return false;
      const converted = convertQuantity(item.quantity, item.unit, candidate.unit);
      return converted !== null;
    });

    if (matchIndex !== -1) {
      const candidate = workingList[matchIndex];
      const converted = convertQuantity(item.quantity, item.unit, candidate.unit)!;
      // Add quantity without double-multiplying
      candidate.quantity = Math.round((candidate.quantity + converted) * 10000) / 10000;
      const mergedExpiry = resolveMergedExpiry(
        candidate.expiryDate,
        candidate.expiryType,
        item.expiryDate,
        item.expiryType
      );
      candidate.expiryDate = mergedExpiry.expiryDate;
      candidate.expiryType = mergedExpiry.expiryType;
      candidate.dirty = true;
    } else {
      // Create new working item
      workingList.push({
        id: null,
        name: item.name.trim(),
        category: item.category.trim(),
        quantity: item.quantity,
        unit: item.unit.trim(),
        expiryDate: item.expiryDate
          ? (typeof item.expiryDate === "string" ? new Date(item.expiryDate) : item.expiryDate).toISOString()
          : null,
        expiryType: item.expiryType ?? (item.expiryDate ? "MANUFACTURER_EXPIRY" : "UNKNOWN"),
        isNew: true,
        dirty: false,
      });
    }
  }

  const itemsToUpdate = workingList
    .filter((item) => !item.isNew && item.dirty && item.id !== null)
    .map((item) => ({
      id: item.id!,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      expiryType: item.expiryType,
    }));

  const itemsToCreate = workingList
    .filter((item) => item.isNew)
    .map((item) => ({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      expiryType: item.expiryType,
    }));

  return {
    itemsToUpdate,
    itemsToCreate,
    workingList,
  };
}
