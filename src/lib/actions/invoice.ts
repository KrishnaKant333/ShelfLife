"use server";

import { extractInvoiceFromImage } from "@/lib/invoice/extract-invoice";

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

  return extraction;
}