import { z } from "zod";

export const invoiceExtractionSchema = z.object({
  invoiceDate: z.string().nullable().optional(),
  items: z.array(
    z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.string().min(1),
      expiryDate: z.string().nullable(),
      bestBeforeDate: z.string().nullable().optional(),
      manufacturingDate: z.string().nullable().optional(),
      shelfLifeDays: z.number().positive().nullable().optional(),
      expiryType: z.string().nullable().optional(),
      isEstimated: z.boolean().optional(),
      daysEstimated: z.number().optional(),
    }),
  ),
});

export type InvoiceExtraction = z.infer<
  typeof invoiceExtractionSchema
>;