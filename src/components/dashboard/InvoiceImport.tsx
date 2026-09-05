"use client";

import { useState } from "react";
import { extractInvoiceAction } from "@/lib/actions/invoice";
import { importInventoryAction } from "@/lib/actions/inventory";

type InvoiceItem = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

export default function InvoiceImport() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [stats, setStats] = useState<{
    detectedCount: number;
    newCount: number;
    presentCount: number;
    expiringCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleExtract() {
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setItems([]);
    setStats(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await extractInvoiceAction(formData);
      setItems(result.items);
      setStats(result.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invoice extraction failed.");
    } finally {
      setLoading(false);
    }
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

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
      })
    );
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleImport() {
    setError("");
    setSuccess("");

    if (items.length === 0) {
      setError("There are no products to import.");
      return;
    }

    const missingExpiry = items.some((item) => !item.expiryDate);
    if (missingExpiry) {
      setError("Please add an expiry date to every product before importing.");
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.name.trim() ||
        !item.category.trim() ||
        !item.unit.trim() ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
    );

    if (invalidItem) {
      setError("Please check all product information before importing.");
      return;
    }

    setImporting(true);

    try {
      const result = await importInventoryAction(
        items.map((item) => ({
          name: item.name.trim(),
          category: item.category.trim(),
          quantity: item.quantity,
          unit: item.unit.trim(),
          expiryDate: new Date(item.expiryDate!),
        }))
      );

      setSuccess(`Successfully imported ${result.count} products.`);
      setItems([]);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import products.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Panel */}
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 shadow-sm md:p-8">
        <div className="rounded-2xl border-2 border-dashed border-[var(--shelf-border)] p-6 text-center transition duration-200 hover:border-[var(--shelf-sage)] md:p-10">
          <h2 className="text-lg font-semibold text-[var(--shelf-dark)]">
            Upload an Invoice Image
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--shelf-muted)]">
            Upload a JPG or PNG invoice, and ShelfLife will extract products automatically.
          </p>

          <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90">
            <span>Select Invoice</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setItems([]);
                  setStats(null);
                  setError("");
                  setSuccess("");
                }}
                className="sr-only"
              />
          </label>

          {file && (
            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium text-[var(--shelf-dark)] bg-[var(--shelf-cream)] inline-block px-3 py-1 rounded-lg">
                {file.name}
              </p>
              <div>
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={loading}
                  className="rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Extracting..." : "Extract Products"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div role="alert" aria-live="polite" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" aria-live="polite" className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Extracted Review Section */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] overflow-hidden shadow-sm">
          <div className="border-b border-[var(--shelf-border)] p-6 bg-[var(--shelf-cream)]/50 space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-[var(--shelf-dark)]">
                  Review Extracted Products
                </h2>
                <p className="mt-1 text-sm text-[var(--shelf-muted)]">
                  Verify and edit the AI-extracted fields before importing.
                </p>
              </div>
              <span className="w-fit rounded-full bg-green-100 border border-green-200 px-3 py-1 text-sm font-semibold text-green-800">
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
                    <span className="block text-[10px] font-bold text-[var(--shelf-muted)] uppercase">Near Expiry</span>
                    <span className="block text-sm font-extrabold text-[var(--shelf-terracotta)] mt-0.5">{stats.expiringCount} products</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30">
                <tr>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Product</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Category</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Quantity</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Unit</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Expiry</th>
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={`${item.name}-${index}`} className="border-b border-[var(--shelf-border)] last:border-0 hover:bg-[var(--shelf-cream)]/10">
                    <td className="px-5 py-4">
                      <input
                        value={item.name}
                        onChange={(event) => updateItem(index, "name", event.target.value)}
                        className="w-full rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        value={item.category}
                        onChange={(event) => updateItem(index, "category", event.target.value)}
                        className="w-full rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => updateItem(index, "quantity", event.target.value)}
                        className="w-24 rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        value={item.unit}
                        onChange={(event) => updateItem(index, "unit", event.target.value)}
                        className="w-28 rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="date"
                        value={item.expiryDate ?? ""}
                        onChange={(event) => updateItem(index, "expiryDate", event.target.value)}
                        className="rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shelf-forest)]"
                      />
                      {!item.expiryDate && (
                        <p className="mt-1 text-xs text-amber-600 font-medium">⚠ Date required</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-sm font-semibold text-red-600 hover:text-red-800 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="space-y-3 rounded-xl border border-[var(--shelf-border)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--shelf-muted)]">Product {index + 1}</p>
                  <button type="button" onClick={() => removeItem(index)} className="text-xs font-semibold text-red-600">Remove</button>
                </div>
                <label className="block text-xs font-semibold text-[var(--shelf-dark)]">
                  Product name
                  <input value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} className="sl-focus-ring mt-1 w-full rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2.5 text-sm" />
                </label>
                <label className="block text-xs font-semibold text-[var(--shelf-dark)]">
                  Category
                  <input value={item.category} onChange={(event) => updateItem(index, "category", event.target.value)} className="sl-focus-ring mt-1 w-full rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2.5 text-sm" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-[var(--shelf-dark)]">
                    Quantity
                    <input type="number" min="1" inputMode="decimal" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} className="sl-focus-ring mt-1 w-full rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2.5 text-sm" />
                  </label>
                  <label className="block text-xs font-semibold text-[var(--shelf-dark)]">
                    Unit
                    <input value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} className="sl-focus-ring mt-1 w-full rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2.5 text-sm" />
                  </label>
                </div>
                <label className="block text-xs font-semibold text-[var(--shelf-dark)]">
                  Expiry date
                  <input type="date" value={item.expiryDate ?? ""} onChange={(event) => updateItem(index, "expiryDate", event.target.value)} className="sl-focus-ring mt-1 w-full rounded-lg border border-[var(--shelf-border)] bg-transparent px-3 py-2.5 text-sm" />
                </label>
                {!item.expiryDate && <p className="text-xs font-medium text-amber-600">Expiry is not available from the invoice.</p>}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--shelf-border)] p-6 bg-[var(--shelf-cream)]/30 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--shelf-muted)]">
              AI-generated information should be reviewed and edited if necessary before importing.
            </p>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="rounded-xl bg-[var(--shelf-forest)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? "Importing..." : `Import ${items.length} Products`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
