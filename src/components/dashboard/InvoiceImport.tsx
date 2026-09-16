"use client";

import { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { extractInvoiceAction } from "@/lib/actions/invoice";
import { importInventoryAction } from "@/lib/actions/inventory";
import { isIntegerUnit } from "@/lib/normalization";

type InvoiceItem = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  expiryType?: string | null;
  isEstimated?: boolean;
  daysEstimated?: number;
};

export default function InvoiceImport() {
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
      existingNames.includes(item.name.toLowerCase().trim().replace(/\s+/g, " "))
    ).length;
    const newCount = Math.max(0, detectedCount - presentCount);

    const expiringCount = items.filter((item) => {
      if (!item.expiryDate || !item.expiryDate.trim()) return false;
      const dateStr = item.expiryDate.trim();
      let dateObj: Date | null = null;

      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split("-").map(Number);
        dateObj = new Date(year, month - 1, day);
      } else {
        dateObj = new Date(dateStr);
      }

      if (!dateObj || Number.isNaN(dateObj.getTime())) return false;
      const now = new Date();
      const diffMs = dateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return diffDays <= 3;
    }).length;

    return {
      detectedCount,
      newCount,
      presentCount,
      expiringCount,
    };
  }, [items, existingNames]);

  async function handleExtract() {
    if (!file) {
      setError("Please select an invoice image first.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await extractInvoiceAction(formData);
      setItems(result.items);
      if (result.existingNames) {
        setExistingNames(result.existingNames);
      }
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

        if (field === "expiryDate") {
          return {
            ...item,
            expiryDate: value ? value : null,
            expiryType: value ? "MANUFACTURER_EXPIRY" : "UNKNOWN",
            isEstimated: false,
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
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          expiryType: item.expiryType ?? (item.expiryDate ? (item.isEstimated ? "AI_ESTIMATED" : "MANUFACTURER_EXPIRY") : "UNKNOWN"),
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
      {/* Upload Dropzone Card */}
      <div className="sl-editorial-card rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="rounded-2xl border-2 border-dashed border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/40 p-8 text-center transition duration-200 hover:border-[var(--app-accent-emerald)] md:p-12 relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--app-accent-emerald)] mb-4">
            <Sparkles size={28} />
          </div>

          <h2 className="sl-display-serif text-2xl font-semibold text-[var(--app-text-display)]">
            Upload Invoice or Receipt
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-xs md:text-sm text-[var(--app-text-muted)] leading-relaxed">
            Upload a JPG or PNG photo of a supplier invoice, bill, or receipt. ShelfLife vision AI will auto-extract products, quantities, and freshness dates.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--app-accent-emerald)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all">
              <span>Select Invoice Image</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setItems([]);
                  setExistingNames([]);
                  setError("");
                  setSuccess("");
                }}
                className="sr-only"
              />
            </label>
          </div>

          {file && (
            <div className="mt-6 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-4 py-2 text-xs font-semibold text-[var(--app-text-display)]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {file.name}
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Sparkles size={14} className="animate-spin" />
                      Extracting Products...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Extract Products
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div role="alert" aria-live="polite" className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div role="status" aria-live="polite" className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-500 font-medium">
          {success}
        </div>
      )}

      {/* Extracted Review Section */}
      {items.length > 0 && (
        <div className="sl-editorial-card rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] overflow-hidden shadow-xl">
          <div className="border-b border-[var(--app-border-subtle)] p-5 md:p-6 bg-[var(--app-surface-base)]/50 space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="sl-display-serif text-xl font-semibold text-[var(--app-text-display)]">
                  Review Extracted Products
                </h2>
                <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                  Verify and edit the AI-extracted fields before importing into your inventory.
                </p>
              </div>
              <span className="w-fit rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--app-accent-emerald)]">
                {items.length} products
              </span>
            </div>

            {stats && (
              <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-4 text-xs space-y-2">
                <h4 className="font-bold text-[var(--app-text-muted)] uppercase tracking-wider text-[10px]">
                  Invoice Intelligence Breakdown
                </h4>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4 pt-1 text-center">
                  <div className="bg-[var(--app-surface-base)]/60 p-2.5 rounded-lg border border-[var(--app-border-subtle)]">
                    <span className="block text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">Detected</span>
                    <span className="block text-sm font-extrabold text-[var(--app-text-display)] mt-0.5">{stats.detectedCount} products</span>
                  </div>
                  <div className="bg-[var(--app-surface-base)]/60 p-2.5 rounded-lg border border-[var(--app-border-subtle)]">
                    <span className="block text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">New Items</span>
                    <span className="block text-sm font-extrabold text-[var(--app-accent-emerald)] mt-0.5">{stats.newCount} products</span>
                  </div>
                  <div className="bg-[var(--app-surface-base)]/60 p-2.5 rounded-lg border border-[var(--app-border-subtle)]">
                    <span className="block text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">Existing</span>
                    <span className="block text-sm font-extrabold text-blue-500 mt-0.5">{stats.presentCount} products</span>
                  </div>
                  <div className="bg-[var(--app-surface-base)]/60 p-2.5 rounded-lg border border-[var(--app-border-subtle)]">
                    <span className="block text-[9px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">Near Expiry</span>
                    <span className="block text-sm font-extrabold text-amber-500 mt-0.5">{stats.expiringCount} products</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/30">
                <tr>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Product</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Category</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Quantity</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Unit</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Expiry</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border-subtle)]">
                {items.map((item, index) => (
                  <tr key={`${item.name}-${index}`} className="hover:bg-[var(--app-surface-base)]/50 transition">
                    <td className="px-5 py-3.5">
                      <input
                        value={item.name}
                        onChange={(event) => updateItem(index, "name", event.target.value)}
                        className="w-full rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-3 py-1.5 text-xs text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        value={item.category}
                        onChange={(event) => updateItem(index, "category", event.target.value)}
                        className="w-full rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-3 py-1.5 text-xs text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        type="number"
                        min={isIntegerUnit(item.unit) ? "1" : "0.0001"}
                        step={isIntegerUnit(item.unit) ? "1" : "any"}
                        inputMode={isIntegerUnit(item.unit) ? "numeric" : "decimal"}
                        value={item.quantity}
                        onChange={(event) => updateItem(index, "quantity", event.target.value)}
                        className="w-24 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-3 py-1.5 text-xs text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <input
                        value={item.unit}
                        onChange={(event) => updateItem(index, "unit", event.target.value)}
                        className="w-28 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-3 py-1.5 text-xs text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={item.expiryDate ?? ""}
                            onChange={(event) => updateItem(index, "expiryDate", event.target.value)}
                            className={`rounded-lg border bg-[var(--app-surface-base)] px-3 py-1.5 text-xs font-mono text-[var(--app-text-display)] outline-none transition ${
                              item.isEstimated
                                ? "border-amber-400/80 bg-amber-500/5 focus:border-amber-500"
                                : "border-[var(--app-border-subtle)] focus:border-[var(--app-accent-emerald)]"
                            }`}
                          />
                          {item.isEstimated && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/20 whitespace-nowrap cursor-help"
                              title={`Estimated based on standard grocery shelf life for ${item.category || "this product"}. Tap date to adjust.`}
                            >
                              <Sparkles size={10} className="shrink-0" />
                              Estimated ✦
                            </span>
                          )}
                        </div>
                        {!item.expiryDate ? (
                          <p className="text-[10px] font-medium text-[var(--app-text-muted)]">Date Not Available</p>
                        ) : item.isEstimated ? (
                          <p className="text-[10px] text-amber-500/90">
                            Category estimate (+{item.daysEstimated ?? 7}d). Tap date to edit.
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-xs font-semibold text-red-500 hover:text-red-400 transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="space-y-3 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/50 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Product {index + 1}</p>
                  <button type="button" onClick={() => removeItem(index)} className="text-xs font-semibold text-red-500">Remove</button>
                </div>
                <label className="block text-xs font-semibold text-[var(--app-text-display)]">
                  Product name
                  <input value={item.name} onChange={(event) => updateItem(index, "name", event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--app-border-subtle)] bg-transparent px-3 py-2 text-xs" />
                </label>
                <label className="block text-xs font-semibold text-[var(--app-text-display)]">
                  Category
                  <input value={item.category} onChange={(event) => updateItem(index, "category", event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--app-border-subtle)] bg-transparent px-3 py-2 text-xs" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-[var(--app-text-display)]">
                    Quantity
                    <input
                      type="number"
                      min={isIntegerUnit(item.unit) ? "1" : "0.0001"}
                      step={isIntegerUnit(item.unit) ? "1" : "any"}
                      inputMode={isIntegerUnit(item.unit) ? "numeric" : "decimal"}
                      value={item.quantity}
                      onChange={(event) => updateItem(index, "quantity", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--app-border-subtle)] bg-transparent px-3 py-2 text-xs"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[var(--app-text-display)]">
                    Unit
                    <input value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} className="mt-1 w-full rounded-lg border border-[var(--app-border-subtle)] bg-transparent px-3 py-2 text-xs" />
                  </label>
                </div>
                <label className="block text-xs font-semibold text-[var(--app-text-display)]">
                  <div className="flex items-center justify-between">
                    <span>Expiry date</span>
                    {item.isEstimated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                        <Sparkles size={10} />
                        Estimated ✦
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={item.expiryDate ?? ""}
                    onChange={(event) => updateItem(index, "expiryDate", event.target.value)}
                    className={`mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-xs ${
                      item.isEstimated ? "border-amber-400/80 bg-amber-500/5" : "border-[var(--app-border-subtle)]"
                    }`}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--app-border-subtle)] p-5 md:p-6 bg-[var(--app-surface-base)]/40 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--app-text-muted)]">
              AI-generated information should be reviewed and edited if necessary before importing.
            </p>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--app-accent-emerald)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? "Importing..." : `Import ${items.length} Products`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
