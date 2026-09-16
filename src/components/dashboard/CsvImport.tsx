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
      {/* Upload Dropzone Card */}
      <div className="sl-editorial-card rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="rounded-2xl border-2 border-dashed border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/40 p-8 text-center transition duration-200 hover:border-[var(--app-accent-emerald)] md:p-12 relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--app-accent-emerald)] mb-4">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h2 className="sl-display-serif text-2xl font-semibold text-[var(--app-text-display)]">
            Upload CSV Spreadsheet
          </h2>
          <p className="mt-2 max-w-md mx-auto text-xs md:text-sm text-[var(--app-text-muted)] leading-relaxed">
            Ensure your columns include: <span className="font-mono text-xs text-[var(--app-text-display)] bg-[var(--app-surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--app-border-subtle)]">name</span>, <span className="font-mono text-xs text-[var(--app-text-display)] bg-[var(--app-surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--app-border-subtle)]">category</span>, <span className="font-mono text-xs text-[var(--app-text-display)] bg-[var(--app-surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--app-border-subtle)]">quantity</span>, <span className="font-mono text-xs text-[var(--app-text-display)] bg-[var(--app-surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--app-border-subtle)]">unit</span>, <span className="font-mono text-xs text-[var(--app-text-display)] bg-[var(--app-surface-elevated)] px-1.5 py-0.5 rounded border border-[var(--app-border-subtle)]">expiryDate</span>
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--app-accent-emerald)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all">
              <span>Select CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {fileName && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-4 py-2 text-xs font-semibold text-[var(--app-text-display)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {fileName}
            </div>
          )}
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div role="alert" aria-live="polite" className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div role="status" aria-live="polite" className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-500 font-medium">
          {success}
        </div>
      )}

      {/* Preview Table */}
      {rows.length > 0 && (
        <div className="sl-editorial-card rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] overflow-hidden shadow-xl">
          <div className="border-b border-[var(--app-border-subtle)] p-5 md:p-6 bg-[var(--app-surface-base)]/50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="sl-display-serif text-xl font-semibold text-[var(--app-text-display)]">
                Import Preview
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                Verify detected products and shelf life fields before saving
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[var(--app-accent-emerald)] font-bold">
                ✓ {validRows.length} valid
              </span>
              {invalidRows.length > 0 && (
                <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-red-500 font-bold">
                  ⚠ {invalidRows.length} invalid
                </span>
              )}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/30">
                <tr>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Row</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Product</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Category</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Quantity</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Expiry</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border-subtle)]">
                {rows.map((row) => (
                  <tr key={row.row} className="hover:bg-[var(--app-surface-base)]/50 transition">
                    <td className="px-5 py-3.5 font-mono text-[var(--app-text-muted)]">{row.row}</td>
                    {row.data ? (
                      <>
                        <td className="px-5 py-3.5 font-medium text-[var(--app-text-display)]">{row.data.name}</td>
                        <td className="px-5 py-3.5 text-[var(--app-text-muted)]">{row.data.category}</td>
                        <td className="px-5 py-3.5 font-medium text-[var(--app-text-display)]">{row.data.quantity} {row.data.unit}</td>
                        <td className="px-5 py-3.5 font-mono text-[var(--app-text-muted)]">{row.data.expiryDate?.toLocaleDateString() ?? "Expiry not available"}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--app-accent-emerald)] border border-emerald-500/20">
                            Valid
                          </span>
                        </td>
                      </>
                    ) : (
                      <td colSpan={5} className="px-5 py-3.5 font-medium text-red-500">
                        {row.error}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {rows.map((row) => (
              <div key={row.row} className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/50 p-3.5">
                {row.data ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--app-text-display)]">{row.data.name}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--app-text-muted)]">Row {row.row} · {row.data.category}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--app-accent-emerald)] border border-emerald-500/20">Valid</span>
                    </div>
                    <p className="text-[11px] text-[var(--app-text-muted)]">{row.data.quantity} {row.data.unit} · {row.data.expiryDate?.toLocaleDateString() ?? "Expiry not available"}</p>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-red-500">Row {row.row}: {row.error}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/40 p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <p className="text-xs text-[var(--app-text-muted)]">
              {invalidRows.length > 0 ? "Invalid rows will be skipped during import." : "All rows validated and ready to import."}
            </p>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || validRows.length === 0}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--app-accent-emerald)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? "Importing..." : `Import ${validRows.length} Products`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
