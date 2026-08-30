import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getBusinessInventory } from "@/lib/business-inventory";

export default async function BusinessDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/business/login");
  }

  if (session.user.accountType !== "business") {
    redirect("/dashboard");
  }

  const inventory = await getBusinessInventory();
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