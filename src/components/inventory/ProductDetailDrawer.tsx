"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Calendar,
  Clock,
  Utensils,
  Edit2,
  Trash2,
  Plus,
  Bell,
  Folder,
  Sparkles,
  ChefHat,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatExpiry, getDaysUntilExpiry } from "@/lib/format-expiry";
import ProductImage from "@/components/inventory/ProductImage";
import {
  consumeIngredientsAction,
  getRecentConsumptionAction,
  type ConsumptionRecord,
} from "@/lib/actions/recipes";
import type { InventoryItem } from "@/lib/inventory";

interface ProductDetailDrawerProps {
  item: (InventoryItem & { status: string; createdAt?: string }) | null;
  onClose: () => void;
  onRefresh: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
  isBusiness?: boolean;
}

type TabType = "Overview" | "History" | "AI Insights" | "Recipes";

export default function ProductDetailDrawer({
  item,
  onClose,
  onRefresh,
  onEdit,
  onDelete,
  isBusiness = false,
}: ProductDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Overview");
  const [isConsuming, setIsConsuming] = useState(false);
  const [consumeQty, setConsumeQty] = useState(1);
  const [showPortionModal, setShowPortionModal] = useState(false);
  const [history, setHistory] = useState<ConsumptionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  const availableTabs: TabType[] = isBusiness
    ? ["Overview", "History", "AI Insights"]
    : ["Overview", "History", "AI Insights", "Recipes"];

  // Reset tab when item changes
  useEffect(() => {
    setActiveTab("Overview");
    setShowPortionModal(false);
    if (item) {
      setConsumeQty(Math.min(1, item.quantity));
      // Load real history for this product
      void loadProductHistory(item.name, item.id);
    }
  }, [item?.id]);

  const loadProductHistory = async (productName: string, itemId: number) => {
    setLoadingHistory(true);
    try {
      const res = await getRecentConsumptionAction();
      if (res.success && res.history) {
        // Filter history strictly for this product
        const filtered = res.history.filter(
          (h) => h.productName.toLowerCase() === productName.toLowerCase()
        );
        setHistory(filtered);
      }
    } catch {
      // Graceful error state
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!item) return null;

  const days = getDaysUntilExpiry(item.expiryDate);

  // Status pills configuration
  const isExpiringSoon = item.status === "Expiring" || (days >= 0 && days <= 3);
  const isExpired = item.status === "Expired" || days < 0;

  const handleMarkAsUsed = async (quantityToUse: number) => {
    setIsConsuming(true);
    try {
      const res = await consumeIngredientsAction([
        {
          itemId: item.id,
          quantityUsed: quantityToUse,
        },
      ]);
      if (res.success) {
        setShowPortionModal(false);
        onRefresh();
        if (quantityToUse >= item.quantity) {
          onClose();
        } else {
          void loadProductHistory(item.name, item.id);
        }
      }
    } catch {
      // Error handled by parent toast
    } finally {
      setIsConsuming(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      {/* Mobile: bottom-sheet slide up (fixed inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl) */}
      {/* Desktop: fixed right slide-in panel (w-[400px] xl:w-[440px] inset-y-0 right-0) */}
      {/* Drawer Container */}
      {/* Mobile: bottom-sheet slide up (fixed inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl) */}
      {/* Desktop: fixed right slide-in panel (w-[400px] xl:w-[440px] inset-y-0 right-0) */}
      <aside
        className="fixed z-50 flex flex-col bg-[var(--app-surface-elevated)] border-[var(--app-border-subtle)] text-[var(--app-text-body)] shadow-2xl transition-all duration-300 ease-out
          inset-x-0 bottom-0 max-h-[90vh] rounded-t-3xl border-t lg:inset-x-auto lg:top-0 lg:bottom-0 lg:right-0 lg:h-full lg:max-h-full lg:w-[410px] xl:w-[450px] lg:rounded-none lg:border-l lg:border-t-0"
        aria-label={`Product details for ${item.name}`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--app-border-subtle)] px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--app-accent-emerald)]">
              Product Dossier
            </span>
            <span className="rounded bg-[var(--app-surface-base)] border border-[var(--app-border-subtle)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--app-text-muted)]">
              #{item.id}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={`${prefix}/inventory/${item.id}`}
              title="Open Full Digital Dossier"
              aria-label="Open Full Digital Dossier"
              className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[var(--app-accent-emerald)] hover:bg-[var(--app-surface-base)] transition"
            >
              <span className="hidden sm:inline">Full Dossier</span>
              <ExternalLink size={13} />
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close product detail drawer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-display)] transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5 scrollbar-thin">
          {/* Hero Product Stage */}
          <div className="relative flex h-52 sm:h-56 w-full items-center justify-center rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-4 shadow-xs">
            <ProductImage
              src={item.imageUrl}
              alt={item.name}
              category={item.category}
              className="h-full w-full"
              size="lg"
              priority
            />
          </div>

          {/* Freshness Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {Number.isFinite(days) && (
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide border ${
                  isExpired
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30"
                    : isExpiringSoon
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                }`}
              >
                <Clock size={12} />
                <span>{formatExpiry(item.expiryDate)}</span>
              </span>
            )}

            {isExpiringSoon && !isExpired && (
              <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                <AlertTriangle size={12} />
                <span>Use Soon</span>
              </span>
            )}

            {item.status === "Low Stock" && (
              <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <span>Low Stock</span>
              </span>
            )}

            {item.status === "Fresh" && (
              <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={12} />
                <span>Fresh</span>
              </span>
            )}
          </div>

          {/* Hero Banner / Product Header */}
          <div>
            <h2 className="sl-display-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--app-text-display)]">
              {item.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--app-text-muted)]">
              {item.category} · {item.quantity} {item.unit}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[var(--app-border-subtle)] text-xs font-semibold">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 px-1 border-b-2 transition ${
                  activeTab === tab
                    ? "border-[var(--app-accent-emerald)] text-[var(--app-accent-emerald)] font-bold"
                    : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text-display)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "Overview" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* 2x2 Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Quantity */}
                <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] block">
                    Stock Quantity
                  </span>
                  <p className="mt-1 text-sm font-bold text-[var(--app-text-display)] flex items-center gap-1.5">
                    <Package size={14} className="text-[var(--app-accent-emerald)] shrink-0" />
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                  </p>
                </div>

                {/* Expiration */}
                <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] block">
                    Expiration
                  </span>
                  <p className="mt-1 text-xs font-bold text-[var(--app-text-display)] truncate flex items-center gap-1.5">
                    <Calendar size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      {item.expiryDate
                        ? new Date(item.expiryDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No Date"}
                    </span>
                  </p>
                  {Number.isFinite(days) && (
                    <span className="text-[10px] font-medium text-[var(--app-text-muted)] block mt-0.5">
                      {days < 0 ? "Expired" : `${days} days left`}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] block">
                    Freshness Status
                  </span>
                  <p className="mt-1 text-xs font-bold text-[var(--app-text-display)] flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isExpired
                          ? "bg-rose-500"
                          : isExpiringSoon
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <span>{item.status}</span>
                  </p>
                </div>

                {/* Category */}
                <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] block">
                    Category
                  </span>
                  <p className="mt-1 text-xs font-bold text-[var(--app-text-display)] truncate flex items-center gap-1.5">
                    <Layers size={14} className="text-[var(--app-text-muted)] shrink-0" />
                    <span>{item.category}</span>
                  </p>
                </div>
              </div>

              {/* Portion Selector & Primary Actions */}
              <div className="space-y-2.5 pt-1">
                {showPortionModal ? (
                  <div className="rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface-base)] p-3.5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--app-text-display)]">
                      <span>Quantity to mark consumed:</span>
                      <span className="text-[var(--app-accent-emerald)]">
                        {consumeQty} / {item.quantity} {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={item.quantity}
                        value={consumeQty}
                        onChange={(e) =>
                          setConsumeQty(
                            Math.min(
                              item.quantity,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="flex-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3 py-1.5 text-sm text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                      />
                      <button
                        type="button"
                        onClick={() => setConsumeQty(item.quantity)}
                        className="rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2.5 py-1.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition"
                      >
                        All
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPortionModal(false)}
                        className="flex-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] py-2 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkAsUsed(consumeQty)}
                        disabled={isConsuming}
                        className="flex-1 rounded-lg bg-[var(--app-accent-emerald)] py-2 text-xs font-bold text-white hover:brightness-105 transition disabled:opacity-50"
                      >
                        {isConsuming ? "Logging..." : "Confirm Used"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPortionModal(true)}
                      className="sl-focus-ring flex items-center justify-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-105 transition cursor-pointer"
                    >
                      <Utensils size={14} />
                      <span>Mark as Used</span>
                    </button>

                    <Link
                      href={`${prefix}/inventory/${item.id}/edit`}
                      className="sl-focus-ring flex items-center justify-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-2.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions List */}
              <div className="space-y-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-2">
                <span className="px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                  Quick Actions
                </span>

                <Link
                  href={`${prefix}/inventory/${item.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink size={14} className="text-[var(--app-accent-emerald)]" />
                    <span className="font-semibold text-[var(--app-accent-emerald)]">View Full Digital Dossier</span>
                  </span>
                  <ChevronRight size={14} className="text-[var(--app-accent-emerald)]" />
                </Link>

                <Link
                  href={`${prefix}/inventory/${item.id}/edit`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={14} className="text-[var(--app-text-muted)]" />
                    <span>Add More Stock</span>
                  </span>
                  <ChevronRight size={14} className="text-[var(--app-text-muted)]" />
                </Link>

                <Link
                  href={`${prefix}/alerts`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition"
                >
                  <span className="flex items-center gap-2">
                    <Bell size={14} className="text-[var(--app-text-muted)]" />
                    <span>Set Expiry Reminder</span>
                  </span>
                  <ChevronRight size={14} className="text-[var(--app-text-muted)]" />
                </Link>

                <Link
                  href={`${prefix}/inventory/${item.id}/edit`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition"
                >
                  <span className="flex items-center gap-2">
                    <Folder size={14} className="text-[var(--app-text-muted)]" />
                    <span>Move to Another Category</span>
                  </span>
                  <ChevronRight size={14} className="text-[var(--app-text-muted)]" />
                </Link>

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 size={14} />
                    <span>Delete Product</span>
                  </span>
                  <ChevronRight size={14} className="text-rose-500/60" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: History */}
          {activeTab === "History" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Consumption Audit Trail
              </h4>

              {loadingHistory ? (
                <div className="flex items-center gap-2 py-6 text-xs text-[var(--app-text-muted)]">
                  <Loader2 className="animate-spin text-[var(--app-accent-emerald)] h-4 w-4" />
                  <span>Loading consumption logs...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-6 text-center">
                  <Clock size={24} className="mx-auto text-[var(--app-text-muted)] mb-2" />
                  <p className="text-xs font-semibold text-[var(--app-text-display)]">
                    No consumption logged yet
                  </p>
                  <p className="text-[11px] text-[var(--app-text-muted)] mt-1">
                    When you use portions of {item.name}, every deduction is recorded here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[var(--app-text-display)]">
                          Consumed portion
                        </p>
                        <span className="text-[10px] text-[var(--app-text-muted)]">
                          {new Date(record.consumedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        -{record.quantityUsed} {record.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: AI Insights */}
          {activeTab === "AI Insights" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-[var(--app-accent-emerald)]">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Freshness Intelligence
                  </span>
                </div>
                <p className="text-xs text-[var(--app-text-body)] leading-relaxed">
                  {Number.isFinite(days) && days <= 3
                    ? `${item.name} has ${days <= 0 ? "reached" : `only ${days} day(s) before`} its optimal freshness date. We advise ${isBusiness ? "prioritizing it in upcoming commercial prep stations to prevent inventory loss" : "using it in upcoming meals to prevent food waste"}.`
                    : `${item.name} is currently fresh and within safe shelf life. Store appropriately in the ${item.category.toLowerCase()} compartment.`}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3.5 space-y-1.5 text-xs text-[var(--app-text-muted)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-display)] block">
                  Storage Recommendations
                </span>
                <p>
                  Keep sealed in original packaging or airtight container. Consume promptly once opened.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Recipes (Consumer Only) */}
          {!isBusiness && activeTab === "Recipes" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-4 text-center space-y-3">
                <ChefHat size={28} className="mx-auto text-[var(--app-accent-emerald)]" />
                <div>
                  <h4 className="text-xs font-bold text-[var(--app-text-display)]">
                    Cook With {item.name}
                  </h4>
                  <p className="text-[11px] text-[var(--app-text-muted)] mt-1 max-w-xs mx-auto">
                    Generate recipe recommendations prioritized around utilizing this item before its shelf life expires.
                  </p>
                </div>

                <Link
                  href={`/dashboard/recipes?ingredient=${encodeURIComponent(item.name)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--app-accent-emerald)] px-4 py-2 text-xs font-bold text-white hover:brightness-105 transition cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Generate Recipes</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
