"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { Temporal } from "@/lib/temporal";
import {
  parseItemImageUrls,
  safeDeleteUnreferencedImages,
} from "@/lib/storage-lifecycle";

const consumerProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  businessName: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
});

const businessProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters.").optional().or(z.literal("")),
  industry: z.string().trim().optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm password is required."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
});

export type SettingsActionResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function updateProfileNameAction(data: {
  name: string;
  businessName?: string;
  industry?: string;
}): Promise<SettingsActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Authentication required." };
  }

  const userId = Number(session.user.id);
  const isBusiness = session.user.accountType === "business";

  const schema = isBusiness ? businessProfileSchema : consumerProfileSchema;
  const result = schema.safeParse(data);

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid profile data." };
  }

  try {
    await db.orm.public.User.where({ id: userId }).update({
      name: result.data.name,
      updatedAt: Temporal.Now.instant(),
    });

    if (isBusiness && session.user.businessId && result.data.businessName && result.data.businessName.trim().length >= 2) {
      const businessId = Number(session.user.businessId);
      await db.orm.public.Business.where({ id: businessId }).update({
        name: result.data.businessName.trim(),
        industry: result.data.industry?.trim() || null,
        updatedAt: Temporal.Now.instant(),
      });
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/business/dashboard/settings");
    return { success: true, message: "Profile updated successfully." };
  } catch (err: unknown) {
    console.error("Failed to update profile:", err);
    return { error: err instanceof Error ? err.message : "Failed to update profile." };
  }
}

export async function updatePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<SettingsActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Authentication required." };
  }

  const result = passwordSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid password data." };
  }

  const userId = Number(session.user.id);
  const user = await db.orm.public.User.first({ id: userId });

  if (!user || !user.passwordHash) {
    return { error: "Account not found or password login unavailable." };
  }

  const isCurrentValid = await bcrypt.compare(result.data.currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return { error: "Current password does not match our records." };
  }

  const newHash = await bcrypt.hash(result.data.newPassword, 12);

  try {
    await db.orm.public.User.where({ id: userId }).update({
      passwordHash: newHash,
      updatedAt: Temporal.Now.instant(),
    });

    return { success: true, message: "Password updated successfully." };
  } catch (err: unknown) {
    console.error("Failed to update password:", err);
    return { error: "Failed to update password." };
  }
}

export async function purgeInventoryAction(): Promise<SettingsActionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Authentication required." };
  }

  const userId = Number(session.user.id);
  const isBusiness = session.user.accountType === "business";
  const businessId = session.user.businessId ? Number(session.user.businessId) : null;

  try {
    const filter = isBusiness && businessId ? { businessId } : { userId };
    const items = await db.orm.public.InventoryItem.where(filter).all();
    const candidateUrls = items.flatMap(parseItemImageUrls);
    const itemIds = items.map((i) => i.id);

    if (isBusiness && businessId) {
      await db.orm.public.InventoryItem.where({ businessId }).delete();
    } else {
      await db.orm.public.InventoryItem.where({ userId }).delete();
    }

    if (candidateUrls.length > 0) {
      await safeDeleteUnreferencedImages(candidateUrls, itemIds);
    }

    revalidatePath("/dashboard");
    revalidatePath("/business/dashboard");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/business/dashboard/inventory");
    revalidatePath("/dashboard/alerts");
    revalidatePath("/business/dashboard/alerts");
    revalidatePath("/dashboard/settings");
    revalidatePath("/business/dashboard/settings");

    return { success: true, message: "All inventory items have been purged." };
  } catch (err: unknown) {
    console.error("Failed to purge inventory:", err);
    return { error: "Failed to purge inventory." };
  }
}
