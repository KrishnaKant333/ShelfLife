"use server";
import { auth } from "@/auth";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/prisma/db";
import { getInventoryStatus } from "@/lib/inventory-status";
import { parseFlexibleDate, normalizeQuantity, isIntegerUnit } from "@/lib/normalization";

const optionalExpiryDate = z.preprocess(
  (value) => parseFlexibleDate(value),
  z.date({ message: "Please enter a valid expiry date" }).nullable(),
);

import { redirect } from "next/navigation";
import { planInventoryMerge } from "@/lib/inventory-merge";
import {
  parseItemImageUrls,
  safeDeleteUnreferencedImages,
} from "@/lib/storage-lifecycle";
import { fetchOpenFoodFactsImage } from "@/lib/openfoodfacts";

const inventorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name is too long"),

  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category is too long"),

  quantity: z.coerce
    .number()
    .finite("Quantity must be a valid number")
    .positive("Quantity must be greater than 0"),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(30, "Unit is too long"),

  expiryDate: optionalExpiryDate,
  expiryType: z
    .string()
    .trim()
    .nullish(),
  imageUrl: z
    .string()
    .trim()
    .max(1000, "Image URL is too long.")
    .nullish(),
  additionalImageUrls: z
    .string()
    .trim()
    .nullish(),
});

async function getCurrentUserSession() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    userId: Number(session.user.id),
    accountType: session.user.accountType,
    businessId: session.user.businessId ? Number(session.user.businessId) : null,
  };
}

/**
 * Tier 5: Queries user's prior inventory items for an authentic photo of the same product.
 */
export async function findHistoricalProductImage(
  userId: number,
  productName: string
): Promise<string | null> {
  try {
    const target = productName.trim().toLowerCase();
    const items = await db.orm.public.InventoryItem.where({ userId }).all();
    const match = items.find(
      (item) => Boolean(item.imageUrl) && item.name.trim().toLowerCase() === target
    );
    return match?.imageUrl ?? null;
  } catch {
    return null;
  }
}

/**
 * Client-callable action to look up an authentic product image via Tier 5 (History) or Tier 4 (Open Food Facts).
 */
export async function lookupProductImageAction(
  productName: string,
  category?: string
): Promise<{ imageUrl: string | null; tier: "pantry_history" | "openfoodfacts" | "none" }> {
  const session = await getCurrentUserSession();
  const trimmed = productName.trim();
  if (!trimmed) return { imageUrl: null, tier: "none" };

  if (session?.userId) {
    const hist = await findHistoricalProductImage(session.userId, trimmed);
    if (hist) return { imageUrl: hist, tier: "pantry_history" };
  }

  const off = await fetchOpenFoodFactsImage(trimmed, category);
  if (off?.imageUrl) {
    return { imageUrl: off.imageUrl, tier: "openfoodfacts" };
  }

  return { imageUrl: null, tier: "none" };
}

export type CreateInventoryState = {
  error?: string;
};

