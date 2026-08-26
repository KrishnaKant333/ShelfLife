import {
  inventoryImportSchema,
  type InventoryImportItem,
} from "./inventory-schema";

export type ParsedInventoryRow = {
  row: number;
  data?: InventoryImportItem;
  error?: string;
};

export function parseInventoryCsv(
  csv: string,
): ParsedInventoryRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [
      {
        row: 1,
        error: "CSV must contain a header and at least one product.",
      },
    ];
  }

  const headers = lines[0]
    .split(",")
    .map((header) => header.trim());

  const requiredHeaders = [
    "name",
    "category",
    "quantity",
    "unit",
    "expiryDate",
  ];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header),
  );

  if (missingHeaders.length > 0) {
    return [
      {
        row: 1,
        error: `Missing columns: ${missingHeaders.join(", ")}`,
      },
    ];
  }

  return lines.slice(1).map((line, index) => {
    const values = line.split(",").map((value) => value.trim());

    const raw = Object.fromEntries(
      headers.map((header, i) => [
        header,
        values[i] ?? "",
      ]),
    );

    const result =
      inventoryImportSchema.safeParse(raw);

    if (!result.success) {
      return {
        row: index + 2,
        error:
          result.error.issues[0]?.message ??
          "Invalid row.",
      };
    }

    return {
      row: index + 2,
      data: result.data,
    };
  });
}