"use server";

import { auth } from "@/auth";
import { db } from "@/prisma/db";
import { groq } from "@/lib/groq";
import { getInventory } from "@/lib/inventory";
import { getBusinessInventory } from "@/lib/business-inventory";
import { getInventoryStatus } from "@/lib/inventory-status";
import { getDaysUntilExpiry } from "@/lib/format-expiry";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { normalizeQuantity } from "@/lib/normalization";

const recipeIngredientSchema = z.object({
  name: z.string(),
  quantityUsed: z.string(),
  status: z.enum(["available", "expiring_soon", "pantry_item"]),
  itemId: z.number().nullable(),
});

const recipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  estimatedPrepTime: z.number(),
  whyRecommended: z.string(),
  ingredients: z.array(recipeIngredientSchema),
  instructions: z.array(z.string()),
});

const recipesResponseSchema = z.object({
  recipes: z.array(recipeSchema),
});

function cleanThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function extractJson(text: string): string {
  const withoutThink = cleanThinkTags(text);
  const start = withoutThink.indexOf("{");
  const end = withoutThink.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return withoutThink.substring(start, end + 1);
  }
  return withoutThink;
}

export type RecipeIngredient = {
  name: string;
  quantityUsed: string;
  status: "available" | "expiring_soon" | "pantry_item";
  itemId: number | null;
};

export type Recipe = {
  name: string;
  description: string;
  estimatedPrepTime: number; // in minutes
  whyRecommended: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
};

export type RecipesResponse = {
  recipes: Recipe[];
};

async function getCurrentUserSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return {
    userId: Number(session.user.id),
    accountType: session.user.accountType,
    businessId: session.user.businessId ? Number(session.user.businessId) : null,
  };
}

export type RecipeMode = "use_soon" | "quick_meal" | "use_what_i_have";

