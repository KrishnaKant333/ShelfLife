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
You are an inventory extraction system for ShelfLife.

Analyze the provided business invoice image.

Extract ONLY products that are actually present on
the invoice.

For every product return:

- name
- category
- quantity
- unit
- expiryDate
- bestBeforeDate
- manufacturingDate
- shelfLifeDays

Rules:

1. Never invent products.
2. Never invent quantities.
3. Never invent expiry dates.
4. If an expiry date is not explicitly present,
   return null.
5. Convert explicit expiry dates to YYYY-MM-DD.
6. If expiryDate is absent but a reliable manufacturing date and shelf-life duration are visible, return both so the application can derive expiry. Otherwise return null.
7. Quantity must be numeric.
8. Keep product names concise.
9. Infer a reasonable category from the product name
   when the invoice does not explicitly provide one.
10. Return ONLY JSON.

Expected format:

{
  "items": [
    {
      "name": "Milk",
      "category": "Dairy",
      "quantity": 20,
      "unit": "litres",
      "expiryDate": null,
      "bestBeforeDate": null,
      "manufacturingDate": null,
      "shelfLifeDays": null
    }
  ]
}
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
      max_tokens: 1000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reasoning_effort: "none",
    } as any);

  const content =
    response.choices[0]?.message?.content;

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