import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MetricCounter from "@/components/dashboard/MetricCounter";
import NeedsAttentionBento from "@/components/dashboard/NeedsAttentionBento";
import EditorialAIBrief from "@/components/dashboard/EditorialAIBrief";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import QuickActions from "@/components/dashboard/QuickActions";
import InventoryOverview from "@/components/dashboard/InventoryOverview";
import GreetingHeader from "@/components/dashboard/GreetingHeader";
import { getInventory } from "@/lib/inventory";
import { getInventoryStatus } from "@/lib/inventory-status";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/consumer/login");
  }

  const inventory = await getInventory();
  const statuses = inventory.map((item) =>
    getInventoryStatus(item.quantity, item.expiryDate, item.unit)
  );

  const totalItems = inventory.length;
  const expiringSoon = statuses.filter((status) => status === "Expiring").length;
  const expiredItems = statuses.filter((status) => status === "Expired").length;
  const lowStock = statuses.filter((status) => status === "Low Stock").length;
  const freshItems = statuses.filter((status) => status === "Fresh").length;

  const healthScore = totalItems === 0 ? 100 : Math.round((freshItems / totalItems) * 100);
  const urgentTotal = expiringSoon + expiredItems + lowStock;

  // Map dates to ISO string to ensure safety/consistency inside child components
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: item.expiryDate
      ? typeof item.expiryDate === "string"
        ? item.expiryDate
        : new Date(item.expiryDate).toISOString()
      : null,
  }));

  const contextualSubtitle =
    totalItems === 0
      ? "Welcome to ShelfLife. Start adding items to monitor pantry freshness."
      : urgentTotal > 0
        ? `Your pantry is ${healthScore}% fresh. ${urgentTotal} item${urgentTotal === 1 ? "" : "s"} require attention today.`
        : `Your pantry is ${healthScore}% fresh. All items are in optimal condition.`;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Editorial Greeting Header & Quick Actions */}
      <GreetingHeader
        userName={session.user.name}
        subtitle={contextualSubtitle}
        isBusiness={false}
      />

      {/* Macro Metrics Counter Strip */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <MetricCounter
          label="Active Products"
          value={totalItems}
          description="Tracked in pantry"
          iconType="package"
          isPrimary
        />

        <MetricCounter
          label="Needs Attention"
          value={urgentTotal}
          description="Urgent or expiring"
          iconType="alert"
          variant={urgentTotal > 0 ? (expiredItems > 0 ? "danger" : "warning") : "default"}
          isPrimary
        />

        <MetricCounter
          label="Freshness Index"
          value={healthScore}
          suffix="%"
          description={`${freshItems} items peak fresh`}
          iconType="activity"
          variant="success"
        />

        <MetricCounter
          label="Low Stock"
          value={lowStock}
          description="Items below threshold"
          iconType="trending-down"
          variant={lowStock > 0 ? "warning" : "default"}
        />
      </div>

      {/* Core Asymmetric Bento Command Center */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Dominant Operational Hub: Needs Attention Bento (7 columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <NeedsAttentionBento inventory={formattedInventory as any} isBusiness={false} />
        </div>

        {/* Strategic Intelligence Partner: Editorial AI Brief (5 columns) */}
        <div className="lg:col-span-5 flex flex-col">
          <EditorialAIBrief cacheKey="consumer" inventory={formattedInventory as any} />
        </div>
      </div>

      {/* Secondary Analytical Bento Row: Activity Ledger, Quick Actions & Stock Distribution */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ActivityTimeline isBusiness={false} />
        <QuickActions isBusiness={false} />
        <InventoryOverview inventory={formattedInventory as any} />
      </div>
    </div>
  );
}