export async function generateRecipesAction(mode: RecipeMode = "use_soon"): Promise<{ success: boolean; recipes?: Recipe[]; excludedCount?: number; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session || session.accountType !== "consumer") {
      return { success: false, error: "Unauthorized. Consumers only." };
    }

    const inventory = await getInventory();
    if (inventory.length === 0) {
      return { success: false, error: "Your inventory is empty. Add items to generate recipes!" };
    }

    // CRITICAL: Filter out expired products
    const now = new Date();
    const safeInventory = inventory.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(typeof item.expiryDate === "string" ? item.expiryDate : item.expiryDate);
      return expiryDate >= now;
    });

    const excludedCount = inventory.length - safeInventory.length;

    if (safeInventory.length === 0) {
      return {
        success: false,
        error: "Not enough safe ingredients are available to generate a useful recipe right now.",
        excludedCount: excludedCount
      };
    }

    // Sort inventory by expiry (closest first)
    const sortedInventory = [...safeInventory].sort((a, b) => {
      const daysA = getDaysUntilExpiry(a.expiryDate ? (typeof a.expiryDate === "string" ? a.expiryDate : new Date(a.expiryDate).toISOString()) : null);
      const daysB = getDaysUntilExpiry(b.expiryDate ? (typeof b.expiryDate === "string" ? b.expiryDate : new Date(b.expiryDate).toISOString()) : null);
      return daysA - daysB;
    });

    const inventoryPromptList = sortedInventory.map(item => {
      const daysLeft = getDaysUntilExpiry(item.expiryDate ? (typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString()) : null);
      const expiryText = daysLeft === 0 ? "Expires today" : `${daysLeft} days left`;
      return `- ID ${item.id}: "${item.name}" (Qty: ${item.quantity} ${item.unit}, Category: ${item.category}, Expiry: ${expiryText})`;
    }).join("\n");

    // Build mode-specific instructions
    let modeInstructions = "";
    if (mode === "use_soon") {
      modeInstructions = `Prioritize ingredients that are safe to use and closest to expiry.
Focus on items expiring today or within 1-3 days.`;
    } else if (mode === "quick_meal") {
      modeInstructions = `Generate practical recipes with short preparation times (ideally under 20-30 minutes).
Prioritize quick-to-prepare ingredients already in the inventory.`;
    } else if (mode === "use_what_i_have") {
      modeInstructions = `Minimize ingredients that are NOT in inventory.
Prioritize recipes using the highest proportion of current inventory ingredients.
Mark optional pantry items clearly.`;
    }

    const prompt = `
You are a creative chef helping a consumer minimize food waste by cooking with what they have.

**Safe Inventory (Expired items already excluded from this list):**
${inventoryPromptList}

Generate 2 to 4 recipes.

**Recipe Mode:** ${modeInstructions}

**Critical Rules:**
1. NEVER use expired ingredients. Only use items in the list above.
2. Recipes must be based ONLY on actual inventory items. Do NOT assume or list major ingredients the user does not have.
3. Clearly categorize every ingredient into one of three statuses:
   - "available": Item is in inventory and is safe to use.
   - "expiring_soon": Item is in inventory and expires in 3 days or fewer.
   - "pantry_item": Common household staple (salt, pepper, oil, spices, water, basic pasta/rice) NOT in inventory. Use sparingly.
4. For each ingredient, if it matches an inventory item, return its exact "itemId". If it's a "pantry_item", set "itemId" to null.
5. Do NOT invent quantities or items.

Return ONLY a JSON object matching this schema:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Short description",
      "estimatedPrepTime": 25,
      "whyRecommended": "Uses ingredients safe to eat and closest to expiry.",
      "ingredients": [
        { "name": "Tomatoes", "quantityUsed": "2 items", "status": "available", "itemId": 12 },
        { "name": "Milk", "quantityUsed": "1 cup", "status": "expiring_soon", "itemId": 15 },
        { "name": "Salt", "quantityUsed": "1 pinch", "status": "pantry_item", "itemId": null }
      ],
      "instructions": [
        "Step 1...",
        "Step 2..."
      ]
    }
  ]
}
`.trim();

    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: "system",
          content: "You are a professional chef. Always respond in JSON format matching the schema requested. NEVER recommend expired food."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      reasoning_effort: "none"
    } as any);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "AI failed to return any recipes.", excludedCount };
    }

    const cleaned = extractJson(content);
    const rawParsed = JSON.parse(cleaned);
    const parsed = recipesResponseSchema.parse(rawParsed);
    
    // SAFETY LAYER: Validate all returned recipes use only safe inventory
    const validatedRecipes = parsed.recipes.filter(recipe => {
      return recipe.ingredients.every(ing => {
        if (ing.itemId === null) {
          // Pantry items are always safe
          return true;
        }
        // Check if itemId is in safe inventory
        return safeInventory.some(invItem => invItem.id === ing.itemId);
      });
    });

    if (validatedRecipes.length === 0) {
      return {
        success: false,
        error: "Generated recipes contained unsafe ingredients. Please try again.",
        excludedCount
      };
    }

    return { success: true, recipes: validatedRecipes as Recipe[], excludedCount };
  } catch (error: any) {
    console.error("AI Recipe generation failed:", error);
    return { success: false, error: "Recipe generation is temporarily unavailable. Please try again." };
  }
}

export async function consumeIngredientsAction(
  itemsToConsume: { itemId: number; quantityUsed: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "You must be logged in to modify inventory." };
    }

    // Process each item
    for (const item of itemsToConsume) {
      const dbItem = await db.orm.public.InventoryItem.first({ id: item.itemId });
      if (!dbItem) {
        return { success: false, error: `Product ID #${item.itemId} not found.` };
      }

      // Verify ownership
      if (session.accountType === "business") {
        if (dbItem.businessId !== session.businessId) {
          return { success: false, error: "Unauthorized access to business product." };
        }
      } else {
        if (dbItem.userId !== session.userId) {
          return { success: false, error: "Unauthorized access to product." };
        }
      }

      if (!Number.isFinite(item.quantityUsed) || item.quantityUsed <= 0 || item.quantityUsed > dbItem.quantity) {
        return {
          success: false,
          error: `Quantity for ${dbItem.name} must be greater than zero and no more than the available stock.`,
        };
      }

      // Create consumption record
      await db.orm.public.InventoryConsumption.create({
        userId: session.userId,
        businessId: session.accountType === "business" ? session.businessId : null,
        inventoryItemId: item.itemId,
        productName: dbItem.name,
        quantityUsed: item.quantityUsed,
        unit: dbItem.unit,
        normalizedQuantityUsed: normalizeQuantity(item.quantityUsed, dbItem.unit).normalizedValue,
      });

      await db.orm.public.InventoryActivity.create({
        userId: session.userId,
        businessId: session.accountType === "business" ? session.businessId : null,
        inventoryItemId: item.itemId,
        productName: dbItem.name,
        action: "consumed",
        quantity: item.quantityUsed,
        unit: dbItem.unit,
      });

      const newQty = dbItem.quantity - item.quantityUsed;

      if (newQty <= 0) {
        // Delete item
        await db.orm.public.InventoryItem.where({ id: item.itemId }).delete();
      } else {
        // Update quantity
        await db.orm.public.InventoryItem.where({ id: item.itemId }).update({
          quantity: newQty
        });
      }
    }

    if (session.accountType === "business") {
      revalidatePath("/business/dashboard");
      revalidatePath("/business/dashboard/inventory");
      revalidatePath("/business/dashboard/waste");
    } else {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      revalidatePath("/dashboard/alerts");
      revalidatePath("/dashboard/analytics");
      revalidatePath("/dashboard/waste");
      revalidatePath("/dashboard/recipes");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark ingredients as consumed:", error);
    return { success: false, error: error?.message || "Failed to update inventory." };
  }
}

