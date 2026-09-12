"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { 
  Database, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2 
} from "lucide-react";
import { purgeInventoryAction } from "@/lib/actions/settings";

interface DataHubTabProps {
  isBusiness?: boolean;
}

export default function DataHubTab({ isBusiness = false }: DataHubTabProps) {
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeInput, setPurgeInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const exportUrl = isBusiness
    ? "/business/dashboard/inventory/export"
    : "/dashboard/inventory/export";

  function handleDownloadBackup() {
    // Generate browser-side JSON state snapshot
    const backupData = {
      exportTimestamp: new Date().toISOString(),
      platform: "ShelfLife Operating System",
      schemaVersion: "1.0",
      settings: {
        expiryThreshold: localStorage.getItem("shelf_expiry_threshold") || "7",
        expiryAlerts: localStorage.getItem("shelf_expiry_alerts") || "true",
        lowStockAlerts: localStorage.getItem("shelf_lowstock_alerts") || "true",
        unitSystem: localStorage.getItem("shelf_unit_system") || "metric",
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shelflife-workspace-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handlePurgeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (purgeInput !== "PURGE") return;

    startTransition(async () => {
      const res = await purgeInventoryAction();
      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({ type: "success", text: res.message || "Inventory successfully purged." });
        setShowPurgeModal(false);
        setPurgeInput("");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Export Hub Quick Jump */}
      <section className="sl-editorial-card p-6 space-y-5">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <Database size={18} className="text-[var(--shelf-forest)]" />
            Data Archival & Export Hub
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Export structured spreadsheets, generate printable PDF inspection logs, and download machine-readable backups.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Export Hub Link Card */}
          <Link
            href={exportUrl}
            className="p-4 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] hover:border-emerald-500/40 hover:bg-[var(--shelf-cream)]/30 transition group flex items-start gap-3"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-[var(--shelf-forest)] shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--shelf-dark)] group-hover:text-[var(--shelf-forest)] transition flex items-center gap-1.5">
                <span>Open Dedicated Export Hub</span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">→</span>
              </h4>
              <p className="text-[11px] text-[var(--shelf-muted)] mt-1">
                Download custom CSV spreadsheets and formatted Printable PDF audit reports with status filters.
              </p>
            </div>
          </Link>

          {/* JSON Backup Download */}
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="p-4 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] hover:border-emerald-500/40 hover:bg-[var(--shelf-cream)]/30 text-left transition group flex items-start gap-3"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Download size={20} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--shelf-dark)] group-hover:text-[var(--shelf-forest)] transition flex items-center gap-1.5">
                <span>Download Workspace JSON Snapshot</span>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">↓</span>
              </h4>
              <p className="text-[11px] text-[var(--shelf-muted)] mt-1">
                Export an immediate machine-readable JSON backup of your current workspace configuration.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="sl-editorial-card p-6 border-red-500/30 dark:border-red-500/20 bg-red-500/[0.02] space-y-4">
        <div className="border-b border-red-500/20 pb-3">
          <h3 className="text-base font-serif font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            Danger Zone & Irreversible Actions
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Destructive operations that permanently wipe inventory records or account data.
          </p>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                : "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20"
            }`}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="p-4 rounded-xl border border-red-500/20 bg-[var(--shelf-surface)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[var(--shelf-dark)]">
              Purge All Active Inventory
            </p>
            <p className="text-[11px] text-[var(--shelf-muted)]">
              Permanently deletes all active items in your pantry. Historical consumption and discard analytics are preserved.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowPurgeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition shrink-0 shadow-xs"
          >
            <Trash2 size={14} />
            <span>Purge Inventory</span>
          </button>
        </div>
      </section>

      {/* Confirmation Modal for Purge */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--shelf-surface)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-base font-serif font-semibold text-[var(--shelf-dark)]">
                  Purge Entire Inventory?
                </h4>
                <p className="text-xs text-[var(--shelf-muted)]">
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--shelf-muted)] leading-relaxed">
              All active product records in this workspace will be permanently erased. To confirm this critical action, type <strong className="font-mono text-red-600 dark:text-red-400 font-bold">PURGE</strong> below:
            </p>

            <form onSubmit={handlePurgeSubmit} className="space-y-4">
              <input
                type="text"
                value={purgeInput}
                onChange={(e) => setPurgeInput(e.target.value)}
                placeholder="Type PURGE to confirm"
                className="w-full h-11 px-3.5 rounded-xl border border-red-500/40 bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] font-mono outline-none focus:ring-2 focus:ring-red-500/20 transition"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPurgeModal(false);
                    setPurgeInput("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] hover:bg-[var(--shelf-border)]/40 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purgeInput !== "PURGE" || isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-40"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Purging...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} />
                      <span>Confirm Purge</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
