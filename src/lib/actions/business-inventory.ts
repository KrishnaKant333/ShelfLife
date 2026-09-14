"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/prisma/db";
import { InventoryImportItem } from "../import/inventory-schema";
import { planInventoryMerge } from "@/lib/inventory-merge";
import {
  parseItemImageUrls,
  safeDeleteUnreferencedImages,
} from "@/lib/storage-lifecycle";

const optionalExpiryDate = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z.coerce.date().nullable(),
);

const businessInventorySchema = z.object({
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

async function getBusinessUser() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.accountType !== "business" ||
    !session.user.businessId
  ) {
    return null;
  }

  return {
    userId: Number(session.user.id),
    businessId: Number(session.user.businessId),
  };
}

export type BusinessInventoryState = {
  error?: string;
};

export async function createBusinessInventoryItem(
  _previousState: BusinessInventoryState,
  formData: FormData,
): Promise<BusinessInventoryState> {
  const rawImageUrl = formData.get("imageUrl") as string | null;
  const rawAdditionalImageUrls = formData.get("additionalImageUrls") as string | null;

  const result = businessInventorySchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    expiryDate: formData.get("expiryDate"),
    imageUrl: rawImageUrl,
    additionalImageUrls: rawAdditionalImageUrls,
  });

  if (!result.success) {
    const formUrls = parseItemImageUrls({
      imageUrl: rawImageUrl,
      additionalImageUrls: rawAdditionalImageUrls,
    });
    if (formUrls.length > 0) {
      await safeDeleteUnreferencedImages(formUrls, []);
    }
    return {
      error:
        result.error.issues[0]?.message ??
        "Invalid product data.",
    };
  }

  const business = await getBusinessUser();

  if (!business) {
    const formUrls = parseItemImageUrls({
      imageUrl: result.data.imageUrl,
      additionalImageUrls: result.data.additionalImageUrls,
    });
    if (formUrls.length > 0) {
      await safeDeleteUnreferencedImages(formUrls, []);
    }
    return {
      error:
        "You must be logged in to a business account.",
    };
  }

  try {
    await db.orm.public.InventoryItem.create({
      userId: business.userId,
      businessId: business.businessId,
      name: result.data.name,
      category: result.data.category,
      quantity: result.data.quantity,
      unit: result.data.unit,
      expiryDate: result.data.expiryDate?.toISOString() ?? null,
      imageUrl: result.data.imageUrl || null,
      additionalImageUrls: result.data.additionalImageUrls || null,
    });
  } catch (createError) {
    const formUrls = parseItemImageUrls({
      imageUrl: result.data.imageUrl,
      additionalImageUrls: result.data.additionalImageUrls,
    });
    if (formUrls.length > 0) {
      await safeDeleteUnreferencedImages(formUrls, []);
    }
    throw createError;
  }

  revalidatePath("/business/dashboard");
  revalidatePath("/business/dashboard/inventory");

  redirect("/business/dashboard/inventory");
}

export async function updateBusinessInventoryItem(
  id: number,
  _previousState: BusinessInventoryState,
  formData: FormData,
): Promise<BusinessInventoryState> {
  const result = businessInventorySchema.safeParse({
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

  const business = await getBusinessUser();

  if (!business) {
    return {
      error:
        "You must be logged in to a business account.",
    };
  }

  const filter = { id, businessId: business.businessId };
  const existingItem = await db.orm.public.InventoryItem.first(filter);
  const oldUrls = existingItem ? parseItemImageUrls(existingItem) : [];

  const updateData: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    imageUrl?: string | null;
    additionalImageUrls?: string | null;
  } = {
    name: result.data.name,
    category: result.data.category,
    quantity: result.data.quantity,
    unit: result.data.unit,
    expiryDate: result.data.expiryDate?.toISOString() ?? null,
  };

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

  revalidatePath("/business/dashboard");
  revalidatePath("/business/dashboard/inventory");

  redirect("/business/dashboard/inventory");
}

export async function deleteBusinessInventoryItem(
  id: number,
) {
  const business = await getBusinessUser();

  if (!business) {
    throw new Error(
      "You must be logged in to a business account.",
    );
  }

  const filter = {
    id,
    businessId: business.businessId,
  };

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

  revalidatePath("/business/dashboard");
  revalidatePath("/business/dashboard/inventory");
}

export async function importBusinessInventory(
  items: InventoryImportItem[],
) {
  const business = await getBusinessUser();

  if (!business) {
    throw new Error(
      "You must be logged in to a business account.",
    );
  }

  if (items.length === 0) {
    throw new Error("No inventory items to import.");
  }

  const existingInventory = await db.orm.public.InventoryItem
    .where({ businessId: business.businessId })
    .all();

  const { itemsToUpdate, itemsToCreate } = planInventoryMerge(existingInventory, items);

  await Promise.all([
    ...itemsToUpdate.map((item) =>
      db.orm.public.InventoryItem
        .where({ id: item.id })
        .update({
          quantity: item.quantity,
          expiryDate: item.expiryDate,
        })
    ),
    ...itemsToCreate.map((item) =>
      db.orm.public.InventoryItem.create({
        userId: business.userId,
        businessId: business.businessId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
      })
    ),
  ]);

  revalidatePath("/business/dashboard");
  revalidatePath("/business/dashboard/inventory");

  return {
    success: true,
    count: items.length,
    mergedCount: itemsToUpdate.length,
    createdCount: itemsToCreate.length,
  };
}