export async function createInventoryItem(
  _previousState: CreateInventoryState,
  formData: FormData
): Promise<CreateInventoryState> {
  const rawImageUrl = formData.get("imageUrl") as string | null;
  const rawAdditionalImageUrls = formData.get("additionalImageUrls") as string | null;

  const result = inventorySchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    expiryDate: formData.get("expiryDate"),
    expiryType: formData.get("expiryType"),
    imageUrl: rawImageUrl,
    additionalImageUrls: rawAdditionalImageUrls,
  });

  if (!result.success) {
    // If validation fails, clean up any unreferenced uploaded images in this form payload
    const formUrls = parseItemImageUrls({
      imageUrl: rawImageUrl,
      additionalImageUrls: rawAdditionalImageUrls,
    });
    if (formUrls.length > 0) {
      await safeDeleteUnreferencedImages(formUrls, []);
    }
    return {
      error: result.error.issues[0]?.message ?? "Invalid product data.",
    };
  }

  const session = await getCurrentUserSession();

  if (!session) {
    const formUrls = parseItemImageUrls({
      imageUrl: result.data.imageUrl,
      additionalImageUrls: result.data.additionalImageUrls,
    });
    if (formUrls.length > 0) {
      await safeDeleteUnreferencedImages(formUrls, []);
    }
    return {
      error: "You must be logged in to manage inventory.",
    };
  }

  const determinedExpiryType = result.data.expiryDate
    ? (result.data.expiryType || "MANUFACTURER_EXPIRY")
    : "UNKNOWN";

  // 6-Tier Image Cascade:
  // If no direct photo (Tier 1/2/3) was provided, check Tier 5 (Historical match), then Tier 4 (Open Food Facts)
  let resolvedImageUrl = result.data.imageUrl || null;
  if (!resolvedImageUrl) {
    const historicalUrl = await findHistoricalProductImage(session.userId, result.data.name);
    if (historicalUrl) {
      resolvedImageUrl = historicalUrl;
    } else {
      const offMatch = await fetchOpenFoodFactsImage(result.data.name, result.data.category);
      if (offMatch?.imageUrl) {
        resolvedImageUrl = offMatch.imageUrl;
      }
    }
  }

  try {
    await db.orm.public.InventoryItem.create({
      userId: session.userId,
      businessId: session.businessId,
      name: result.data.name,
      category: result.data.category,
      quantity: result.data.quantity,
      unit: result.data.unit,
      expiryDate: result.data.expiryDate?.toISOString() ?? null,
      expiryType: determinedExpiryType,
      imageUrl: resolvedImageUrl,
      additionalImageUrls: result.data.additionalImageUrls || null,
    });
  } catch (createError) {
    // Clean up uploaded images if DB insertion fails
    const formUrls = parseItemImageUrls({
      imageUrl: result.data.imageUrl,
      additionalImageUrls: result.data.additionalImageUrls,
    });
    if (formUrls.length > 0) {
      await safeDeleteUnreferencedImages(formUrls, []);
    }
    throw createError;
  }

  if (session.accountType === "business") {
    revalidatePath("/business/dashboard");
    revalidatePath("/business/dashboard/inventory");
    redirect("/business/dashboard/inventory");
  } else {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/alerts");
    revalidatePath("/dashboard/analytics");
    redirect("/dashboard/inventory");
  }
}

export async function updateInventoryItem(
  id: number,
  _previousState: CreateInventoryState,
  formData: FormData
): Promise<CreateInventoryState> {
  const result = inventorySchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    expiryDate: formData.get("expiryDate"),
    imageUrl: formData.get("imageUrl"),
    additionalImageUrls: formData.get("additionalImageUrls"),
  });

  if (!result.success) {
    return {
      error:
        result.error.issues[0]?.message ??
        "Invalid product data.",
    };
  }

  const session = await getCurrentUserSession();

  if (!session) {
    return {
      error: "You must be logged in to manage inventory.",
    };
  }

  const filter = session.accountType === "business"
    ? { id, businessId: session.businessId }
    : { id, userId: session.userId };

  const existingItem = await db.orm.public.InventoryItem.first(filter);
  const oldUrls = existingItem ? parseItemImageUrls(existingItem) : [];

  const rawExpiryType = formData.get("expiryType") as string | null;
  const determinedExpiryType = result.data.expiryDate
    ? (rawExpiryType || "MANUFACTURER_EXPIRY")
    : "UNKNOWN";

  const updateData: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    expiryType: string | null;
    imageUrl?: string | null;
    additionalImageUrls?: string | null;
  } = {
    name: result.data.name,
    category: result.data.category,
    quantity: result.data.quantity,
    unit: result.data.unit,
    expiryDate: result.data.expiryDate?.toISOString() ?? null,
    expiryType: determinedExpiryType,
  };

  // Only update image columns if explicitly provided in the form payload,
  // preventing accidental erasure of existing product imagery during text edits.
  if (formData.has("imageUrl")) {
    updateData.imageUrl = result.data.imageUrl || null;
  }
  if (formData.has("additionalImageUrls")) {
    updateData.additionalImageUrls = result.data.additionalImageUrls || null;
  }

  await db.orm.public.InventoryItem
    .where(filter)
    .update(updateData);

  // If images were updated, clean up any removed unreferenced images
  if (formData.has("imageUrl") || formData.has("additionalImageUrls")) {
    const updatedUrls = parseItemImageUrls({
      imageUrl: updateData.imageUrl !== undefined ? updateData.imageUrl : existingItem?.imageUrl,
      additionalImageUrls: updateData.additionalImageUrls !== undefined ? updateData.additionalImageUrls : existingItem?.additionalImageUrls,
    });
    const removedUrls = oldUrls.filter((u) => !updatedUrls.includes(u));
    if (removedUrls.length > 0) {
      await safeDeleteUnreferencedImages(removedUrls, [id]);
    }
  }

  if (session.accountType === "business") {
    revalidatePath("/business/dashboard");
    revalidatePath("/business/dashboard/inventory");
    redirect("/business/dashboard/inventory");
  } else {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/alerts");
    revalidatePath("/dashboard/analytics");
    redirect("/dashboard/inventory");
  }
}

