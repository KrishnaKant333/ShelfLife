import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBusinessInventory } from "@/lib/business-inventory";
import NotificationCenter from "@/components/dashboard/NotificationCenter";

export default async function BusinessNotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/business/login");
  if (session.user.accountType !== "business") redirect("/dashboard");
  const inventory = await getBusinessInventory();
  return <NotificationCenter isBusiness inventory={inventory.map((item) => ({ ...item, expiryDate: item.expiryDate ? String(item.expiryDate) : null }))} />;
}
