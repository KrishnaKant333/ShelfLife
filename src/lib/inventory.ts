import { db } from "@/prisma/db";

export async function getInventory() {
  return db.orm.public.InventoryItem.all();
}

export type InventoryItem = Awaited<
  ReturnType<typeof getInventory>
>[number];