export async function deleteInventoryItem(
  id: number
) {
  const session = await getCurrentUserSession();

  if (!session) {
    throw new Error("You must be logged in to manage inventory.");
  }

  const filter = session.accountType === "business"
    ? { id, businessId: session.businessId }
    : { id, userId: session.userId };

  const existingItem = await db.orm.public.InventoryItem.first(filter);
  const candidateUrls = existingItem ? parseItemImageUrls(existingItem) : [];

  // Database deletion is authoritative and runs first
  await db.orm.public.InventoryItem
    .where(filter)
    .delete();

  // Storage cleanup of unreferenced owned images follows
  if (candidateUrls.length > 0) {
    await safeDeleteUnreferencedImages(candidateUrls, [id]);
  }

  if (session.accountType === "business") {
    revalidatePath("/business/dashboard");
    revalidatePath("/business/dashboard/inventory");
  } else {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/alerts");
    revalidatePath("/dashboard/analytics");
  }
}

export async function importInventoryAction(
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: Date | null;
    expiryType?: string | null;
  }>
) {
  const session = await getCurrentUserSession();

  if (!session) {
    throw new Error("You must be logged in to import inventory.");
  }

  const filter =
    session.accountType === "business" && session.businessId
      ? { businessId: session.businessId }
      : { userId: session.userId };

  const existingInventory = await db.orm.public.InventoryItem.where(filter).all();

  const { itemsToUpdate, itemsToCreate } = planInventoryMerge(existingInventory, items);

  await Promise.all([
    ...itemsToUpdate.map((item) =>
      db.orm.public.InventoryItem
        .where({ id: item.id })
        .update({
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          expiryType: item.expiryType,
        })
    ),
    ...itemsToCreate.map((item) => {
      const histMatch = existingInventory.find(
        (e) => Boolean(e.imageUrl) && e.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );
      return db.orm.public.InventoryItem.create({
        userId: session.userId,
        businessId: session.businessId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        expiryType: item.expiryType,
        imageUrl: histMatch?.imageUrl ?? null,
      });
    }),
  ]);

  if (session.accountType === "business") {
    revalidatePath("/business/dashboard");
    revalidatePath("/business/dashboard/inventory");
  } else {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/alerts");
    revalidatePath("/dashboard/analytics");
  }

  return {
    success: true,
    count: items.length,
    mergedCount: itemsToUpdate.length,
    createdCount: itemsToCreate.length,
  };
}

