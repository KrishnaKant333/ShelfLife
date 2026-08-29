"use server";
import { auth } from "@/auth";

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

  const session = await getCurrentUserSession();

  if (!session) {
    return {
      error: "You must be logged in to manage inventory.",
    };
  }

  await db.orm.public.InventoryItem.create({
    userId: session.userId,
    businessId: session.businessId,
    name: result.data.name,
    category: result.data.category,
    quantity: result.data.quantity,
    unit: result.data.unit,
    expiryDate: result.data.expiryDate.toISOString(),
  });

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

  await db.orm.public.InventoryItem
    .where(filter)
    .update({
      name: result.data.name,
      category: result.data.category,
      quantity: result.data.quantity,
      unit: result.data.unit,
      expiryDate: result.data.expiryDate.toISOString(),
    });

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

  await db.orm.public.InventoryItem
    .where(filter)
    .delete();

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
    expiryDate: Date;
  }>
) {
  const session = await getCurrentUserSession();

  if (!session) {
    throw new Error("You must be logged in to import inventory.");
  }

  await Promise.all(
    items.map((item) =>
      db.orm.public.InventoryItem.create({
        userId: session.userId,
        businessId: session.businessId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate.toISOString(),
      })
    )
  );

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
  };
}