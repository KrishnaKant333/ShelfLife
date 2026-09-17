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
import ProductThumbnail from "@/components/inventory/ProductThumbnail";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  imageUrl?: string | null;
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
        const imageCell = item.imageUrl
          ? `<img src="${item.imageUrl}" alt="${item.name.replace(/"/g, '&quot;')}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; display: block;" onerror="this.style.display='none'" />`
          : `<div style="width: 36px; height: 36px; border-radius: 6px; background: #f1f5f9; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">${item.category.slice(0, 2)}</div>`;

        return `
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: middle;">${imageCell}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600; vertical-align: middle;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; vertical-align: middle;">${item.category}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; vertical-align: middle;">${item.quantity} ${item.unit}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; vertical-align: middle;">${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "Expiry not available"}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; vertical-align: middle;">
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
                  <th style="width: 48px;">Photo</th>
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
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 md:px-0 py-6 md:py-10">
      {/* Header */}
      <div>
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-forest)] hover:underline transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Inventory
        </Link>
        <h1 className="sl-display-serif mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-[var(--app-text-display)]">
          Export Inventory Reports
        </h1>
        <p className="mt-1.5 max-w-2xl text-xs md:text-sm text-[var(--app-text-muted)] leading-relaxed">
          Export your complete stock register into downloadable CSV spreadsheets or printable PDF reports. Select filters below to customize your export scope.
        </p>
      </div>

      {/* Filter Controls Card */}
      <div className="sl-editorial-card rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-5 md:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--app-border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--app-accent-emerald)]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-display)]">Export Scope & Filters</h2>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-[var(--app-accent-emerald)]">
            {filteredInventory.length} of {inventory.length} items ready
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Scope */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] mb-2">
              Freshness Status Filter
            </label>
            <div className="flex flex-wrap gap-2">
              {(["All", "Expired", "Expiring", "Low Stock"] as const).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setActiveScope(scope)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeScope === scope
                      ? "bg-[var(--app-accent-emerald)] text-white shadow-sm"
                      : "border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] text-[var(--app-text-body)] hover:text-[var(--app-text-display)] hover:bg-[var(--app-surface-base)]/80"
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] mb-2">
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-3.5 py-2.5 text-xs font-medium text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)] transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[var(--app-surface-elevated)] text-[var(--app-text-display)]">
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
        <div className="sl-editorial-card flex flex-col justify-between rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-6 md:p-8 shadow-xl transition-all hover:border-[var(--app-accent-emerald)] relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--app-accent-emerald)]">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="sl-display-serif text-2xl font-semibold text-[var(--app-text-display)]">Export CSV Spreadsheet</h3>
            <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
              Generate a structured .csv table with product names, category, quantities, units, expiry dates, and freshness status. Best for Microsoft Excel, Google Sheets, or local database backup.
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-[var(--app-border-subtle)] relative z-10">
            <button
              onClick={handleExportCSV}
              disabled={exportingCSV || filteredInventory.length === 0}
              className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--app-accent-emerald)] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingCSV ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Preparing CSV...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download CSV File ({filteredInventory.length} items)
                </>
              )}
            </button>
          </div>
        </div>

        {/* PDF Export Card */}
        <div className="sl-editorial-card flex flex-col justify-between rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-6 md:p-8 shadow-xl transition-all hover:border-blue-500 relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <FileText size={24} />
            </div>
            <h3 className="sl-display-serif text-2xl font-semibold text-[var(--app-text-display)]">Print / Save PDF Report</h3>
            <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
              Generate an official printable report document featuring inventory breakdown metrics, timestamp, and organized tabular layout ready to print or save as PDF.
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-[var(--app-border-subtle)] relative z-10">
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF || filteredInventory.length === 0}
              className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[var(--app-text-display)] hover:bg-[var(--app-surface-base)]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {exportingPDF ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Opening PDF Generator...
                </>
              ) : (
                <>
                  <Printer size={16} />
                  Print PDF Report ({filteredInventory.length} items)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Data Preview */}
      <div className="sl-editorial-card rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] overflow-hidden shadow-xl">
        <div className="border-b border-[var(--app-border-subtle)] p-5 bg-[var(--app-surface-base)]/50 flex items-center justify-between">
          <div>
            <h3 className="sl-display-serif text-lg font-semibold text-[var(--app-text-display)]">Export Data Preview</h3>
            <p className="text-xs text-[var(--app-text-muted)]">Showing products matching your current export selection</p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-accent-emerald)] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {filteredInventory.length} Products
          </span>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="p-12 text-center text-xs md:text-sm text-[var(--app-text-muted)]">
            No products match the selected export filters. Try changing your status or category filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/30 uppercase tracking-wider text-[var(--app-text-muted)] font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">Photo</th>
                  <th className="px-5 py-3.5">Product Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Quantity</th>
                  <th className="px-5 py-3.5">Expiry Date</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border-subtle)]">
                {filteredInventory.slice(0, 15).map((item) => {
                  const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
                  return (
                    <tr key={item.id} className="hover:bg-[var(--app-surface-base)]/40 transition">
                      <td className="px-4 py-2.5">
                        <div className="h-8 w-8">
                          <ProductThumbnail
                            src={item.imageUrl}
                            alt={item.name}
                            category={item.category}
                            size="xs"
                            rounded="sm"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[var(--app-text-display)]">{item.name}</td>
                      <td className="px-5 py-3.5 text-[var(--app-text-muted)]">{item.category}</td>
                      <td className="px-5 py-3.5 font-medium text-[var(--app-text-display)]">{item.quantity} {item.unit}</td>
                      <td className="px-5 py-3.5 font-mono text-[var(--app-text-muted)]">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "No expiry"}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          status === "Expired"
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : status === "Expiring"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : status === "Low Stock"
                            ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                            : "bg-emerald-500/10 text-[var(--app-accent-emerald)] border border-emerald-500/20"
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
              <div className="p-3.5 text-center text-xs font-semibold text-[var(--app-text-muted)] bg-[var(--app-surface-base)]/30 border-t border-[var(--app-border-subtle)]">
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