export async function bulkDeleteAction(
  ids: number[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const candidateUrls: string[] = [];
    const deletedIds: number[] = [];

    // Verify ownership of every item and collect candidate URLs
    for (const id of ids) {
      const dbItem = await db.orm.public.InventoryItem.first({ id });
      if (!dbItem) continue;

      if (session.accountType === "business") {
        if (dbItem.businessId !== session.businessId) {
          return { success: false, error: "Unauthorized access to business product." };
        }
      } else {
        if (dbItem.userId !== session.userId) {
          return { success: false, error: "Unauthorized access to product." };
        }
      }

      candidateUrls.push(...parseItemImageUrls(dbItem));
      deletedIds.push(id);
      await db.orm.public.InventoryItem.where({ id }).delete();
    }

    // Storage cleanup of unreferenced owned images
    if (candidateUrls.length > 0) {
      await safeDeleteUnreferencedImages(candidateUrls, deletedIds);
    }

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
      revalidatePath("/dashboard/analytics");
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Bulk delete failed:", error);
    return { success: false, error: "Failed to delete selected items." };
  }
}

export async function discardExpiredItemsAction(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const filter = session.accountType === "business"
      ? { businessId: session.businessId }
      : { userId: session.userId };
    const items = await db.orm.public.InventoryItem.where(filter).all();
    const expiredItems = items.filter((item) =>
      getInventoryStatus(
        item.quantity,
        typeof item.expiryDate === "string"
          ? item.expiryDate
          : item.expiryDate
            ? new Date(item.expiryDate).toISOString()
            : null,
        item.unit,
      ) === "Expired"
    );
    const expiredIds = expiredItems.map((item) => item.id);
    const candidateUrls = expiredItems.flatMap(parseItemImageUrls);

    await Promise.all(
      expiredIds.map((id) =>
        (async () => {
          const item = items.find((candidate) => candidate.id === id);
          if (item) {
            await db.orm.public.InventoryActivity.create({
              userId: session.userId,
              businessId: session.accountType === "business" ? session.businessId : null,
              inventoryItemId: item.id,
              productName: item.name,
              action: "discarded_expired",
              quantity: item.quantity,
              unit: item.unit,
            });
          }
          await db.orm.public.InventoryItem.where({ id, ...filter }).delete();
        })(),
      ),
    );

    // Storage cleanup of unreferenced owned images
    if (candidateUrls.length > 0) {
      await safeDeleteUnreferencedImages(candidateUrls, expiredIds);
    }

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
      revalidatePath("/dashboard/analytics");
      revalidatePath("/dashboard/recipes");
    }

    return { success: true, count: expiredIds.length };
  } catch (error) {
    console.error("Discard expired items failed:", error);
    return { success: false, error: "Failed to discard expired items." };
  }
}

/**
 * Removes an auxiliary image from an existing inventory item.
 * Cleans up the image from storage if unreferenced by any other product.
 */
export async function removeAuxiliaryImageAction(
  itemId: number,
  imageUrlToRemove: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const filter =
      session.accountType === "business"
        ? { id: itemId, businessId: session.businessId }
        : { id: itemId, userId: session.userId };

    const item = await db.orm.public.InventoryItem.first(filter);
    if (!item) {
      return { success: false, error: "Product not found." };
    }

    const currentAux = parseItemImageUrls({ additionalImageUrls: item.additionalImageUrls });
    const targetUrl = imageUrlToRemove.trim();
    const updatedAux = currentAux.filter((u) => u !== targetUrl);

    await db.orm.public.InventoryItem.where(filter).update({
      additionalImageUrls: updatedAux.length > 0 ? JSON.stringify(updatedAux) : null,
    });

    // Clean up from storage if ShelfLife-owned and unreferenced
    await safeDeleteUnreferencedImages([targetUrl], [itemId]);

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to remove auxiliary image:", error);
    return { success: false, error: "Failed to remove image." };
  }
}

/**
 * Contextually restocks an inventory item, increasing quantity and logging an activity.
 * Supports optional commercial metadata for business accounts.
 */
