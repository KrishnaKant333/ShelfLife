import { z } from "zod";
import { parseFlexibleDate } from "@/lib/normalization";

const optionalExpiryDate = z.preprocess(
  (value) => parseFlexibleDate(value),
  z.date({ message: "Please enter a valid expiry date" }).nullable(),
);

export const inventoryImportSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(100, "Product name is too long"),

  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category is too long"),

  quantity: z.coerce
    .number()
    .finite("Quantity must be a valid number")
    .positive("Quantity must be greater than 0"),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(30, "Unit is too long"),

  expiryDate: optionalExpiryDate,
  expiryType: z.string().trim().nullable().optional(),
});

export type InventoryImportItem = z.infer<
  typeof inventoryImportSchema
>;