import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInventory } from "@/lib/inventory";
import { db } from "@/prisma/db";
import AnalyticsView from "@/components/dashboard/AnalyticsView";

export default async function ConsumerAnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/consumer/login");
  }

  const userId = Number(session.user.id);

  const [inventory, consumptions, activities] = await Promise.all([
    getInventory(),
    db.orm.public.InventoryConsumption.where({ userId }).all(),
    db.orm.public.InventoryActivity.where({ userId }).all(),
  ]);

  // Map database dates to ISO strings for safety/consistency
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: item.expiryDate
      ? typeof item.expiryDate === "string"
        ? item.expiryDate
        : new Date(item.expiryDate).toISOString()
      : null,
  }));

  const formattedConsumptions = consumptions.map((c) => ({
    id: c.id,
    productName: c.productName,
    quantityUsed: c.quantityUsed,
    unit: c.unit,
    normalizedQuantityUsed: c.normalizedQuantityUsed,
    consumedAt:
      typeof c.consumedAt === "string" ? c.consumedAt : new Date(c.consumedAt).toISOString(),
  }));

  const formattedActivities = activities.map((a) => ({
    id: a.id,
    productName: a.productName,
    action: a.action,
    quantity: a.quantity,
    unit: a.unit,
    occurredAt:
      typeof a.occurredAt === "string" ? a.occurredAt : new Date(a.occurredAt).toISOString(),
  }));

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <AnalyticsView
        inventory={formattedInventory}
        consumptions={formattedConsumptions}
        activities={formattedActivities}
      />
    </main>
  );
}