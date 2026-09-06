import { getBusinessInventory } from "@/lib/business-inventory";
import ExportInventoryView from "@/components/dashboard/ExportInventoryView";

export default async function BusinessExportPage() {
  const inventory = await getBusinessInventory();
  const formattedInventory = inventory.map((item) => ({
    ...item,
    expiryDate: item.expiryDate ? String(item.expiryDate) : null,
    createdAt: item.createdAt ? String(item.createdAt) : "",
  }));

  return <ExportInventoryView inventory={formattedInventory} isBusiness={true} />;
}
