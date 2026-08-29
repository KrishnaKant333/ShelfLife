import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getInventory } from "@/lib/inventory";
import RecipesView from "@/components/dashboard/RecipesView";

export default async function ConsumerRecipesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/consumer/login");
  }

  if (session.user.accountType !== "consumer") {
    redirect("/dashboard");
  }

  const inventory = await getInventory();

  // Map dates to ISO strings for safety/consistency inside client component
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString(),
  }));

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <RecipesView initialInventory={formattedInventory} />
    </main>
  );
}
