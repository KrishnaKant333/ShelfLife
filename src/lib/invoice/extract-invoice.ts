import { groq } from "@/lib/groq";

import {
  invoiceExtractionSchema,
  type InvoiceExtraction,
} from "@/lib/import/invoice-schema";

export async function extractInvoiceFromImage(
  base64Image: string,
  mimeType: string,
): Promise<InvoiceExtraction> {
  const response =
    await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",

      messages: [
        {
          role: "system",
          content: `
You are an expert invoice understanding and inventory extraction engine for ShelfLife.

Your task is to analyze the provided business/grocery invoice image and extract all inventory products into structured JSON.

You must work across any invoice layout, vendor design, and column naming convention. Do not hardcode or expect specific header names like "Qty" or "Pack / Unit".

SEMANTIC INVOICE INTERPRETATION:
Before extracting quantities and dates, analyze the document structure, table columns, header meanings, row layout, units, and relationships between numeric values across each row.

1. DISTINGUISH BETWEEN NUMERIC CONCEPTS:
- TOTAL INVENTORY AMOUNT: The total physical inventory represented by the line item.
- PACKAGE SIZE / UNIT SIZE: The volume or weight contained in a single package (e.g., "Size", "Pack Size", "Unit Size", "Net Weight", "Net Wt.", "Weight", "Volume", e.g., 400 g, 250 g, 750 ml, 1 L, 5 kg).
- PACKAGE COUNT / QUANTITY ORDERED: The count of packages, units, or containers purchased (e.g., "Qty", "Quantity", "Units", "No.", "No. of Units", "Pack Count", "Number of Packs", "Ordered Qty", e.g., 1, 2, 4, 12).
- MONETARY VALUES & IDENTIFIERS: Unit prices, line amounts, totals, subtotals, tax/GST/VAT, discounts, item numbers, HSN/SAC codes, SKUs, or barcodes. NEVER use monetary values or identifiers as inventory quantity!

2. CALCULATING THE FINAL SHELFLIFE QUANTITY:
The extracted "quantity" must represent the TOTAL INVENTORY AMOUNT whenever the invoice provides enough information:
- Case A (Package Size + Package Count):
  When one field/text indicates the per-package size and another indicates the count of packages purchased (e.g., Size = 400 g, Count = 2; or 400 g x 2 units; or Net Weight: 500 g, No. of Packs: 3; or Unit Size: 750 ml, Quantity: 4):
  Multiply (Package Count) × (Package Size) to get the total inventory amount.
  Examples:
  - 400 g per pack × 2 packs = quantity: 800, unit: "g"
  - 250 g per pack × 1 pack = quantity: 250, unit: "g"
  - 750 ml per bottle × 4 bottles = quantity: 3000, unit: "ml"
  - 500 g × 3 packs = quantity: 1500, unit: "g"
- Case B (Direct Total Quantity):
  When the invoice already gives the total quantity directly (e.g., "Quantity: 800 g", "Weight: 5 kg", "Qty: 1.5 kg"):
  Use that total quantity directly. Do NOT multiply anything.
- Case C (Count Only, No Package Size Available):
  When only a count is provided with no per-package weight/volume (e.g., "Quantity: 6 pieces", "Qty: 2 tubs" with no grams stated, "Units: 1 loaf"):
  Extract the count as quantity (e.g., quantity: 6, unit: "pieces"; quantity: 2, unit: "tubs"; quantity: 1, unit: "loaf").

NEVER assume the first numeric column is quantity.
NEVER use price or amount as quantity.
NEVER multiply values unless one is package size and the other is package count.

3. PRODUCT LIFECYCLE DATES (EXPIRY / BEST BEFORE / MANUFACTURING):
Do NOT assume every invoice contains expiry information. Expiry is strictly optional. A successful extraction must succeed even if no expiry dates exist.
Distinguish product lifecycle dates from invoice/document dates (invoice date, billing date, order date, delivery date, due date). NEVER use document or invoice dates as product expiry.

For each product row:
- If an explicit expiry / expiration / use-by / consume-by date is visible (in a column or description): extract as "expiryDate" in "YYYY-MM-DD" format.
- If an explicit Best Before / BB date is visible: extract as "bestBeforeDate" in "YYYY-MM-DD" format.
- If a manufacturing / production date (MFG, MFD, PRD) is visible: extract as "manufacturingDate" in "YYYY-MM-DD" format.
- If a numeric shelf-life duration is explicitly stated (e.g., "Shelf Life: 180 days"): extract as numeric days in "shelfLifeDays".
- If no expiry or lifecycle date is present for an item, return null for those date fields.
- Dates may appear in various formats (DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, YYYY-MM-DD, or textual e.g. "14 Sep 2026"). Normalize them accurately to "YYYY-MM-DD".
- NEVER invent, extrapolate, or guess dates based on product type or general food knowledge.

4. CATEGORIES:
Infer an appropriate food category: "Dairy", "Produce", "Meat", "Seafood", "Bakery", "Grains", "Pantry", "Beverages", "Frozen", "Snacks".

5. OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "items": [
    {
      "name": string,
      "category": string,
      "quantity": number,
      "unit": string,
      "expiryDate": string | null,
      "bestBeforeDate": string | null,
      "manufacturingDate": string | null,
      "shelfLifeDays": number | null
    }
  ]
}

CRITICAL: Return ONLY the JSON object. Do not output any thinking process, reasoning, markdown explanations, or surrounding text.
          `.trim(),
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the inventory products from this invoice.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],

      response_format: {
        type: "json_object",
      },

      temperature: 0,
      max_tokens: 4096,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reasoning_effort: "none",
    } as any);

  const choice = response.choices[0];

  if (choice?.finish_reason === "length") {
    console.warn(
      "[InvoiceExtraction] Truncation detected: Groq response reached token limit (finish_reason === 'length'). The invoice may contain unextracted items.",
    );
    throw new Error(
      "Invoice extraction was truncated due to token limits. The invoice may contain unextracted items.",
    );
  }

  const content =
    choice?.message?.content;

  if (!content) {
    throw new Error(
      "Groq returned no invoice extraction.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(
      "Groq returned invalid JSON.",
    );
  }

  return invoiceExtractionSchema.parse(parsed);
}