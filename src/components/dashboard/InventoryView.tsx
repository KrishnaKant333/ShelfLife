"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  FileText,
  Upload,
  Calendar,
  Clock,
  Loader2,
  Trash2,
  Check,
  CheckSquare,
  Square,
  Printer,
  ChevronDown,
} from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";
import { formatExpiry } from "@/lib/format-expiry";
import { normalizeQuantity } from "@/lib/normalization";
import {
  consumeIngredientsAction,
  getRecentConsumptionAction,
  type ConsumptionRecord,
} from "@/lib/actions/recipes";
import { bulkDeleteAction } from "@/lib/actions/inventory";
import DeleteProductButton from "@/components/dashboard/DeleteProductButton";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  createdAt: string;
};

interface InventoryViewProps {
  initialInventory: InventoryItem[];
  isBusiness?: boolean;
}

export default function InventoryView({ initialInventory, isBusiness = false }: InventoryViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Expired" | "Fresh" | "Expiring" | "Low Stock">("All");
  const [sortBy, setSortBy] = useState<"expiry-asc" | "expiry-desc" | "name-asc" | "name-desc" | "qty-asc" | "qty-desc" | "date-added">("expiry-asc");

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Consumption Modal states
  const [consumeItem, setConsumeItem] = useState<InventoryItem | null>(null);
  const [consumeQty, setConsumeQty] = useState<number>(1);
  const [isConsuming, setIsConsuming] = useState(false);

  // Recent History states
  const [history, setHistory] = useState<ConsumptionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  // Fetch recent consumption activity
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await getRecentConsumptionAction();
      if (res.success && res.history) {
        setHistory(res.history);
      }
    } catch (err) {
      console.error("Failed to load activity stream:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter, search, and sort logic
  const processedInventory = [...initialInventory]
    .filter((item) => {
      const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
      
      // Search match
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter match
      const matchesFilter =
        activeFilter === "All" || status === activeFilter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "expiry-asc") {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      if (sortBy === "expiry-desc") {
        return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
      }
      if (sortBy === "qty-asc") {
        return (
          normalizeQuantity(a.quantity, a.unit).normalizedValue -
          normalizeQuantity(b.quantity, b.unit).normalizedValue
        );
      }
      if (sortBy === "qty-desc") {
        return (
          normalizeQuantity(b.quantity, b.unit).normalizedValue -
          normalizeQuantity(a.quantity, a.unit).normalizedValue
        );
      }
      if (sortBy === "date-added") {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

  const statusStyles = {
    Expired: "bg-red-50 text-[var(--shelf-terracotta)] border-red-200",
    Fresh: "bg-green-50 text-green-700 border-green-200",
    Expiring: "bg-amber-50 text-amber-700 border-amber-200",
    "Low Stock": "bg-red-50 text-[var(--shelf-terracotta)] border-red-200",
  };

  // Toggle single item selection
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Toggle master select all
  const handleToggleSelectAll = () => {
    const visibleIds = processedInventory.map((item) => item.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Trigger manual item consumption modal
  const handleOpenConsume = (item: InventoryItem) => {
    setConsumeItem(item);
    setConsumeQty(1);
  };

  // Confirm manual consumption
  const handleConfirmConsume = async () => {
    if (!consumeItem) return;
    setIsConsuming(true);
    try {
      const res = await consumeIngredientsAction([
        { itemId: consumeItem.id, quantityUsed: consumeQty },
      ]);
      if (res.success) {
        setConsumeItem(null);
        fetchHistory();
        router.refresh();
      } else {
        alert(res.error || "Failed to record consumption.");
      }
    } catch (err) {
      alert("Error occurred while saving consumption.");
    } finally {
      setIsConsuming(false);
    }
  };

  // Bulk actions handlers
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) {
      return;
    }
    try {
      const res = await bulkDeleteAction(selectedIds);
      if (res.success) {
        setSelectedIds([]);
        router.refresh();
      } else {
        alert(res.error || "Bulk delete failed.");
      }
    } catch (err) {
      alert("Error executing bulk delete.");
    }
  };

  const handleBulkConsume = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Mark ${selectedIds.length} items as fully consumed?`)) {
      return;
    }
    try {
      const itemsToConsume = selectedIds.map((id) => {
        const item = initialInventory.find((x) => x.id === id);
        return {
          itemId: id,
          quantityUsed: item ? item.quantity : 1,
        };
      });
      const res = await consumeIngredientsAction(itemsToConsume);
      if (res.success) {
        setSelectedIds([]);
        fetchHistory();
        router.refresh();
      } else {
        alert(res.error || "Bulk consume failed.");
      }
    } catch (err) {
      alert("Error executing bulk consumption.");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Product Name", "Category", "Quantity", "Unit", "Expiry Date", "Status", "Date Added"];
    const rows = initialInventory.map((item) => {
      const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
      return [
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category.replace(/"/g, '""')}"`,
        item.quantity,
        `"${item.unit.replace(/"/g, '""')}"`,
        new Date(item.expiryDate).toLocaleDateString(),
        status,
        new Date(item.createdAt).toLocaleDateString(),
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${isBusiness ? "business" : "consumer"}_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = initialInventory.map(item => {
      const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
      return `
        <tr>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>${item.quantity} ${item.unit}</td>
          <td>${new Date(item.expiryDate).toLocaleDateString()}</td>
          <td>${status}</td>
        </tr>
      `;
    }).join("");

    const htmlContent = `
      <html>
        <head>
          <title>${isBusiness ? "Business" : "Consumer"} ShelfLife Inventory Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 24px; margin-bottom: 5px; }
            p { font-size: 14px; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #f5f5f5; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>ShelfLife Inventory Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()} for ${isBusiness ? "Business" : "Consumer"}</p>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[var(--shelf-forest)]">
            Inventory
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
            {isBusiness ? "Business Shelf" : "Your Products"}
          </h1>
          <p className="mt-2 text-sm text-[var(--shelf-muted)]">
            Manage and track freshness, stock quantity, and expiry alerts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Export Options */}
          <button
            onClick={handleExportCSV}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] px-4 py-2.5 text-sm font-semibold bg-white text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
          >
            <FileText size={16} />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-border)] px-4 py-2.5 text-sm font-semibold bg-white text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
          >
            <Printer size={16} />
            Print PDF
          </button>
          <Link
            href={`${prefix}/inventory/new?tab=import`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--shelf-border)] px-4 py-2.5 text-sm font-semibold bg-white text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
          >
            <Upload size={16} />
            Import
          </Link>
          <Link
            href={`${prefix}/inventory/new`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 shadow-xs"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Main content split grid */}
      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Main List Section */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Toolbar - Search, Filters & Sorting */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-[var(--shelf-surface)] border border-[var(--shelf-border)] p-4 rounded-2xl shadow-xs">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xs">
              <span className="absolute inset-y-0 left-3 flex items-center text-[var(--shelf-muted)]">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 py-2.5 pl-10 pr-4 text-sm text-[var(--shelf-dark)] outline-none focus:border-[var(--shelf-forest)] focus:bg-[var(--shelf-surface)] transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 bg-[var(--shelf-cream)]/50 p-1 rounded-xl border border-[var(--shelf-border)]/50">
                {(["All", "Expired", "Fresh", "Expiring", "Low Stock"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold tracking-wide uppercase transition ${
                      activeFilter === filter
                        ? "bg-white text-[var(--shelf-forest)] shadow-xs"
                        : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Sort selector dropdown */}
              <div className="relative flex items-center gap-1.5 bg-[var(--shelf-cream)]/50 px-3 py-2 rounded-xl border border-[var(--shelf-border)]/50 text-[11px] font-semibold text-[var(--shelf-dark)]">
                <span className="text-[var(--shelf-muted)] uppercase tracking-wide">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-transparent border-none outline-none pr-1.5 font-bold cursor-pointer"
                >
                  <option value="expiry-asc">Expiry: Nearest</option>
                  <option value="expiry-desc">Expiry: Latest</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="name-desc">Name: Z-A</option>
                  <option value="qty-asc">Qty: Lowest</option>
                  <option value="qty-desc">Qty: Highest</option>
                  <option value="date-added">Recently Added</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-red-50/50 border border-red-200/60 p-4 rounded-xl">
              <span className="text-xs font-semibold text-[var(--shelf-terracotta)]">
                {selectedIds.length} item(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkConsume}
                  className="cursor-pointer rounded-lg bg-green-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                >
                  Mark fully consumed
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="cursor-pointer rounded-lg bg-[var(--shelf-terracotta)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  Delete selected
                </button>
              </div>
            </div>
          )}

          {/* Product Display */}
          {initialInventory.length === 0 ? (
            <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
                <Plus size={28} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[var(--shelf-dark)]">Your shelf is empty</h3>
              <p className="mt-2 text-sm text-[var(--shelf-muted)] max-w-md mx-auto">
                Add your first product manually or upload an invoice/CSV sheet to start tracking freshness.
              </p>
              <div className="mt-6">
                <Link
                  href={`${prefix}/inventory/new`}
                  className="rounded-xl bg-[var(--shelf-forest)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Add Product
                </Link>
              </div>
            </div>
          ) : processedInventory.length === 0 ? (
            <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-10 text-center shadow-xs">
              <p className="text-sm font-semibold text-[var(--shelf-dark)]">No products found</p>
              <p className="mt-1 text-xs text-[var(--shelf-muted)]">
                Try adjusting your search query or switching your status filter tab.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                }}
                className="mt-4 text-xs font-semibold text-[var(--shelf-forest)] hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left">
                    <thead className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20">
                      <tr>
                        <th className="w-12 px-6 py-4">
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="cursor-pointer flex items-center text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
                          >
                            {processedInventory.every((item) => selectedIds.includes(item.id)) ? (
                              <CheckSquare size={16} className="text-[var(--shelf-forest)]" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Product</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Category</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Quantity</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Expiry</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedInventory.map((item) => {
                        const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-[var(--shelf-border)] last:border-0 hover:bg-[var(--shelf-cream)]/5 transition duration-150 ${
                              isSelected ? "bg-[var(--shelf-cream)]/10" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => handleToggleSelect(item.id)}
                                className="cursor-pointer flex items-center text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
                              >
                                {isSelected ? (
                                  <CheckSquare size={16} className="text-[var(--shelf-forest)]" />
                                ) : (
                                  <Square size={16} />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-[var(--shelf-dark)]">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">
                              {item.category}
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--shelf-muted)] font-medium">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">
                              {formatExpiry(item.expiryDate)}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-3 items-center">
                                <button
                                  onClick={() => handleOpenConsume(item)}
                                  className="cursor-pointer text-sm font-bold text-green-700 hover:underline bg-transparent border-none"
                                >
                                  Use
                                </button>
                                <Link
                                  href={`${prefix}/inventory/${item.id}/edit`}
                                  className="text-sm font-semibold text-[var(--shelf-forest)] hover:underline"
                                >
                                  Edit
                                </Link>
                                <DeleteProductButton id={item.id} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards Grid View */}
              <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
                {processedInventory.map((item) => {
                  const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[var(--shelf-sage)] transition ${
                        isSelected ? "border-[var(--shelf-forest)] bg-[var(--shelf-cream)]/10" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(item.id)}
                            className="cursor-pointer mt-0.5 text-[var(--shelf-muted)] bg-transparent border-none"
                          >
                            {isSelected ? <CheckSquare size={16} className="text-[var(--shelf-forest)]" /> : <Square size={16} />}
                          </button>
                          <div>
                            <h4 className="font-bold text-[var(--shelf-dark)] leading-tight">{item.name}</h4>
                            <p className="mt-1 text-xs text-[var(--shelf-muted)]">{item.category}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusStyles[status]}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-[var(--shelf-border)]/50 py-3">
                        <div>
                          <p className="text-[var(--shelf-muted)] font-medium">Stock level</p>
                          <p className="font-bold text-[var(--shelf-dark)] mt-0.5">{item.quantity} {item.unit}</p>
                        </div>
                        <div>
                          <p className="text-[var(--shelf-muted)] font-medium">Shelf freshness</p>
                          <p className="font-bold text-[var(--shelf-dark)] mt-0.5 flex items-center gap-1">
                            <Calendar size={13} className="text-[var(--shelf-forest)]" />
                            {formatExpiry(item.expiryDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] text-[var(--shelf-muted)] font-mono">ID: #{item.id}</span>
                        <div className="flex gap-4 items-center">
                          <button
                            onClick={() => handleOpenConsume(item)}
                            className="cursor-pointer text-xs font-bold text-green-700 hover:underline bg-transparent border-none"
                          >
                            Use
                          </button>
                          <Link
                            href={`${prefix}/inventory/${item.id}/edit`}
                            className="text-xs font-bold text-[var(--shelf-forest)] hover:underline"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton id={item.id} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Sidebar Activity History */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-xs sticky top-6">
            <h3 className="text-sm font-bold text-[var(--shelf-dark)] mb-4 flex items-center gap-1.5">
              <Clock size={16} className="text-[var(--shelf-forest)]" />
              Recent Activity
            </h3>

            {loadingHistory ? (
              <div className="flex items-center gap-2 py-3 text-xs text-[var(--shelf-muted)]">
                <Loader2 className="animate-spin text-[var(--shelf-forest)] h-4 w-4" />
                <span>Loading activity stream...</span>
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-[var(--shelf-muted)] italic py-2">
                No consumption recorded yet. Use products to see usage logs.
              </p>
            ) : (
              <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="text-xs border-b border-[var(--shelf-border)]/50 pb-2.5 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-semibold text-[var(--shelf-dark)] truncate max-w-[120px]">
                        {record.productName}
                      </span>
                      <span className="text-[9px] bg-green-50 border border-green-100 text-green-700 px-1.5 py-0.5 rounded shrink-0 font-bold">
                        -{record.quantityUsed} {record.unit}
                      </span>
                    </div>
                    <span className="text-[9px] text-[var(--shelf-muted)] block mt-1">
                      {new Date(record.consumedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Manual Consume Item Dialog */}
      {consumeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="relative flex flex-col w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[var(--shelf-border)] p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--shelf-dark)]">Use Product</h3>
              <p className="text-xs text-[var(--shelf-muted)] mt-1">
                Record how much of <strong>{consumeItem.name}</strong> you are consuming.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--shelf-dark)] block">
                Quantity to use (Max: {consumeItem.quantity} {consumeItem.unit})
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={1}
                  max={consumeItem.quantity}
                  value={consumeQty}
                  onChange={(e) =>
                    setConsumeQty(
                      Math.min(
                        consumeItem.quantity,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                  className="flex-1 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 px-3.5 py-2 text-sm text-[var(--shelf-dark)] outline-none focus:border-[var(--shelf-forest)]"
                />
                <span className="text-sm font-semibold text-[var(--shelf-muted)]">
                  {consumeItem.unit}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConsumeItem(null)}
                className="cursor-pointer rounded-xl border border-[var(--shelf-border)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] bg-white hover:bg-[var(--shelf-cream)] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConsume}
                disabled={isConsuming}
                className="cursor-pointer rounded-xl bg-[var(--shelf-forest)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition"
              >
                {isConsuming ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
