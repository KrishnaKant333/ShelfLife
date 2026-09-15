"use server";
import { auth } from "@/auth";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/prisma/db";
import { getInventoryStatus } from "@/lib/inventory-status";

const optionalExpiryDate = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z.coerce.date().nullable(),
);

import { redirect } from "next/navigation";
import { planInventoryMerge } from "@/lib/inventory-merge";
import {
  parseItemImageUrls,
  safeDeleteUnreferencedImages,
} from "@/lib/storage-lifecycle";

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
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .string()
    .trim()
    .max(1000, "Image URL is too long.")
    .optional()
    .or(z.literal("")),
  additionalImageUrls: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
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
      imageUrl: result.data.imageUrl || null,
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
    ...itemsToCreate.map((item) =>
      db.orm.public.InventoryItem.create({
        userId: session.userId,
        businessId: session.businessId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        expiryType: item.expiryType,
      })
    ),
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