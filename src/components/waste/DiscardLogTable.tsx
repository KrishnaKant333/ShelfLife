"use client";

import { useState } from "react";
import { Search, Filter, Trash2, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DiscardLogEntry } from "@/lib/waste";
import { discardExpiredItemsAction } from "@/lib/actions/inventory";
import { useToast } from "@/components/ui/Toast";

interface DiscardLogTableProps {
  logs: DiscardLogEntry[];
  hasActiveExpired: boolean;
  onRefresh: () => void;
}

export default function DiscardLogTable({
  logs,
  hasActiveExpired,
  onRefresh,
}: DiscardLogTableProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Extract unique categories
  const categories = Array.from(new Set(logs.map((l) => l.category))).filter(Boolean);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reasonLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || log.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDiscardExpired = async () => {
    setIsDiscarding(true);
    try {
      const res = await discardExpiredItemsAction();
      if (res.success) {
        showToast(
          res.count && res.count > 0
            ? `Discarded ${res.count} expired items and updated audit log.`
            : "No expired items found.",
          "success"
        );
        setConfirmModalOpen(false);
        onRefresh();
      } else {
        showToast(res.error || "Failed to discard expired items.", "error");
      }
    } catch {
      showToast("An unexpected error occurred while discarding items.", "error");
    } finally {
      setIsDiscarding(false);
    }
  };

  return (
    <section aria-labelledby="discard-log-heading" className="sl-editorial-card p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="discard-log-heading" className="font-serif text-xl font-normal tracking-tight text-[var(--shelf-dark)] sm:text-2xl">
            Archival Discard & Loss Audit Log
          </h2>
          <p className="mt-1 text-xs text-[var(--shelf-muted)] sm:text-sm">
            Comprehensive history of discarded and expired stock items for audit compliance.
          </p>
        </div>

        {hasActiveExpired && (
          <button
            onClick={() => setConfirmModalOpen(true)}
            className="sl-focus-ring inline-flex items-center gap-1.5 rounded-xl border border-[var(--shelf-terracotta)]/30 bg-[var(--shelf-terracotta)]/10 px-3.5 py-2 text-xs font-semibold text-[var(--shelf-terracotta)] transition hover:bg-[var(--shelf-terracotta)] hover:text-white cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Discard Active Expired Items
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--shelf-muted)]" />
          <input
            type="text"
            placeholder="Search discarded items or causes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 py-2 pl-9 pr-4 text-xs font-medium text-[var(--shelf-dark)] outline-none"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="sl-focus-ring w-full appearance-none rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 py-2 pl-3 pr-8 text-xs font-medium text-[var(--shelf-dark)] outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--shelf-muted)]" />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-[var(--shelf-border)]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 font-mono text-[11px] uppercase tracking-wider text-[var(--shelf-muted)]">
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4">Date Logged</th>
              <th className="py-3 px-4">Trigger Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--shelf-border)]/50">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs text-[var(--shelf-muted)]">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-[var(--shelf-forest)]/60 mb-2" />
                  No discard records matching your filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                let badgeStyle = "text-[var(--shelf-terracotta)] bg-[var(--shelf-terracotta)]/10 border-[var(--shelf-terracotta)]/20";
                if (log.reason === "spoiled") {
                  badgeStyle = "text-[var(--shelf-amber)] bg-[var(--shelf-amber)]/10 border-[var(--shelf-amber)]/20";
                } else if (log.reason === "overpurchased") {
                  badgeStyle = "text-[var(--shelf-blue)] bg-[var(--shelf-blue)]/10 border-[var(--shelf-blue)]/20";
                }

                const formattedDate = new Date(log.discardDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <tr key={log.id} className="hover:bg-[var(--shelf-cream)]/20 transition">
                    <td className="py-3 px-4 font-bold text-[var(--shelf-dark)]">
                      {log.productName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--shelf-muted)]">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[var(--shelf-dark)]">
                      {log.quantity} {log.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--shelf-muted)] flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeStyle}`}>
                        {log.reasonLabel}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Discard Confirmation Modal */}
      {confirmModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-2xl">
            <div className="p-6 border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-[var(--shelf-terracotta)]/15 p-2.5 text-[var(--shelf-terracotta)]">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 id="discard-modal-title" className="font-serif text-lg font-bold text-[var(--shelf-dark)]">
                    Discard Expired Stock
                  </h3>
                  <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                    This action will purge active expired items and log them in the audit register.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3 text-xs text-[var(--shelf-muted)] leading-relaxed">
              <p>
                Expired stock will be permanently removed from active inventory and registered as past-expiration loss.
              </p>
              <p className="font-medium text-[var(--shelf-dark)]">
                Are you sure you want to proceed with this audit cleanup?
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2.5 border-t border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 p-4 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConfirmModalOpen(false)}
                disabled={isDiscarding}
                className="sl-focus-ring rounded-xl border border-[var(--shelf-border)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] bg-[var(--shelf-surface)] hover:bg-[var(--shelf-cream)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscardExpired}
                disabled={isDiscarding}
                className="sl-focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--shelf-terracotta)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDiscarding ? "Discarding..." : "Confirm & Discard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
