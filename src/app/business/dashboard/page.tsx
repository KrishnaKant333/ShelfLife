import {
  AlertTriangle,
  Package,
  TrendingDown,
} from "lucide-react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

import StatCard from "@/components/dashboard/StatCard";
import { getBusinessInventory } from "@/lib/business-inventory";
import { getInventoryStatus } from "@/lib/inventory-status";

export default async function BusinessDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/business/login");
  }

  if (session.user.accountType !== "business") {
    redirect("/dashboard");
  }

  const inventory = await getBusinessInventory();

  const statuses = inventory.map((item) =>
    getInventoryStatus(
      item.quantity,
      item.expiryDate
    )
  );

  const stats = {
    totalItems: inventory.length,

    expiringSoon: statuses.filter(
      (status) => status === "Expiring"
    ).length,

    lowStock: statuses.filter(
      (status) => status === "Low Stock"
    ).length,
  };

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">

        <p className="text-sm font-medium text-[var(--shelf-forest)]">
          Business Overview
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--shelf-dark)] md:text-4xl">
          Welcome back{session.user.name
            ? `, ${session.user.name}`
            : ""}
        </h1>

        <p className="mt-2 text-[var(--shelf-muted)]">
          Here's what's happening with your business inventory.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <StatCard
            label="Total Items"
            value={stats.totalItems}
            description="Products currently tracked"
            icon={Package}
          />

          <StatCard
            label="Expiring Soon"
            value={stats.expiringSoon}
            description="Items needing attention"
            icon={AlertTriangle}
          />

          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            description="Items that may need restocking"
            icon={TrendingDown}
          />

        </div>

        <div className="mt-8 rounded-2xl bg-[var(--shelf-surface)] p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-[var(--shelf-dark)]">
            Business Inventory
          </h2>

          <p className="mt-2 text-sm text-[var(--shelf-muted)]">
            {inventory.length === 0
              ? "Your business has no inventory yet."
              : `${inventory.length} products are currently being tracked.`}
          </p>
        </div>

      </div>
    </main>
  );
}