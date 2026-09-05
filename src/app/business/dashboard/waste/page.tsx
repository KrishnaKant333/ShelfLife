import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBusinessInventory } from "@/lib/business-inventory";
import WasteView from "@/components/dashboard/WasteView";

export default async function BusinessWastePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/business/login");
  }

  if (session.user.accountType !== "business") {
    redirect("/dashboard");
  }

  const inventory = await getBusinessInventory();

  // Map dates to ISO strings for safety/consistency inside client component
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: item.expiryDate ? (typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString()) : null,
  }));

  return (
    <main className="p-4 sm:p-6 md:p-8 lg:p-10">
      <WasteView inventory={formattedInventory} isBusiness={true} />
    </main>
  );
}