export async function generateAiInsightsAction(): Promise<{ success: boolean; insight?: string; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    let inventory: any[] = [];
    if (session.accountType === "business") {
      inventory = await getBusinessInventory();
    } else {
      inventory = await getInventory();
    }

    if (inventory.length === 0) {
      return {
        success: true,
        insight: session.accountType === "business"
          ? "No items tracked yet. Restock and record inventory to receive strategical recommendations."
          : "Your shelf is empty! Add products to receive custom usage insights."
      };
    }

    // Format current stock context
    const contextList = inventory.map(item => {
      const daysLeft = getDaysUntilExpiry(typeof item.expiryDate === "string" ? item.expiryDate : new Date(item.expiryDate).toISOString());
      return `- "${item.name}" (Qty: ${item.quantity} ${item.unit}, Category: ${item.category}, Expiry days remaining: ${daysLeft})`;
    }).join("\n");

    let prompt = "";
    if (session.accountType === "business") {
      prompt = `
You are a business intelligence assistant for ShelfLife.
Analyze current stock levels and expiry data:
${contextList}

Provide a concise, professional operational strategic insight (2 sentences max).
Focus on:
- Identifying products approaching expiry (FIFO priority)
- Highlighting low stock or overstock issues
- Restocking warnings based solely on current levels
Rules:
1. Speak purely about current stock. Do NOT claim demand trends or sales velocity unless explicitly shown.
2. Do NOT mention specific historical data that doesn't exist.
3. Be concise and operational.

Format: Return a simple text paragraph.
`.trim();
    } else {
      prompt = `
You are an intelligent kitchen assistant for ShelfLife.
Analyze the user's kitchen inventory:
${contextList}

Provide a friendly, helpful recommendation (2 sentences max) to reduce food waste.
Focus on:
- Ingredients approaching expiry that should be used immediately.
- Suggestions on categories or meals to prioritize.
Rules:
1. Do NOT make up recipes. Just suggest which ingredients to use first.
2. Be concise.

Format: Return a simple text paragraph.
`.trim();
    }

    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: "system",
          content: "You are a helpful, brief assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 150,
      reasoning_effort: "none"
    } as any);

    let insight = response.choices[0]?.message?.content?.trim();
    if (!insight) {
      return { success: false, error: "No insights generated." };
    }

    insight = cleanThinkTags(insight);

    return { success: true, insight };
  } catch (error: any) {
    console.error("AI Insights generation failed:", error);
    return { success: false, error: "AI insights currently unavailable. Check your connection or try again." };
  }
}

export type ConsumptionRecord = {
  id: number;
  productName: string;
  quantityUsed: number;
  unit: string;
  consumedAt: string;
};

export async function getRecentConsumptionAction(): Promise<{ success: boolean; history?: ConsumptionRecord[]; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    let records;
    if (session.accountType === "business") {
      records = await db.orm.public.InventoryConsumption.where({
        businessId: session.businessId,
      }).all();
    } else {
      records = await db.orm.public.InventoryConsumption.where({
        userId: session.userId,
      }).all();
    }

    records.sort((a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime());
    const recentRecords = records.slice(0, 10);

    const formatted = recentRecords.map(r => ({
      id: r.id,
      productName: r.productName,
      quantityUsed: r.quantityUsed,
      unit: r.unit,
      consumedAt: r.consumedAt,
    }));

    return { success: true, history: formatted };
  } catch (error: any) {
    console.error("Failed to retrieve consumption history:", error);
    return { success: false, error: "Failed to fetch activity history." };
  }
}
