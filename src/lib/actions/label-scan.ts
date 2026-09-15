"use server";

import { auth } from "@/auth";
import { groq, GROQ_MODEL } from "@/lib/groq";
import { resolveExpiryProvenance } from "@/lib/expiry";
import { saveProductImage, deleteProductImages } from "@/lib/storage";
import { safeDeleteUnreferencedImages } from "@/lib/storage-lifecycle";
import {
  labelExtractionSchema,
  type LabelExtraction,
  type MultiViewExtraction,
} from "@/lib/multi-view";

export type { LabelExtraction, MultiViewExtraction };

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB per file
const MAX_VIEWS = 4;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Extracts product details from 1 to 4 product views (front, back, bottom/rim, side)
 * using Groq vision model (GROQ_MODEL: qwen/qwen3.8-27b), synthesizing all angles into ONE unified record.
 */
export async function extractMultiViewLabelAction(formData: FormData): Promise<MultiViewExtraction> {
  // Collect all files: check for "files" (multiple) or "file" (single fallback)
  const rawFiles = formData.getAll("files");
  let files: File[] = [];

  if (rawFiles.length > 0) {
    files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);
  }

  if (files.length === 0) {
    const singleFile = formData.get("file");
    if (singleFile instanceof File && singleFile.size > 0) {
      files = [singleFile];
    }
  }

  if (files.length === 0) {
    throw new Error("Please select or capture at least one image of the product.");
  }

  if (files.length > MAX_VIEWS) {
    throw new Error(`Maximum of ${MAX_VIEWS} photos allowed per product.`);
  }

  // Pre-process and validate each image file
  const processedFiles: {
    buffer: Buffer;
    base64: string;
    fileType: string;
    originalName: string;
  }[] = [];

  for (const file of files) {
    const fileType = file.type || getImageTypeFromName(file.name);
    if (!ALLOWED_TYPES.includes(fileType)) {
      throw new Error(`Unsupported image format: ${file.name}. Only JPG, PNG, and WebP are supported.`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Image ${file.name} exceeds the 20MB size limit.`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    processedFiles.push({
      buffer,
      base64,
      fileType,
      originalName: file.name,
    });
  }

  // Persist images via storage abstraction (Vercel Blob in production, local filesystem in development)
  const savedImageUrls: string[] = [];
  for (const pf of processedFiles) {
    try {
      const url = await saveProductImage(pf.buffer, pf.originalName, pf.fileType);
      savedImageUrls.push(url);
    } catch (error) {
      // Clean up any images successfully stored prior to this failure
      if (savedImageUrls.length > 0) {
        await deleteProductImages(savedImageUrls);
      }
      const message = error instanceof Error ? error.message : "Failed to store product image.";
      throw new Error(`Product image storage failed: ${message}`);
    }
  }

  try {
    // Build Groq Vision multi-part prompt
    const systemPrompt = `You are an expert multi-view product packaging and label scanner for ShelfLife.
You are analyzing 1 to ${processedFiles.length} photographic view(s) of ONE SINGLE food or grocery product.

CRITICAL INSTRUCTIONS:
1. Merge and synthesize all information across all images into ONE single product record. NEVER output multiple products.
2. Panel Specialization:
   - Front Panel: Brand name, primary product title, variant, food category (Dairy, Bakery, Produce, Grains, Beverages, Canned Goods, Pantry, Snacks, Meat & Poultry, Seafood, Frozen).
   - Back Panel: Net quantity, standard unit of measure (e.g. g, kg, ml, L, pieces, pack), ingredients, nutrition.
   - Bottom / Rim / Cap / Flap: Stamped expiry dates (EXP / Best Before / Use By), manufacturing dates (MFG / MFD), shelf-life days, batch/lot codes.
   - Side / Top Panels: Storage instructions, serving sizes.
3. Conflict Resolution & Confidence Rules:
   - Product Name & Category: Take from the clearest front branding view.
   - Expiry Date: Explicit stamped dates on cap, rim, or bottom (e.g., "24 SEP 26", "EXP 09/2026", "2026-09-24") take precedence over marketing text or copyright years. Convert to YYYY-MM-DD.
   - Net Quantity: True net weight/volume (e.g., "500g", "1 Litre", "330 ml", "6 pack") takes precedence over front marketing banners (e.g., "100% Organic" is NOT quantity 100).
4. Identify primaryImageIndex: Which image index (0 to ${processedFiles.length - 1}) provides the clearest front-facing product identity photo suitable as the main thumbnail?
5. Do NOT invent or hallucinate dates or quantities. If not visible in any image, return null.

You MUST respond with ONLY a valid JSON object matching this schema:
{
  "name": "Organic Whole Milk",
  "category": "Dairy",
  "quantity": 1,
  "unit": "L",
  "expiryDate": "2026-09-24",
  "bestBeforeDate": null,
  "manufacturingDate": null,
  "shelfLifeDays": null,
  "primaryImageIndex": 0,
  "confidence": {
    "name": 0.95,
    "category": 0.9,
    "quantity": 0.95,
    "unit": 0.95,
    "expiryDate": 0.9
  },
  "viewsIdentified": [
    { "index": 0, "panel": "front", "notes": "Brand name and category" }
  ]
}`;

    // Construct message content with text prompt and all images
    const userContent: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [
      {
        type: "text",
        text: `Analyze these ${processedFiles.length} photo view(s) of the same physical product. Synthesize all views into ONE unified product record.`,
      },
      ...processedFiles.map((pf) => ({
        type: "image_url" as const,
        image_url: {
          url: `data:${pf.fileType};base64,${pf.base64}`,
        },
      })),
    ];

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured.");
    }

    const callGroq = async (useJsonMode: boolean) => {
      return await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        ...(useJsonMode ? { response_format: { type: "json_object" as const } } : {}),
        temperature: 0,
        max_tokens: 800,
        stream: false,
        reasoning_effort: "none",
      } as unknown as Parameters<typeof groq.chat.completions.create>[0]);
    };

    let response: import("groq-sdk/resources/chat/completions").ChatCompletion;
    try {
      response = (await callGroq(true)) as import("groq-sdk/resources/chat/completions").ChatCompletion;
    } catch (primaryErr: unknown) {
      const err = primaryErr as { message?: string; code?: string; status?: number };
      // If Groq's proxy json_validate_failed triggers, fallback to raw completion and parse with extractJson
      if (
        err?.message?.includes("json_validate_failed") ||
        err?.code === "json_validate_failed" ||
        err?.status === 400
      ) {
        try {
          response = (await callGroq(false)) as import("groq-sdk/resources/chat/completions").ChatCompletion;
        } catch (fallbackErr) {
          const message =
            fallbackErr instanceof Error ? fallbackErr.message : "The label scanning service is unavailable.";
          throw new Error(`Multi-view label scanning failed: ${message}`);
        }
      } else {
        const message =
          primaryErr instanceof Error ? primaryErr.message : "The label scanning service is unavailable.";
        throw new Error(`Multi-view label scanning failed: ${message}`);
      }
    }

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned no product information.");
    }

    const cleaned = extractJson(content);
    const parsed = JSON.parse(cleaned);
    const result = labelExtractionSchema.parse(parsed);

    // Designate primary thumbnail and auxiliary views
    const primaryIdx =
      result.primaryImageIndex != null &&
      result.primaryImageIndex >= 0 &&
      result.primaryImageIndex < savedImageUrls.length
        ? result.primaryImageIndex
        : 0;

    const primaryImageUrl = savedImageUrls[primaryIdx] ?? null;
    const additionalImageUrls = savedImageUrls.filter((_, idx) => idx !== primaryIdx);

    const resolvedExpiry = resolveExpiryProvenance(result);

    return {
      ...result,
      expiryDate: resolvedExpiry.expiryDate,
      expiryType: resolvedExpiry.expiryType,
      isEstimated: resolvedExpiry.isEstimated,
      daysEstimated: resolvedExpiry.daysEstimated,
      primaryImageIndex: primaryIdx,
      imageUrl: primaryImageUrl,
      additionalImageUrls,
    };
  } catch (err) {
    // If AI processing, network, or schema parsing fails, clean up the stored images to prevent orphans
    if (savedImageUrls.length > 0) {
      console.warn("[Storage Lifecycle] AI extraction failed; cleaning up uploaded images:", savedImageUrls);
      await deleteProductImages(savedImageUrls);
    }
    throw new Error(
      err instanceof Error
        ? err.message
        : "Multi-view label scanning failed: " + String(err)
    );
  }
}

/**
 * Server action to clean up uploaded images when a user discards or cancels a scan review.
 * Only deletes ShelfLife-owned images that are unreferenced by existing persisted inventory items.
 */
export async function discardUploadedImagesAction(
  imageUrls: string[]
): Promise<{ success: boolean; deletedCount: number }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, deletedCount: 0 };
  }

  const deletedCount = await safeDeleteUnreferencedImages(imageUrls, []);
  return { success: true, deletedCount };
}

/**
 * Backwards-compatible single-image or multi-file wrapper.
 */
export async function extractLabelAction(formData: FormData): Promise<LabelExtraction> {
  return extractMultiViewLabelAction(formData);
}

function getImageTypeFromName(name: string) {
  const extension = name.toLowerCase().split(".").pop();
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return "";
}

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
