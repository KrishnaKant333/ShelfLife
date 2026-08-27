import { z } from "zod";

export const invoiceExtractionSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.string().min(1),
      expiryDate: z.string().nullable(),
    }),
  ),
});

export type InvoiceExtraction = z.infer<
  typeof invoiceExtractionSchema
>;