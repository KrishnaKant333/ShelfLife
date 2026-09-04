import {
  AlertTriangle,
  Package,
  TrendingDown,
  Activity,
} from "lucide-react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
import ExpiryOverview from "@/components/dashboard/ExpiryOverview";
import InventoryOverview from "@/components/dashboard/InventoryOverview";
import QuickActions from "@/components/dashboard/QuickActions";
import DashboardAiInsights from "@/components/dashboard/DashboardAiInsights";
import DashboardUseFirst from "@/components/dashboard/DashboardUseFirst";
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
    getInventoryStatus(item.quantity, item.expiryDate, item.unit)
  );

  const totalItems = inventory.length;
  const expiringSoon = statuses.filter((status) => status === "Expiring").length;
  const lowStock = statuses.filter((status) => status === "Low Stock").length;
  const freshItems = statuses.filter((status) => status === "Fresh").length;

  const healthScore = totalItems === 0 ? 100 : Math.round((freshItems / totalItems) * 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Map dates to ISO string to ensure safety/consistency inside child components
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: item.expiryDate ? (typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString()) : null
  }));

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-sm font-semibold text-[var(--shelf-forest)]">
            Business Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--shelf-dark)] md:text-4xl">
            {greeting}{session.user.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mt-2 text-sm text-[var(--shelf-muted)]">
            Here is a status update on your business inventory.
          </p>
        </div>

        {/* Statistic Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Items"
            value={totalItems}
            description="Active products tracked"
            icon={Package}
          />

          <StatCard
            label="Expiring Soon"
            value={expiringSoon}
            description="Items needing attention"
            icon={AlertTriangle}
          />

          <StatCard
            label="Low Stock"
            value={lowStock}
            description="Items below threshold"
            icon={TrendingDown}
          />

          <StatCard
            label="Inventory Health"
            value={`${healthScore}%`}
            description="Proportion of fresh stock"
            icon={Activity}
          />
        </div>

        {/* AI Brief and Use First Widgets */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <DashboardAiInsights cacheKey="business" inventory={formattedInventory as any} />
          </div>
          <div className="md:col-span-1">
            <DashboardUseFirst inventory={formattedInventory as any} isBusiness={true} />
          </div>
        </div>

        {/* Action Panel */}
        <QuickActions isBusiness={true} />

        {/* Breakdown Grid */}
        <div className="grid gap-6 xl:grid-cols-2">
          <ExpiryOverview inventory={formattedInventory as any} isBusiness={true} />
          <InventoryOverview inventory={formattedInventory as any} />
        </div>
      </div>
    </main>
  );
}