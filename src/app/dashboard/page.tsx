import {
  AlertTriangle,
  Package,
  TrendingDown,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import { getDashboardStats } from "@/lib/dashboard";
import ExpiryOverview from "@/components/dashboard/ExpiryOverview";
import InventoryOverview from "@/components/dashboard/InventoryOverview";
import QuickActions from "@/components/dashboard/QuickActions";
import { getUsers } from "@/lib/db-test";
import { getInventory } from "@/lib/inventory";
import { getInventoryStatus } from "@/lib/inventory-status";

export default async function DashboardPage() {
  const inventory = await getInventory();
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

        <div>
          <p className="text-sm font-medium text-[var(--shelf-forest)]">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--shelf-dark)] md:text-4xl">
            Good morning.
          </h1>

          <p className="mt-2 text-[var(--shelf-muted)]">
            Here&apos;s what&apos;s happening with your inventory.
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
          <div>
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <ExpiryOverview inventory={inventory} />
              <InventoryOverview inventory={inventory} />
            </div>

            <div className="mt-6">
              <QuickActions />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}