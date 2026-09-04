import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInventory } from "@/lib/inventory";
import AnalyticsView from "@/components/dashboard/AnalyticsView";

export default async function ConsumerAnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/consumer/login");
  }

  const inventory = await getInventory();

  // Map database dates to ISO strings for safety/consistency
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: item.expiryDate ? (typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString()) : null,
  }));

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <AnalyticsView inventory={formattedInventory} />
    </main>
  );
}