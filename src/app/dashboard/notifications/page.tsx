import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInventory } from "@/lib/inventory";
import NotificationCenter from "@/components/dashboard/NotificationCenter";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/consumer/login");
  const inventory = await getInventory();
  return <NotificationCenter inventory={inventory.map((item) => ({ ...item, expiryDate: item.expiryDate ? String(item.expiryDate) : null }))} />;
}
