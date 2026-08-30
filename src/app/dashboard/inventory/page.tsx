import { getInventory } from "@/lib/inventory";
import InventoryView from "@/components/dashboard/InventoryView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function InventoryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/consumer/login");
  }

  const inventory = await getInventory();

  // Map inventory dates to ISO string for safety
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString(),
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date(item.createdAt).toISOString(),
  }));

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <InventoryView initialInventory={formattedInventory} isBusiness={false} />
      </div>
    </main>
  );
}