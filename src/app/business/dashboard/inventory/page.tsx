import { getBusinessInventory } from "@/lib/business-inventory";
import InventoryView from "@/components/dashboard/InventoryView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function BusinessInventoryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/business/login");
  }

  if (session.user.accountType !== "business") {
    redirect("/dashboard");
  }

  const inventory = await getBusinessInventory();

  // Map inventory dates to ISO string for safety
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: item.expiryDate ? (typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString()) : null,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date(item.createdAt).toISOString(),
  }));

  return (
    <main className="p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <InventoryView initialInventory={formattedInventory} isBusiness={true} />
      </div>
    </main>
  );
}