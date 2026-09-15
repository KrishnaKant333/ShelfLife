"use server";

import { extractInvoiceFromImage } from "@/lib/invoice/extract-invoice";
import { auth } from "@/auth";
import { getInventory } from "@/lib/inventory";
import { getBusinessInventory } from "@/lib/business-inventory";
import { resolveExpiryProvenance } from "@/lib/expiry";
import { normalizeProductName } from "@/lib/inventory-merge";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
];

export async function extractInvoiceAction(
  formData: FormData,
) {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Please upload an invoice.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Only JPG and PNG invoices are supported right now.",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Invoice image must be smaller than 20MB.",
    );
  }

  const buffer = Buffer.from(
    await file.arrayBuffer(),
  );

  const base64 = buffer.toString("base64");

  const extraction =
    await extractInvoiceFromImage(
      base64,
      file.type,
    );

  // Fetch current inventory for session
  const session = await auth();
  let currentInventory: Array<{ name: string; category?: string | null }> = [];
  if (session?.user) {
    if (session.user.accountType === "business") {
      currentInventory = await getBusinessInventory();
    } else {
      currentInventory = await getInventory();
    }
  }

  const existingNames = currentInventory.map((x) => normalizeProductName(x.name));

  const refDate = extraction.invoiceDate || new Date().toISOString().slice(0, 10);

  return {
    invoiceDate: extraction.invoiceDate ?? null,
    items: extraction.items.map((item) => {
      const resolved = resolveExpiryProvenance(
        {
          name: item.name,
          category: item.category,
          expiryDate: item.expiryDate,
          bestBeforeDate: item.bestBeforeDate,
          manufacturingDate: item.manufacturingDate,
          shelfLifeDays: item.shelfLifeDays,
        },
        refDate
      );
      return {
        ...item,
        expiryDate: resolved.expiryDate,
        expiryType: resolved.expiryType,
        isEstimated: resolved.isEstimated,
        daysEstimated: resolved.daysEstimated,
      };
    }),
    existingNames,
  };
}