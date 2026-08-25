export type InventoryStatus =
  | "Fresh"
  | "Expiring"
  | "Low Stock";

export function getInventoryStatus(
  quantity: number,
  expiryDate: string
): InventoryStatus {
  const now = new Date();
  const expiry = new Date(expiryDate);

  const daysUntilExpiry =
    (expiry.getTime() - now.getTime()) /
    (1000 * 60 * 60 * 24);

  if (quantity <= 2) {
    return "Low Stock";
  }

  if (daysUntilExpiry <= 3) {
    return "Expiring";
  }

  return "Fresh";
}