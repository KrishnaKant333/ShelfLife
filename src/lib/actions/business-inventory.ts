"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/prisma/db";
import { InventoryImportItem } from "../import/inventory-schema";

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
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(30, "Unit is too long"),

  expiryDate: z.coerce.date(),
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
  const result = businessInventorySchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    expiryDate: formData.get("expiryDate"),
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

  await db.orm.public.InventoryItem.create({
    userId: business.userId,
    businessId: business.businessId,
    name: result.data.name,
    category: result.data.category,
    quantity: result.data.quantity,
    unit: result.data.unit,
    expiryDate: result.data.expiryDate.toISOString(),
  });

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

  await db.orm.public.InventoryItem
    .where({
      id,
      businessId: business.businessId,
    })
    .update({
      name: result.data.name,
      category: result.data.category,
      quantity: result.data.quantity,
      unit: result.data.unit,
      expiryDate: result.data.expiryDate.toISOString(),
    });

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

  await db.orm.public.InventoryItem
    .where({
      id,
      businessId: business.businessId,
    })
    .delete();

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

  await Promise.all(
    items.map((item) =>
      db.orm.public.InventoryItem.create({
        userId: business.userId,
        businessId: business.businessId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate.toISOString(),
      }),
    ),
  );

  revalidatePath("/business/dashboard");
  revalidatePath("/business/dashboard/inventory");

  return {
    success: true,
    count: items.length,
  };
}