export async function restockInventoryItemAction(
  itemId: number,
  amountToAdd: number,
  businessMeta?: {
    invoiceNumber?: string;
    batchLot?: string;
    unitCost?: number;
  }
): Promise<{ success: boolean; newQuantity?: number; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (!Number.isFinite(amountToAdd) || amountToAdd <= 0) {
      return { success: false, error: "Please enter a valid amount greater than zero." };
    }

    const filter =
      session.accountType === "business"
        ? { id: itemId, businessId: session.businessId }
        : { id: itemId, userId: session.userId };

    const item = await db.orm.public.InventoryItem.first(filter);
    if (!item) {
      return { success: false, error: "Product not found." };
    }

    const cleanAmount = isIntegerUnit(item.unit)
      ? Math.round(amountToAdd)
      : Math.round(amountToAdd * 10000) / 10000;

    const newQuantity = Math.round((item.quantity + cleanAmount) * 10000) / 10000;

    await db.orm.public.InventoryItem.where(filter).update({
      quantity: newQuantity,
    });

    await db.orm.public.InventoryActivity.create({
      userId: session.userId,
      businessId: session.accountType === "business" ? session.businessId : null,
      inventoryItemId: item.id,
      productName: item.name,
      action: "restocked",
      quantity: cleanAmount,
      unit: item.unit,
    });

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
      revalidatePath("/business/dashboard/analytics");
      revalidatePath("/business/dashboard/notifications");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
      revalidatePath("/dashboard/analytics");
      revalidatePath("/dashboard/notifications");
      revalidatePath("/dashboard/recipes");
    }

    return { success: true, newQuantity };
  } catch (error) {
    console.error("Restock failed:", error);
    return { success: false, error: "Failed to restock item." };
  }
}

/**
 * Instantly reassigns the product's category.
 */
export async function updateProductCategoryAction(
  itemId: number,
  newCategory: string
): Promise<{ success: boolean; category?: string; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const trimmed = newCategory.trim();
    if (!trimmed) {
      return { success: false, error: "Category cannot be empty." };
    }

    const filter =
      session.accountType === "business"
        ? { id: itemId, businessId: session.businessId }
        : { id: itemId, userId: session.userId };

    const item = await db.orm.public.InventoryItem.first(filter);
    if (!item) {
      return { success: false, error: "Product not found." };
    }

    await db.orm.public.InventoryItem.where(filter).update({
      category: trimmed,
    });

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
      revalidatePath("/dashboard/recipes");
    }

    return { success: true, category: trimmed };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category." };
  }
}

/**
 * Schedules an item-specific expiry reminder and logs it to the user's activity ledger.
 */
export async function setExpiryReminderAction(
  itemId: number,
  daysBefore: number,
  customDate?: string
): Promise<{ success: boolean; reminderDate?: string; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const filter =
      session.accountType === "business"
        ? { id: itemId, businessId: session.businessId }
        : { id: itemId, userId: session.userId };

    const item = await db.orm.public.InventoryItem.first(filter);
    if (!item) {
      return { success: false, error: "Product not found." };
    }

    let reminderDate: Date;
    if (customDate) {
      reminderDate = new Date(customDate + (customDate.includes("T") ? "" : "T00:00:00"));
    } else if (item.expiryDate) {
      const exp = new Date(item.expiryDate);
      reminderDate = new Date(exp.getTime() - daysBefore * 24 * 60 * 60 * 1000);
    } else {
      reminderDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    }

    if (Number.isNaN(reminderDate.getTime())) {
      reminderDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    // Reject reminder dates scheduled in the past
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (reminderDate < todayStart) {
      return {
        success: false,
        error: "Expiry reminder cannot be set for a date in the past. Please select a future date.",
      };
    }

    const formattedReminderDate = reminderDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    await db.orm.public.InventoryActivity.create({
      userId: session.userId,
      businessId: session.accountType === "business" ? session.businessId : null,
      inventoryItemId: item.id,
      productName: item.name,
      action: "reminder_set",
      quantity: daysBefore,
      unit: customDate ? `custom:${formattedReminderDate}` : "days_before",
    });

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard/notifications");
    } else {
      revalidatePath("/dashboard/notifications");
    }

    return { success: true, reminderDate: reminderDate.toISOString() };
  } catch (error) {
    console.error("Failed to set reminder:", error);
    return { success: false, error: "Failed to schedule reminder." };
  }
}

