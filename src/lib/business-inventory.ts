import { auth } from "@/auth";
import { db } from "@/prisma/db";

export async function getBusinessInventory() {
  const session = await auth();

  if (
    !session?.user?.id ||
    session.user.accountType !== "business" ||
    !session.user.businessId
  ) {
    return [];
  }

  return db.orm.public.InventoryItem
    .where({
        businessId: Number(session.user.businessId),
    })
    .all();
}

export type BusinessInventoryItem = Awaited<
  ReturnType<typeof getBusinessInventory>
>[number];