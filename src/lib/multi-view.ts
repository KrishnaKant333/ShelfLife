import { z } from "zod";

export const labelExtractionSchema = z.object({
  name: z.string().nullable(),
  category: z.string().nullable(),
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  expiryDate: z.string().nullable(),
  bestBeforeDate: z.string().nullable().optional(),
  manufacturingDate: z.string().nullable().optional(),
  shelfLifeDays: z.number().positive().nullable().optional(),
  primaryImageIndex: z.number().int().nonnegative().optional().default(0),
  imageUrl: z.string().nullable().optional(),
  additionalImageUrls: z.array(z.string()).optional().default([]),
  confidence: z
    .object({
      name: z.number().optional(),
      category: z.number().optional(),
      quantity: z.number().optional(),
      unit: z.number().optional(),
      expiryDate: z.number().optional(),
    })
    .optional(),
  viewsIdentified: z
    .array(
      z.object({
        index: z.number(),
        panel: z.string(),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

export type LabelExtraction = z.infer<typeof labelExtractionSchema>;
export type MultiViewExtraction = LabelExtraction;

/**
 * Progressively merges an existing extraction with a newly captured view.
 * Preserves high-confidence existing fields and enriches missing fields.
 */
export function accumulateExtractions(
  previous: Partial<LabelExtraction> | null,
  next: Partial<LabelExtraction>
): LabelExtraction {
  if (!previous) {
    return {
      name: next.name ?? null,
      category: next.category ?? null,
      quantity: next.quantity ?? null,
      unit: next.unit ?? null,
      expiryDate: next.expiryDate ?? null,
      bestBeforeDate: next.bestBeforeDate ?? null,
      manufacturingDate: next.manufacturingDate ?? null,
      shelfLifeDays: next.shelfLifeDays ?? null,
      primaryImageIndex: next.primaryImageIndex ?? 0,
      imageUrl: next.imageUrl ?? null,
      additionalImageUrls: next.additionalImageUrls ?? [],
      confidence: next.confidence ?? {},
      viewsIdentified: next.viewsIdentified ?? [],
    };
  }

  const prevConf = previous.confidence ?? {};
  const nextConf = next.confidence ?? {};

  // High-confidence threshold (>= 0.7)
  const isPrevNameHigh = (prevConf.name ?? 0.5) >= 0.7 && Boolean(previous.name);
  const isPrevCategoryHigh = (prevConf.category ?? 0.5) >= 0.7 && Boolean(previous.category);
  const isPrevQuantityHigh = (prevConf.quantity ?? 0.5) >= 0.7 && previous.quantity != null;
  const isPrevExpiryHigh = (prevConf.expiryDate ?? 0.5) >= 0.7 && Boolean(previous.expiryDate);

  // Combine images without duplicates
  const allImages = new Set<string>();
  if (previous.imageUrl) allImages.add(previous.imageUrl);
  if (next.imageUrl) allImages.add(next.imageUrl);
  previous.additionalImageUrls?.forEach((url) => allImages.add(url));
  next.additionalImageUrls?.forEach((url) => allImages.add(url));

  const imageList = Array.from(allImages);
  const primaryImageUrl = previous.imageUrl || next.imageUrl || imageList[0] || null;
  const additionalImageUrls = imageList.filter((url) => url !== primaryImageUrl);

  return {
    name: (isPrevNameHigh && previous.name ? previous.name : next.name ?? previous.name) ?? null,
    category: (isPrevCategoryHigh && previous.category ? previous.category : next.category ?? previous.category) ?? null,
    quantity: (isPrevQuantityHigh && previous.quantity != null ? previous.quantity : next.quantity ?? previous.quantity) ?? null,
    unit: (isPrevQuantityHigh && previous.unit ? previous.unit : next.unit ?? previous.unit) ?? null,
    expiryDate: (isPrevExpiryHigh && previous.expiryDate ? previous.expiryDate : next.expiryDate ?? previous.expiryDate) ?? null,
    bestBeforeDate: next.bestBeforeDate ?? previous.bestBeforeDate,
    manufacturingDate: next.manufacturingDate ?? previous.manufacturingDate,
    shelfLifeDays: next.shelfLifeDays ?? previous.shelfLifeDays,
    primaryImageIndex: 0,
    imageUrl: primaryImageUrl,
    additionalImageUrls,
    confidence: {
      name: Math.max(prevConf.name ?? 0, nextConf.name ?? 0),
      category: Math.max(prevConf.category ?? 0, nextConf.category ?? 0),
      quantity: Math.max(prevConf.quantity ?? 0, nextConf.quantity ?? 0),
      unit: Math.max(prevConf.unit ?? 0, nextConf.unit ?? 0),
      expiryDate: Math.max(prevConf.expiryDate ?? 0, nextConf.expiryDate ?? 0),
    },
    viewsIdentified: [
      ...(previous.viewsIdentified ?? []),
      ...(next.viewsIdentified ?? []),
    ],
  };
}
