export interface InventoryItem {
  name: string;
  category: string;
  quantity: number;
  expiry: string;
  status: "Fresh" | "Expiring";
}

export const inventory: InventoryItem[] = [
  {
    name: "Fresh Milk",
    category: "Dairy",
    quantity: 4,
    expiry: "2 days",
    status: "Expiring",
  },
  {
    name: "Whole Wheat Bread",
    category: "Bakery",
    quantity: 2,
    expiry: "3 days",
    status: "Expiring",
  },
  {
    name: "Cheddar Cheese",
    category: "Dairy",
    quantity: 1,
    expiry: "8 days",
    status: "Fresh",
  },
  {
    name: "Tomatoes",
    category: "Vegetables",
    quantity: 6,
    expiry: "1 day",
    status: "Expiring",
  },
];