/**
 * Deletes an inventory item with reason attribution (consumed, waste, error)
 * and returns item snapshot for undo capability.
 */
export async function deleteInventoryItemWithReasonAction(
  itemId: number,
  reason: "consumed" | "waste" | "error"
): Promise<{
  success: boolean;
  deletedItem?: {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    expiryType?: string | null;
    imageUrl?: string | null;
    additionalImageUrls?: string | null;
  };
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const filter =
      session.accountType === "business"
        ? { id: itemId, businessId: session.businessId }
        : { id: itemId, userId: session.userId };

    const item = await db.orm.public.InventoryItem.first(filter);
    if (!item) {
      return { success: false, error: "Product not found." };
    }

    const deletedItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate
        ? typeof item.expiryDate === "string"
          ? item.expiryDate
          : new Date(item.expiryDate).toISOString()
        : null,
      expiryType: item.expiryType,
      imageUrl: item.imageUrl,
      additionalImageUrls: item.additionalImageUrls,
    };

    if (reason === "consumed") {
      await db.orm.public.InventoryConsumption.create({
        userId: session.userId,
        businessId: session.accountType === "business" ? session.businessId : null,
        inventoryItemId: item.id,
        productName: item.name,
        quantityUsed: item.quantity,
        unit: item.unit,
        normalizedQuantityUsed: normalizeQuantity(item.quantity, item.unit).normalizedValue,
      });

      await db.orm.public.InventoryActivity.create({
        userId: session.userId,
        businessId: session.accountType === "business" ? session.businessId : null,
        inventoryItemId: item.id,
        productName: item.name,
        action: "consumed",
        quantity: item.quantity,
        unit: item.unit,
      });
    } else if (reason === "waste") {
      await db.orm.public.InventoryActivity.create({
        userId: session.userId,
        businessId: session.accountType === "business" ? session.businessId : null,
        inventoryItemId: item.id,
        productName: item.name,
        action: "discarded_expired",
        quantity: item.quantity,
        unit: item.unit,
      });
    }

    // Delete DB record
    await db.orm.public.InventoryItem.where(filter).delete();

    // Storage cleanup of unreferenced owned images only on non-undoable permanent error deletion
    if (reason === "error") {
      const candidateUrls = parseItemImageUrls(item);
      if (candidateUrls.length > 0) {
        await safeDeleteUnreferencedImages(candidateUrls, [itemId]);
      }
    }

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
      revalidatePath("/business/dashboard/waste");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
      revalidatePath("/dashboard/analytics");
      revalidatePath("/dashboard/waste");
      revalidatePath("/dashboard/recipes");
    }

    return { success: true, deletedItem };
  } catch (error) {
    console.error("Delete with reason failed:", error);
    return { success: false, error: "Failed to remove product." };
  }
}

/**
 * Restores a previously removed inventory item (Undo action).
 */
export async function restoreInventoryItemAction(
  itemData: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    expiryType?: string | null;
    imageUrl?: string | null;
    additionalImageUrls?: string | null;
  }
): Promise<{ success: boolean; item?: any; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const created = await db.orm.public.InventoryItem.create({
      userId: session.userId,
      businessId: session.accountType === "business" ? session.businessId : null,
      name: itemData.name,
      category: itemData.category,
      quantity: itemData.quantity,
      unit: itemData.unit,
      expiryDate: itemData.expiryDate,
      expiryType: itemData.expiryType || null,
      imageUrl: itemData.imageUrl || null,
      additionalImageUrls: itemData.additionalImageUrls || null,
    });

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
    }

    return { success: true, item: created };
  } catch (error) {
    console.error("Restore failed:", error);
    return { success: false, error: "Failed to restore product." };
  }
}

/**
 * Deletes multiple inventory items with reason attribution (consumed, waste, error)
 * and returns item snapshots for undo capability.
 */
