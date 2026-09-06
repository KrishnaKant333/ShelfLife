"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  Printer,
  ArrowLeft,
  Filter,
  FileSpreadsheet,
  FileText,
  Loader2,
} from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";
import { ToastProvider, useToast } from "@/components/ui/Toast";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  createdAt: string;
};

interface ExportInventoryViewProps {
  inventory: InventoryItem[];
  isBusiness?: boolean;
}

function ExportInventoryViewInner({
  inventory,
  isBusiness = false,
}: ExportInventoryViewProps) {
  const { showToast } = useToast();
  const [activeScope, setActiveScope] = useState<"All" | "Expired" | "Expiring" | "Low Stock">("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(inventory.map((item) => item.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
      
      const matchesScope =
        activeScope === "All" ||
        (activeScope === "Expired" && status === "Expired") ||
        (activeScope === "Expiring" && status === "Expiring") ||
        (activeScope === "Low Stock" && status === "Low Stock");

      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesScope && matchesCategory;
    });
  }, [inventory, activeScope, selectedCategory]);

  const stats = useMemo(() => {
    const totalCount = filteredInventory.length;
    let expiredCount = 0;
    let expiringCount = 0;
    let lowStockCount = 0;

    filteredInventory.forEach((item) => {
      const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
      if (status === "Expired") expiredCount++;
      if (status === "Expiring") expiringCount++;
      if (status === "Low Stock") lowStockCount++;
    });

    return { totalCount, expiredCount, expiringCount, lowStockCount };
  }, [filteredInventory]);

  const handleExportCSV = () => {
    if (filteredInventory.length === 0) {
      showToast("No products match the selected export filters.", "error");
      return;
    }

    setExportingCSV(true);
    setTimeout(() => {
      const headers = ["Product Name", "Category", "Quantity", "Unit", "Expiry Date", "Status", "Date Added"];
      const rows = filteredInventory.map((item) => {
        const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
        return [
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.category.replace(/"/g, '""')}"`,
          item.quantity,
          `"${item.unit.replace(/"/g, '""')}"`,
          item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "Expiry not available",
          status,
          item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
        ];
      });

      const csvContent = "data:text/csv;charset=utf-8,"
        + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${isBusiness ? "business" : "consumer"}_inventory_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportingCSV(false);
      showToast(`Exported ${filteredInventory.length} products to CSV.`, "success");
    }, 300);
  };

  const handleExportPDF = () => {
    if (filteredInventory.length === 0) {
      showToast("No products match the selected export filters.", "error");
      return;
    }

    setExportingPDF(true);
    setTimeout(() => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setExportingPDF(false);
        showToast("Your browser blocked the print window. Allow pop-ups and try again.", "error");
        return;
      }

      const rowsHtml = filteredInventory.map((item) => {
        const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.category}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity} ${item.unit}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "Expiry not available"}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <span style="padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; ${
                status === "Expired"
                  ? "background: #fee2e2; color: #991b1b;"
                  : status === "Expiring"
                  ? "background: #fef3c7; color: #92400e;"
                  : status === "Low Stock"
                  ? "background: #ffedd5; color: #9a3412;"
                  : "background: #dcfce7; color: #166534;"
              }">${status}</span>
            </td>
          </tr>
        `;
      }).join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${isBusiness ? "Business" : "Consumer"} ShelfLife Inventory Report</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #22c55e; padding-bottom: 15px; margin-bottom: 20px; }
              .brand { font-size: 24px; font-weight: 800; color: #15803d; }
              .title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 5px; }
              .stats-grid { display: flex; gap: 15px; margin-bottom: 25px; }
              .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 18px; border-radius: 10px; flex: 1; }
              .stat-val { font-size: 20px; font-weight: 800; color: #0f172a; }
              .stat-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { background: #f1f5f9; padding: 12px 10px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="brand">🌱 ShelfLife</div>
                <div class="title">${isBusiness ? "Business" : "Consumer"} Inventory Report</div>
              </div>
              <div style="text-align: right; font-size: 12px; color: #64748b;">
                Report Date: <strong>${new Date().toLocaleDateString()}</strong>
              </div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-lbl">Total Products</div>
                <div class="stat-val">${stats.totalCount}</div>
              </div>
              <div class="stat-card">
                <div class="stat-lbl">Expired Items</div>
                <div class="stat-val" style="color: #dc2626;">${stats.expiredCount}</div>
              </div>
              <div class="stat-card">
                <div class="stat-lbl">Expiring Soon</div>
                <div class="stat-val" style="color: #d97706;">${stats.expiringCount}</div>
              </div>
              <div class="stat-card">
                <div class="stat-lbl">Low Stock</div>
                <div class="stat-val" style="color: #c2410c;">${stats.lowStockCount}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Freshness Status</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.addEventListener("afterprint", () => printWindow.close(), { once: true });
      printWindow.focus();
      printWindow.print();
      setExportingPDF(false);
    }, 300);
  };

  const backUrl = isBusiness ? "/business/dashboard/inventory" : "/dashboard/inventory";

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div>
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--shelf-forest)] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
          Export Inventory Reports
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--shelf-muted)]">
          Export your inventory dataset into downloadable CSV spreadsheets or printable PDF reports. Select filters below to customize your export scope.
        </p>
      </div>

      {/* Filter Controls Card */}
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--shelf-border)] pb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[var(--shelf-forest)]" />
            <h2 className="text-base font-semibold text-[var(--shelf-dark)]">Export Filters & Scope</h2>
          </div>
          <span className="rounded-full bg-[var(--shelf-forest)]/10 px-3 py-1 text-xs font-bold text-[var(--shelf-forest)]">
            {filteredInventory.length} of {inventory.length} items ready
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Scope */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)] mb-2">
              Status Filter
            </label>
            <div className="flex flex-wrap gap-2">
              {(["All", "Expired", "Expiring", "Low Stock"] as const).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setActiveScope(scope)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeScope === scope
                      ? "bg-[var(--shelf-forest)] text-white shadow-xs"
                      : "border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)]"
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--shelf-muted)] mb-2">
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 px-3.5 py-2 text-sm font-medium text-[var(--shelf-dark)] outline-none focus:border-[var(--shelf-forest)]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Export Cards Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CSV Export Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-xs transition hover:border-[var(--shelf-forest)]/40">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <FileSpreadsheet size={26} />
            </div>
            <h3 className="text-lg font-bold text-[var(--shelf-dark)]">Export CSV Spreadsheet</h3>
            <p className="text-xs text-[var(--shelf-muted)] leading-relaxed">
              Generate a structured .csv table with product names, category, quantities, units, expiry dates, and freshness status. Best for Microsoft Excel, Google Sheets, or data backup.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--shelf-border)]">
            <button
              onClick={handleExportCSV}
              disabled={exportingCSV || filteredInventory.length === 0}
              className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {exportingCSV ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Preparing CSV...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download CSV File ({filteredInventory.length} items)
                </>
              )}
            </button>
          </div>
        </div>

        {/* PDF Export Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-xs transition hover:border-[var(--shelf-forest)]/40">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100/70 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              <FileText size={26} />
            </div>
            <h3 className="text-lg font-bold text-[var(--shelf-dark)]">Print / Save PDF Report</h3>
            <p className="text-xs text-[var(--shelf-muted)] leading-relaxed">
              Generate an official printable report document featuring inventory breakdown metrics, timestamp, and organized tabular layout ready to print or save as PDF.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--shelf-border)]">
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF || filteredInventory.length === 0}
              className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-5 py-3 text-sm font-semibold text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {exportingPDF ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Opening PDF Generator...
                </>
              ) : (
                <>
                  <Printer size={18} />
                  Print PDF Report ({filteredInventory.length} items)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Data Preview */}
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] overflow-hidden shadow-xs">
        <div className="border-b border-[var(--shelf-border)] p-5 bg-[var(--shelf-cream)]/30 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--shelf-dark)]">Export Data Preview</h3>
            <p className="text-xs text-[var(--shelf-muted)]">Showing products matching your current export selection</p>
          </div>
          <span className="text-xs font-semibold text-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10 px-3 py-1 rounded-full">
            {filteredInventory.length} Products
          </span>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="p-12 text-center text-sm text-[var(--shelf-muted)]">
            No products match the selected export filters. Try changing your status or category filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 uppercase tracking-wider text-[var(--shelf-muted)] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Product Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Expiry Date</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--shelf-border)]">
                {filteredInventory.slice(0, 15).map((item) => {
                  const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
                  return (
                    <tr key={item.id} className="hover:bg-[var(--shelf-cream)]/10">
                      <td className="px-5 py-3.5 font-medium text-[var(--shelf-dark)]">{item.name}</td>
                      <td className="px-5 py-3.5 text-[var(--shelf-muted)]">{item.category}</td>
                      <td className="px-5 py-3.5 font-semibold text-[var(--shelf-dark)]">{item.quantity} {item.unit}</td>
                      <td className="px-5 py-3.5 text-[var(--shelf-muted)]">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "No expiry"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          status === "Expired"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                            : status === "Expiring"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : status === "Low Stock"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredInventory.length > 15 && (
              <div className="p-3.5 text-center text-xs font-semibold text-[var(--shelf-muted)] bg-[var(--shelf-cream)]/10 border-t border-[var(--shelf-border)]">
                + {filteredInventory.length - 15} more items included in export
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExportInventoryView(props: ExportInventoryViewProps) {
  return (
    <ToastProvider>
      <ExportInventoryViewInner {...props} />
    </ToastProvider>
  );
}
