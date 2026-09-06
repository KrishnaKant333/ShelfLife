"use server";

import { groq } from "@/lib/groq";
import { z } from "zod";
import { deriveExpiryDate } from "@/lib/expiry";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const labelExtractionSchema = z.object({
  name: z.string().nullable(),
  category: z.string().nullable(),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  expiryDate: z.string().nullable(),
  bestBeforeDate: z.string().nullable().optional(),
  manufacturingDate: z.string().nullable().optional(),
  shelfLifeDays: z.number().positive().nullable().optional(),
});

export type LabelExtraction = z.infer<typeof labelExtractionSchema>;

export async function extractLabelAction(formData: FormData): Promise<LabelExtraction> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Please upload a label image.");
  }

  const fileType = file.type || getImageTypeFromName(file.name);

  if (!ALLOWED_TYPES.includes(fileType)) {
    throw new Error("Only JPG, PNG, and WebP images are supported for label scanning.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be smaller than 20MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  let response;
  try {
    response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: "system",
          content: `You are a product label scanner for ShelfLife.
Analyze the provided product label image.
You MUST respond with ONLY a valid JSON object. Do not include markdown code block markup or reasoning text.

Attempt to extract the following fields if present on the label:
- name: The name of the product.
- category: A reasonable food or inventory category (e.g., Dairy, Bakery, Produce, Grains, Beverages, Canned Goods, Pantry). Infer this from the product name if not explicitly stated.
- quantity: A numeric quantity.
- unit: The unit of measurement (e.g., kg, litres, ml, g, packets, pieces, oz).
- expiryDate: The expiry or best-by date formatted as YYYY-MM-DD.
- bestBeforeDate: A separate best-before date formatted as YYYY-MM-DD, if visible.
- manufacturingDate: A manufacturing/production date formatted as YYYY-MM-DD, if visible.
- shelfLifeDays: A clearly stated shelf-life duration in days, if visible; otherwise null.

Rules:
1. Do NOT invent or make up values.
2. If a field (especially expiryDate or quantity) is not confidently visible, return null for it.
3. If expiryDate has a format like "12 SEP 26" or "09/12/26", parse and convert it to YYYY-MM-DD.
4. Output raw valid JSON matching this schema:
{
  "name": "Organic Whole Milk",
  "category": "Dairy",
  "quantity": 1,
  "unit": "litres",
  "expiryDate": "2026-09-12",
  "bestBeforeDate": null,
  "manufacturingDate": null,
  "shelfLifeDays": null
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract information from this product label into a valid JSON object.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${fileType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0,
      max_tokens: 700,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reasoning_effort: "none",
    } as any);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The label scanning service is unavailable.";
    throw new Error(`Label scanning failed: ${message}`);
  }

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned no product information.");
  }

  try {
    const parsed = JSON.parse(content);
    const result = labelExtractionSchema.parse(parsed);
    return {
      ...result,
      expiryDate: deriveExpiryDate(result),
    };
  } catch (err) {
    throw new Error("Failed to parse extracted product details: " + (err instanceof Error ? err.message : String(err)));
  }
}

function getImageTypeFromName(name: string) {
  const extension = name.toLowerCase().split(".").pop();
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return "";
}
