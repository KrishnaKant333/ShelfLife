import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getInventory } from "@/lib/inventory";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/consumer/login");
  }

  if (session.user.accountType !== "consumer") {
    redirect("/business/dashboard");
  }

  const inventory = await getInventory();
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString()
  }));

  return (
    <DashboardShell user={session.user} inventory={formattedInventory as any}>
      {children}
    </DashboardShell>
  );
}