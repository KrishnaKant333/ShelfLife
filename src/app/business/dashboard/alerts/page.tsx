import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBusinessInventory } from "@/lib/business-inventory";
import AlertsView from "@/components/dashboard/AlertsView";

export default async function BusinessAlertsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/business/login");
  }

  if (session.user.accountType !== "business") {
    redirect("/dashboard");
  }

  const inventory = await getBusinessInventory();

  // Map database dates to ISO strings for safety/consistency
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: item.expiryDate ? (typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString()) : null,
  }));

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <AlertsView inventory={formattedInventory} isBusiness={true} />
    </main>
  );
}
