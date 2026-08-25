"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/prisma/db";

import { redirect } from "next/navigation";

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
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(30, "Unit is too long"),

  expiryDate: z.coerce.date(),
});

export type CreateInventoryState = {
  error?: string;
};

export async function createInventoryItem(
  _previousState: CreateInventoryState,
  formData: FormData
): Promise<CreateInventoryState> {
  const result = inventorySchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    expiryDate: formData.get("expiryDate"),
  });

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Invalid product data.",
    };
  }

  const demoUser = await db.orm.public.User.first({
    email: "demo@shelflife.app",
  });

  if (!demoUser) {
    return {
      error: "Demo user could not be found.",
    };
  }

  await db.orm.public.InventoryItem.create({
    userId: demoUser.id,
    name: result.data.name,
    category: result.data.category,
    quantity: result.data.quantity,
    unit: result.data.unit,
    expiryDate: result.data.expiryDate.toISOString(),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/alerts");
  revalidatePath("/dashboard/analytics");

  return {};
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
  });

  if (!result.success) {
    return {
      error:
        result.error.issues[0]?.message ??
        "Invalid product data.",
    };
  }

  const demoUser = await db.orm.public.User.first({
    email: "demo@shelflife.app",
  });

  if (!demoUser) {
    return {
      error: "Demo user could not be found.",
    };
  }

  await db.orm.public.InventoryItem
    .where({
      id,
      userId: demoUser.id,
    })
    .update({
      name: result.data.name,
      category: result.data.category,
      quantity: result.data.quantity,
      unit: result.data.unit,
      expiryDate: result.data.expiryDate.toISOString(),
    });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/alerts");
  revalidatePath("/dashboard/analytics");

  redirect("/dashboard/inventory");
}

export async function deleteInventoryItem(
  id: number
) {
  const demoUser = await db.orm.public.User.first({
    email: "demo@shelflife.app",
  });

  if (!demoUser) {
    throw new Error("Demo user could not be found.");
  }

  await db.orm.public.InventoryItem
    .where({
      id,
      userId: demoUser.id,
    })
    .delete();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/alerts");
  revalidatePath("/dashboard/analytics");
}