export async function bulkDeleteWithReasonAction(
  ids: number[],
  reason: "consumed" | "waste" | "error"
): Promise<{
  success: boolean;
  count?: number;
  deletedItems?: Array<{
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    expiryType?: string | null;
    imageUrl?: string | null;
    additionalImageUrls?: string | null;
  }>;
  error?: string;
}> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const candidateUrls: string[] = [];
    const deletedIds: number[] = [];
    const deletedItems: any[] = [];

    for (const id of ids) {
      const dbItem = await db.orm.public.InventoryItem.first({ id });
      if (!dbItem) continue;

      if (session.accountType === "business") {
        if (dbItem.businessId !== session.businessId) continue;
      } else {
        if (dbItem.userId !== session.userId) continue;
      }

      deletedItems.push({
        id: dbItem.id,
        name: dbItem.name,
        category: dbItem.category,
        quantity: dbItem.quantity,
        unit: dbItem.unit,
        expiryDate: dbItem.expiryDate
          ? typeof dbItem.expiryDate === "string"
            ? dbItem.expiryDate
            : new Date(dbItem.expiryDate).toISOString()
          : null,
        expiryType: dbItem.expiryType,
        imageUrl: dbItem.imageUrl,
        additionalImageUrls: dbItem.additionalImageUrls,
      });

      if (reason === "consumed") {
        await db.orm.public.InventoryConsumption.create({
          userId: session.userId,
          businessId: session.accountType === "business" ? session.businessId : null,
          inventoryItemId: dbItem.id,
          productName: dbItem.name,
          quantityUsed: dbItem.quantity,
          unit: dbItem.unit,
          normalizedQuantityUsed: normalizeQuantity(dbItem.quantity, dbItem.unit).normalizedValue,
        });

        await db.orm.public.InventoryActivity.create({
          userId: session.userId,
          businessId: session.accountType === "business" ? session.businessId : null,
          inventoryItemId: dbItem.id,
          productName: dbItem.name,
          action: "consumed",
          quantity: dbItem.quantity,
          unit: dbItem.unit,
        });
      } else if (reason === "waste") {
        await db.orm.public.InventoryActivity.create({
          userId: session.userId,
          businessId: session.accountType === "business" ? session.businessId : null,
          inventoryItemId: dbItem.id,
          productName: dbItem.name,
          action: "discarded_expired",
          quantity: dbItem.quantity,
          unit: dbItem.unit,
        });
      }

      candidateUrls.push(...parseItemImageUrls(dbItem));
      deletedIds.push(id);
      await db.orm.public.InventoryItem.where({ id }).delete();
    }

    if (candidateUrls.length > 0) {
      await safeDeleteUnreferencedImages(candidateUrls, deletedIds);
    }

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
      revalidatePath("/business/dashboard/waste");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
      revalidatePath("/dashboard/analytics");
      revalidatePath("/dashboard/waste");
      revalidatePath("/dashboard/recipes");
    }

    return { success: true, count: deletedIds.length, deletedItems };
  } catch (error) {
    console.error("Bulk delete with reason failed:", error);
    return { success: false, error: "Failed to delete selected items." };
  }
}

/**
 * Restores multiple previously removed inventory items (Undo action for bulk operations).
 */
export async function bulkRestoreInventoryItemsAction(
  itemsData: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    expiryType?: string | null;
    imageUrl?: string | null;
    additionalImageUrls?: string | null;
  }>
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    for (const item of itemsData) {
      await db.orm.public.InventoryItem.create({
        userId: session.userId,
        businessId: session.accountType === "business" ? session.businessId : null,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        expiryType: item.expiryType || null,
        imageUrl: item.imageUrl || null,
        additionalImageUrls: item.additionalImageUrls || null,
      });
    }

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
    }

    return { success: true, count: itemsData.length };
  } catch (error) {
    console.error("Bulk restore failed:", error);
    return { success: false, error: "Failed to restore products." };
  }
}