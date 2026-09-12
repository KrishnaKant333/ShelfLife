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

  const now = new Date();
  const addDays = (d: number) =>
    new Date(now.getTime() + d * 86400000).toISOString();

  // 16 visually distinct food products matching reference design
  const distinctProducts = [
    {
      name: "Whole Milk",
      category: "Dairy",
      quantity: 2,
      unit: "bottles",
      expiryDate: addDays(2),
      imageUrl:
        "https://images.openfoodfacts.org/images/products/322/885/700/0166/front_en.115.400.jpg",
    },
    {
      name: "Whole Wheat Bread",
      category: "Bakery",
      quantity: 1,
      unit: "loaf",
      expiryDate: addDays(3),
      imageUrl:
        "https://images.openfoodfacts.org/images/products/322/982/012/9488/front_en.9.400.jpg",
    },
    {
      name: "Tomatoes",
      category: "Produce",
      quantity: 4,
      unit: "pieces",
      expiryDate: addDays(5),
      imageUrl: null, // Graceful category fallback
    },
    {
      name: "Onions",
      category: "Produce",
      quantity: 1,
      unit: "kg",
      expiryDate: addDays(14),
      imageUrl: null,
    },
    {
      name: "Bananas",
      category: "Produce",
      quantity: 6,
      unit: "pieces",
      expiryDate: addDays(6),
      imageUrl: null,
    },
    {
      name: "Eggs",
      category: "Dairy",
      quantity: 12,
      unit: "pieces",
      expiryDate: addDays(7),
      imageUrl:
        "https://images.openfoodfacts.org/images/products/325/039/000/1000/front_en.10.400.jpg",
    },
    {
      name: "Greek Yogurt",
      category: "Dairy",
      quantity: 1,
      unit: "tub",
      expiryDate: addDays(10),
      imageUrl:
        "https://images.openfoodfacts.org/images/products/520/105/100/1021/front_en.8.400.jpg",
    },
    {
      name: "Chicken Breast",
      category: "Meat",
      quantity: 500,
      unit: "g",
      expiryDate: addDays(1),
      imageUrl: null,
    },
    {
      name: "Basmati Rice",
      category: "Grains",
      quantity: 1,
      unit: "kg",
      expiryDate: addDays(90),
      imageUrl:
        "https://images.openfoodfacts.org/images/products/501/033/820/0015/front_en.4.400.jpg",
    },
    {
      name: "Pasta",
      category: "Grains",
      quantity: 500,
      unit: "g",
      expiryDate: addDays(120),
      imageUrl:
        "https://images.openfoodfacts.org/images/products/807/680/951/3753/front_en.21.400.jpg",
    },
    {
      name: "Olive Oil",
      category: "Pantry",
      quantity: 1,
      unit: "L",
      expiryDate: addDays(180),
      imageUrl:
        "https://images.openfoodfacts.org/images/products/841/019/900/1184/front_en.4.400.jpg",
    },
    {
      name: "Apples",
      category: "Produce",
      quantity: 4,
      unit: "pieces",
      expiryDate: addDays(6),
      imageUrl: null,
    },
    {
      name: "Cheddar Cheese",
      category: "Dairy",
      quantity: 250,
      unit: "g",
      expiryDate: addDays(8),
      imageUrl: null,
    },
    {
      name: "Spinach",
      category: "Produce",
      quantity: 200,
      unit: "g",
      expiryDate: addDays(2),
      imageUrl: null,
    },
    {
      name: "Salmon Fillet",
      category: "Meat",
      quantity: 400,
      unit: "g",
      expiryDate: addDays(1),
      imageUrl: null,
    },
    {
      name: "Butter",
      category: "Dairy",
      quantity: 250,
      unit: "g",
      expiryDate: addDays(21),
      imageUrl: null,
    },
  ];

  // Check existing items to avoid non-destructive duplication
  const existingItems = await db.orm.public.InventoryItem.where({
    userId: demoUser.id,
  }).all();
  const existingNames = new Set(
    existingItems.map((i) => i.name.trim().toLowerCase())
  );

  let addedCount = 0;
  for (const item of distinctProducts) {
    if (!existingNames.has(item.name.trim().toLowerCase())) {
      await db.orm.public.InventoryItem.create({
        ...item,
        userId: demoUser.id,
      });
      addedCount++;
    } else {
      // Update image or expiry date if existing item has null image
      const existing = existingItems.find(
        (i) => i.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );
      if (existing && item.imageUrl && !existing.imageUrl) {
        await db.orm.public.InventoryItem.where({ id: existing.id }).update({
          imageUrl: item.imageUrl,
          expiryDate: item.expiryDate,
        });
      }
    }
  }

  console.log(
    `ShelfLife seed completed. Added ${addedCount} new distinct products.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});