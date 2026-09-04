"use client";

import { useState } from "react";
import { parseInventoryCsv, type ParsedInventoryRow } from "@/lib/import/csv-parser";
import { importInventoryAction } from "@/lib/actions/inventory";

export default function CsvImport() {
  const [rows, setRows] = useState<ParsedInventoryRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");
    setRows([]);
    setFileName(file.name);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseInventoryCsv(text);
      setRows(parsed);
    } catch {
      setError("Unable to read this CSV file.");
    }
  }

  const validRows = rows.filter((row) => row.data);
  const invalidRows = rows.filter((row) => row.error);

  async function handleImport() {
    if (validRows.length === 0) {
      setError("There are no valid products to import.");
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const result = await importInventoryAction(
        validRows.map((row) => ({
          name: row.data!.name,
          category: row.data!.category,
          quantity: row.data!.quantity,
          unit: row.data!.unit,
          expiryDate: row.data!.expiryDate,
        }))
      );

      setSuccess(`Successfully imported ${result.count} products.`);
      setRows([]);
      setFileName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-8 shadow-sm">
        <div className="rounded-2xl border-2 border-dashed border-[var(--shelf-border)] p-10 text-center hover:border-[var(--shelf-sage)] transition duration-200">
          <h2 className="text-lg font-semibold text-[var(--shelf-dark)]">
            Upload your CSV File
          </h2>
          <p className="mt-2 text-sm text-[var(--shelf-muted)]">
            Ensure your columns are: name, category, quantity, unit, expiryDate
          </p>

          <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90">
            <span>Select File</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {fileName && (
            <p className="mt-4 text-sm font-medium text-[var(--shelf-dark)] bg-[var(--shelf-cream)] inline-block px-3 py-1 rounded-lg">
              {fileName}
            </p>
          )}
        </div>
      </div>

      {/* Error & Success Messages */}
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

      {/* Preview Table */}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] overflow-hidden shadow-sm">
          <div className="border-b border-[var(--shelf-border)] p-6 bg-[var(--shelf-cream)]/50">
            <h2 className="text-xl font-semibold text-[var(--shelf-dark)]">
              Import Preview
            </h2>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-[var(--shelf-forest)]/10 border border-[var(--shelf-forest)]/20 px-3 py-1 text-[var(--shelf-forest)] font-medium">
                ✓ {validRows.length} valid
              </span>
              {invalidRows.length > 0 && (
                <span className="rounded-full bg-[var(--shelf-terracotta)]/10 border border-[var(--shelf-terracotta)]/20 px-3 py-1 text-[var(--shelf-terracotta)] font-medium">
                  ⚠ {invalidRows.length} invalid
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Row</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Product</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Category</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Quantity</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Expiry</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--shelf-muted)]">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.row} className="border-b border-[var(--shelf-border)] last:border-0 hover:bg-[var(--shelf-cream)]/10">
                    <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">{row.row}</td>
                    {row.data ? (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-[var(--shelf-dark)]">{row.data.name}</td>
                        <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">{row.data.category}</td>
                        <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">{row.data.quantity} {row.data.unit}</td>
                        <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">{row.data.expiryDate.toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-[var(--shelf-forest)] font-medium">Valid</td>
                      </>
                    ) : (
                      <td colSpan={5} className="px-6 py-4 text-sm text-[var(--shelf-terracotta)] font-medium">
                        {row.error}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--shelf-border)] p-6 bg-[var(--shelf-cream)]/30">
            <p className="text-sm text-[var(--shelf-muted)]">
              {invalidRows.length > 0 ? "Invalid rows will be skipped during import." : "All rows are ready to import."}
            </p>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || validRows.length === 0}
              className="rounded-xl bg-[var(--shelf-forest)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? "Importing..." : `Import ${validRows.length} Products`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
