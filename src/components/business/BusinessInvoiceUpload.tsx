"use client";

import { useState, useMemo } from "react";

import { extractInvoiceAction } from "@/lib/actions/invoice";
import { importBusinessInventory } from "@/lib/actions/business-inventory";

type InvoiceItem = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

export default function BusinessInvoiceUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stats = useMemo(() => {
    if (items.length === 0) return null;

    const detectedCount = items.length;
    const presentCount = items.filter((item) =>
      existingNames.includes(item.name.toLowerCase().trim())
    ).length;
    const newCount = Math.max(0, detectedCount - presentCount);

    const expiringCount = items.filter((item) => {
      if (!item.expiryDate || !item.expiryDate.trim()) return false;
      const dateStr = item.expiryDate.trim();
      let dateObj: Date | null = null;

      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split("-").map(Number);
        dateObj = new Date(year, month - 1, day);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split("-").map(Number);
        dateObj = new Date(year, month - 1, day);
      } else {
        dateObj = new Date(dateStr);
      }

      if (!dateObj || isNaN(dateObj.getTime())) return false;

      const threshold = new Date();
      threshold.setDate(threshold.getDate() + 7);
      threshold.setHours(23, 59, 59, 999);

      return dateObj <= threshold;
    }).length;

    return {
      detectedCount,
      newCount,
      presentCount,
      expiringCount,
    };
  }, [items, existingNames]);

  async function handleExtract() {
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setItems([]);
    setExistingNames([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await extractInvoiceAction(formData);

      setItems(result.items);
      if (result.existingNames) {
        setExistingNames(result.existingNames);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Invoice extraction failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateItem(
    index: number,
    field: keyof InvoiceItem,
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (field === "quantity") {
          return {
            ...item,
            quantity: Number(value),
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function handleImport() {
    setError("");
    setSuccess("");

    if (items.length === 0) {
      setError("There are no products to import.");
      return;
    }

    const missingExpiry = items.some(
      (item) => !item.expiryDate,
    );

    if (missingExpiry) {
      setError(
        "Please add an expiry date to every product before importing.",
      );
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.name.trim() ||
        !item.category.trim() ||
        !item.unit.trim() ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0,
    );

    if (invalidItem) {
      setError(
        "Please check all product information before importing.",
      );
      return;
    }

    setImporting(true);

    try {
      const result = await importBusinessInventory(
        items.map((item) => ({
          name: item.name.trim(),
          category: item.category.trim(),
          quantity: item.quantity,
          unit: item.unit.trim(),
          expiryDate: new Date(item.expiryDate!),
        })),
      );

      setSuccess(
        `Successfully imported ${result.count} products.`,
      );

      setItems([]);
      setFile(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to import products.",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-8 shadow-sm">
        <div className="rounded-2xl border-2 border-dashed border-[var(--shelf-border)] p-10 text-center">
          <h2 className="text-lg font-semibold text-[var(--shelf-dark)]">
            Upload an invoice
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--shelf-muted)]">
            Upload a JPG or PNG invoice and ShelfLife
            will extract the products automatically.
          </p>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={(event) => {
              setFile(
                event.target.files?.[0] ?? null,
              );

              setItems([]);
              setExistingNames([]);
              setError("");
              setSuccess("");
            }}
            className="mt-6 block text-sm"
          />

          {file && (
            <div className="mt-6">
              <p className="text-sm font-medium">
                {file.name}
              </p>

              <button
                type="button"
                onClick={handleExtract}
                disabled={loading}
                className="mt-5 rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Extracting..."
                  : "Extract Products"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl bg-[var(--shelf-terracotta)]/10 border border-[var(--shelf-terracotta)]/20 px-4 py-3 text-sm text-[var(--shelf-terracotta)]">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-[var(--shelf-forest)]/10 border border-[var(--shelf-forest)]/20 px-4 py-3 text-sm text-[var(--shelf-forest)]">
          {success}
        </div>
      )}

      {/* Preview */}
      {items.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-sm">
          <div className="border-b border-[var(--shelf-border)] p-6 space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Review Extracted Products
                </h2>

                <p className="mt-1 text-sm text-[var(--shelf-muted)]">
                  Check the information before adding
                  anything to your inventory.
                </p>
              </div>

              <span className="w-fit rounded-full bg-[var(--shelf-forest)]/10 px-3 py-1 text-sm text-[var(--shelf-forest)]">
                {items.length} products
              </span>
            </div>

            {stats && (
              <div className="rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 text-xs space-y-2">
                <h4 className="font-bold text-[var(--shelf-dark)] uppercase tracking-wider">
                  Invoice Intelligence Analysis
                </h4>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4 pt-1 text-center">
                  <div className="bg-[var(--shelf-cream)]/45 p-2.5 rounded-lg border border-[var(--shelf-border)]/50">
                    <span className="block text-[10px] font-bold text-[var(--shelf-muted)] uppercase">Detected</span>
                    <span className="block text-sm font-extrabold text-[var(--shelf-dark)] mt-0.5">{stats.detectedCount} products</span>
                  </div>
                  <div className="bg-[var(--shelf-cream)]/45 p-2.5 rounded-lg border border-[var(--shelf-border)]/50">
                    <span className="block text-[10px] font-bold text-[var(--shelf-muted)] uppercase">New Items</span>
                    <span className="block text-sm font-extrabold text-[var(--shelf-forest)] mt-0.5">{stats.newCount} products</span>
                  </div>
                  <div className="bg-[var(--shelf-cream)]/45 p-2.5 rounded-lg border border-[var(--shelf-border)]/50">
                    <span className="block text-[10px] font-bold text-[var(--shelf-muted)] uppercase">Existing</span>
                    <span className="block text-sm font-extrabold text-[var(--shelf-blue)] mt-0.5">{stats.presentCount} products</span>
                  </div>
                  <div className="bg-[var(--shelf-cream)]/45 p-2.5 rounded-lg border border-[var(--shelf-border)]/50">
                    <span className="block text-[10px] font-bold text-[var(--shelf-muted)] uppercase">Near Expiry / Expired</span>
                    <span className="block text-sm font-extrabold text-[var(--shelf-terracotta)] mt-0.5">{stats.expiringCount} products</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-[var(--shelf-border)]">
                <tr>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--shelf-muted)]">
                    Product
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--shelf-muted)]">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--shelf-muted)]">
                    Quantity
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--shelf-muted)]">
                    Unit
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--shelf-muted)]">
                    Expiry
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-[var(--shelf-muted)]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={`${item.name}-${index}`}
                    className="border-b border-[var(--shelf-border)] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <input
                        value={item.name}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "name",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        value={item.category}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "category",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "quantity",
                            event.target.value,
                          )
                        }
                        className="w-24 rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        value={item.unit}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "unit",
                            event.target.value,
                          )
                        }
                        className="w-28 rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="date"
                        value={item.expiryDate ?? ""}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "expiryDate",
                            event.target.value,
                          )
                        }
                        className="rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />

                      {!item.expiryDate && (
                        <p className="mt-1 text-xs text-[var(--shelf-amber)]">
                          Required
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-sm font-medium text-[var(--shelf-terracotta)] hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4 border-t border-[var(--shelf-border)] p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--shelf-muted)]">
              AI-generated information should be reviewed
              before importing.
            </p>

            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="rounded-xl bg-[var(--shelf-forest)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing
                ? "Importing..."
                : `Import ${items.length} Products`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}