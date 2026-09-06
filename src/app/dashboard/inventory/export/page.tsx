import { getInventory } from "@/lib/inventory";
import ExportInventoryView from "@/components/dashboard/ExportInventoryView";

export default async function ConsumerExportPage() {
  const inventory = await getInventory();
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: item.expiryDate ? String(item.expiryDate) : null,
    createdAt: item.createdAt ? String(item.createdAt) : "",
  }));

  return <ExportInventoryView inventory={formattedInventory} isBusiness={false} />;
}
