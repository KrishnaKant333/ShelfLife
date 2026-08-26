import { auth } from "@/auth";
import { db } from "@/prisma/db";

export async function getInventory() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  return db.orm.public.InventoryItem
  .where({
    userId: Number(session.user.id),
  })
  .all();
}

export type InventoryItem = Awaited<
  ReturnType<typeof getInventory>
>[number];