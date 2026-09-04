import { isLowStock } from "./normalization";

export type InventoryStatus =
  | "Expired"
  | "Fresh"
  | "Expiring"
  | "Low Stock"
  | "Not trackable";

export function getInventoryStatus(
  quantity: number,
  expiryDate: string | null,
  unit = ""
): InventoryStatus {
  const now = new Date();
  if (!expiryDate) {
    return "Not trackable";
  }

  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) {
    return "Not trackable";
  }

  const difference = expiry.getTime() - now.getTime();
  const daysUntilExpiry = Math.ceil(difference / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return "Expired";
  }

  if (isLowStock(quantity, unit)) {
    return "Low Stock";
  }

  if (daysUntilExpiry <= 3) {
    return "Expiring";
  }

  return "Fresh";
}