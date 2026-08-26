import "dotenv/config";
import { Temporal } from "../src/lib/temporal";
import { db } from "../src/prisma/db";

async function main() {
  const demoUser = await db.orm.public.User.upsert({
    create: {
      name: "Demo User",
      email: "demo@shelflife.app",
      updatedAt: Temporal.Now.instant(),
    },
    update: {
      name: "Demo User",
    },
    conflictOn: {
      email: "demo@shelflife.app",
    },
  });

  await db.orm.public.InventoryItem.createAll([
    {
      userId: demoUser.id,
      name: "Fresh Milk",
      category: "Dairy",
      quantity: 2,
      unit: "litres",
      expiryDate: "2026-09-03T00:00:00Z",
    },
    {
      userId: demoUser.id,
      name: "Whole Wheat Bread",
      category: "Bakery",
      quantity: 1,
      unit: "packet",
      expiryDate: "2026-09-05T00:00:00Z",
    },
    {
      userId: demoUser.id,
      name: "Tomatoes",
      category: "Vegetables",
      quantity: 6,
      unit: "pieces",
      expiryDate: "2026-09-04T00:00:00Z",
    },
    {
      userId: demoUser.id,
      name: "Rice",
      category: "Grains",
      quantity: 5,
      unit: "kg",
      expiryDate: "2027-01-15T00:00:00",
    },
  ]);

  console.log("ShelfLife database seeded successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});