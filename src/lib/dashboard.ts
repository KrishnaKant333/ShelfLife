import { inventory } from "@/data/inventory";

export function getDashboardStats() {
  const totalItems = inventory.length;

  const expiringItems = inventory.filter(
    (item) => item.status === "Expiring"
  );

  const lowStockItems = inventory.filter(
    (item) => item.status === "Low Stock"
  );

  return {
    totalItems,
    expiringSoon: expiringItems.length,
    lowStock: lowStockItems.length,
  };
}