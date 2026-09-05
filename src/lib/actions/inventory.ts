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
  imageUrl: z
    .string()
    .trim()
    .url("Image URL must be valid.")
    .max(500, "Image URL is too long.")
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
    expiryDate: result.data.expiryDate?.toISOString() ?? null,
    imageUrl: result.data.imageUrl || null,
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
      expiryDate: result.data.expiryDate?.toISOString() ?? null,
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
    expiryDate: Date | null;
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
        expiryDate: item.expiryDate?.toISOString() ?? null,
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

export async function bulkDeleteAction(
  ids: number[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership of every item and delete
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

      await db.orm.public.InventoryItem.where({ id }).delete();
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
    const expiredIds = items
      .filter((item) =>
        getInventoryStatus(
          item.quantity,
          typeof item.expiryDate === "string"
            ? item.expiryDate
            : item.expiryDate
              ? new Date(item.expiryDate).toISOString()
              : null,
          item.unit,
        ) === "Expired"
      )
      .map((item) => item.id);

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