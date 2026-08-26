"use client";

import { useState } from "react";

import {
  parseInventoryCsv,
  type ParsedInventoryRow,
} from "@/lib/import/csv-parser";

import { importBusinessInventory } from "@/lib/actions/business-inventory";
import { redirect } from "next/dist/server/api-utils";

export default function BusinessCsvImport() {
  const [rows, setRows] = useState<ParsedInventoryRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
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
      setError(
        "Unable to read this CSV file.",
      );
    }
  }

  const validRows = rows.filter(
    (row) => row.data,
  );

  const invalidRows = rows.filter(
    (row) => row.error,
  );

  async function handleImport() {
    if (validRows.length === 0) {
      setError("There are no valid products to import.");
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const result =
        await importBusinessInventory(
          validRows.map((row) => row.data!),
        );

      setSuccess(
        `Successfully imported ${result.count} products.`,
      );

      setRows([]);
      setFileName("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Import failed.",
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Upload */}
      <div className="rounded-2xl border-2 border-dashed border-[var(--shelf-border)] p-10 text-center">
        <h2 className="text-lg font-semibold text-[var(--shelf-dark)]">
          Upload your CSV
        </h2>

        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Select a CSV containing your inventory.
        </p>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="cursor-pointer mt-6 block text-sm"
        />
        {fileName && (
          <p className="mt-4 text-sm font-medium text-[var(--shelf-dark)]">
            {fileName}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Results */}
      {rows.length > 0 && (
        <div className="rounded-2xl bg-[var(--shelf-surface)] shadow-xl">

          <div className="border-b border-[var(--shelf-border)] p-6">
            <h2 className="text-xl font-semibold text-[var(--shelf-dark)]">
              Import Preview
            </h2>

            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                ✓ {validRows.length} valid
              </span>

              {invalidRows.length > 0 && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                  ⚠ {invalidRows.length} invalid
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-[var(--shelf-border)]">
                <tr>
                  <th className="px-6 py-4 text-xs text-[var(--shelf-muted)]">
                    Row
                  </th>

                  <th className="px-6 py-4 text-xs text-[var(--shelf-muted)]">
                    Product
                  </th>

                  <th className="px-6 py-4 text-xs text-[var(--shelf-muted)]">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs text-[var(--shelf-muted)]">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-xs text-[var(--shelf-muted)]">
                    Expiry
                  </th>

                  <th className="px-6 py-4 text-xs text-[var(--shelf-muted)]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.row}
                    className="border-b border-[var(--shelf-border)] last:border-0"
                  >
                    <td className="px-6 py-4 text-sm">
                      {row.row}
                    </td>

                    {row.data ? (
                      <>
                        <td className="px-6 py-4 text-sm font-medium">
                          {row.data.name}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {row.data.category}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {row.data.quantity}{" "}
                          {row.data.unit}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {row.data.expiryDate.toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-sm text-green-700">
                          Valid
                        </td>
                      </>
                    ) : (
                      <td
                        colSpan={5}
                        className="px-6 py-4 text-sm text-red-700"
                      >
                        {row.error}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Import button */}
          {validRows.length > 0 && (
            <div className="flex items-center justify-between border-t border-[var(--shelf-border)] p-6">
              <p className="text-sm text-[var(--shelf-muted)]">
                {invalidRows.length > 0
                  ? "Invalid rows will not be imported."
                  : "All rows are ready to import."}
              </p>

              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importing
                  ? "Importing..."
                  : `Import ${validRows.length} Products`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}