"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { isOpenFoodFactsImage } from "@/lib/openfoodfacts";
import {
  consumeIngredientsAction,
  getRecentConsumptionAction,
  type ConsumptionRecord,
} from "@/lib/actions/recipes";
import { isIntegerUnit } from "@/lib/normalization";
import type { InventoryItem } from "@/lib/inventory";
import ProductRestockModal from "@/components/inventory/ProductRestockModal";
import ProductCategoryModal from "@/components/inventory/ProductCategoryModal";
import ProductReminderModal from "@/components/inventory/ProductReminderModal";
import ProductDeleteModal from "@/components/inventory/ProductDeleteModal";

interface ProductDetailDrawerProps {
  item: (InventoryItem & { status: string; createdAt?: string }) | null;
  onClose: () => void;
  onRefresh: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete?: (id: number) => void;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Spec 05: Contextual Action Modals
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeReminder, setActiveReminder] = useState<string | null>(null);

  const auxiliaryImages: string[] = (() => {
    if (!item?.additionalImageUrls) return [];
    if (Array.isArray(item.additionalImageUrls)) return item.additionalImageUrls;
    try {
      const parsed = JSON.parse(item.additionalImageUrls);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const allImages: string[] = [];
  if (item?.imageUrl) allImages.push(item.imageUrl);
  auxiliaryImages.forEach((url) => {
    if (!allImages.includes(url)) allImages.push(url);
  });

  const activeDisplayImage = selectedImage ?? item?.imageUrl ?? null;

  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  const availableTabs: TabType[] = isBusiness
    ? ["Overview", "History", "AI Insights"]
    : ["Overview", "History", "AI Insights", "Recipes"];

  const loadProductHistory = async (productName: string) => {
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

  // Reset tab when item changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab("Overview");
    setShowPortionModal(false);
    if (item) {
      const isInt = isIntegerUnit(item.unit);
      setConsumeQty(isInt ? Math.max(1, Math.min(1, Math.floor(item.quantity))) : Math.min(1, item.quantity));
      // Load real history for this product
      void loadProductHistory(item.name);

      // Check for active reminder in local storage
      try {
        const stored = localStorage.getItem("shelflife_item_reminders");
        if (stored) {
          const map = JSON.parse(stored);
          const entry = map[item.id];
          if (entry && entry.reminderDate) {
            const remDate = new Date(entry.reminderDate);
            if (remDate.getTime() > Date.now()) {
              setActiveReminder(
                remDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })
              );
            } else {
              setActiveReminder(null);
            }
          } else {
            setActiveReminder(null);
          }
        } else {
          setActiveReminder(null);
        }
      } catch {
        setActiveReminder(null);
      }
    } else {
      setActiveReminder(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  if (!item) return null;

  const days = getDaysUntilExpiry(item.expiryDate);

  // Status pills configuration
  const isExpiringSoon = item.status === "Expiring" || (days >= 0 && days <= 3);
  const isExpired = item.status === "Expired" || days < 0;

  const handleMarkAsUsed = async (quantityToUse: number) => {
    if (!item) return;
    const isInt = isIntegerUnit(item.unit);
    if (!Number.isFinite(quantityToUse) || quantityToUse <= 0 || quantityToUse > item.quantity) {
      return;
    }
    if (isInt && !Number.isInteger(quantityToUse)) {
      return;
    }
    const cleanQty = isInt ? Math.round(quantityToUse) : Math.round(quantityToUse * 10000) / 10000;
    setIsConsuming(true);
    try {
      const res = await consumeIngredientsAction([
        {
          itemId: item.id,
          quantityUsed: cleanQty,
        },
      ]);
      if (res.success) {
        setShowPortionModal(false);
        onRefresh();
        if (cleanQty >= item.quantity) {
          onClose();
        } else {
          void loadProductHistory(item.name);
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
          <div className="space-y-2">
            <div className="relative flex h-52 sm:h-56 w-full items-center justify-center rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-4 shadow-xs">
              <ProductImage
                src={activeDisplayImage}
                alt={item.name}
                category={item.category}
                className="h-full w-full"
                size="lg"
                priority
              />
            </div>

            {isOpenFoodFactsImage(activeDisplayImage) && (
              <p className="text-[11px] text-[var(--app-text-muted)] text-center leading-tight">
                Product image via{" "}
                <a
                  href="https://world.openfoodfacts.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[var(--app-text-display)] transition inline-flex items-center gap-0.5 font-medium"
                >
                  Open Food Facts
                  <ExternalLink size={10} className="inline ml-0.5" />
                </a>
                {" "}(ODbL).
              </p>
            )}

            {/* Auxiliary View Thumbnails Carousel */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {allImages.map((imgUrl, idx) => {
                  const isCurrent = activeDisplayImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        isCurrent
                          ? "border-[var(--shelf-forest)] ring-2 ring-[var(--shelf-forest)]/20 shadow-xs"
                          : "border-[var(--app-border-subtle)] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`Angle view ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] font-bold text-white text-center py-0.5">
                          Main
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
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

            {activeReminder && (
              <button
                type="button"
                onClick={() => setShowReminderModal(true)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition cursor-pointer"
                title="Click to view or adjust expiry reminder"
              >
                <Bell size={12} />
                <span>Reminder: {activeReminder}</span>
              </button>
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
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] block">
                      Expiration
                    </span>
                    {item.expiryType === "AI_ESTIMATED" && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-help"
                        title={`Estimated based on standard grocery shelf life for ${item.category}. Tap Edit to adjust.`}
                      >
                        <Sparkles size={10} className="shrink-0" />
                        Estimated ✦
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-bold text-[var(--app-text-display)] truncate flex items-center gap-1.5">
                    <Calendar size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      {item.expiryDate
                        ? new Date(item.expiryDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Date Not Available"}
                    </span>
                  </p>
                  {Number.isFinite(days) ? (
                    <span className="text-[10px] font-medium text-[var(--app-text-muted)] block mt-0.5">
                      {days < 0 ? "Expired" : `${days} days left`}{item.expiryType === "AI_ESTIMATED" ? " (Est.)" : ""}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[var(--app-text-muted)] block mt-0.5">
                      Expiry not tracked
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
                {showPortionModal ? (() => {
                  const isInt = isIntegerUnit(item.unit);
                  const minVal = isInt ? 1 : Math.min(item.quantity, 0.001);
                  const stepVal = isInt ? "1" : "any";
                  const inputModeVal = isInt ? "numeric" : "decimal";
                  const remaining = Math.max(0, Math.round((item.quantity - consumeQty) * 10000) / 10000);

                  return (
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
                          min={minVal}
                          max={item.quantity}
                          step={stepVal}
                          inputMode={inputModeVal}
                          value={consumeQty}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              setConsumeQty(minVal);
                              return;
                            }
                            const val = isInt ? parseInt(raw, 10) : parseFloat(raw);
                            if (Number.isFinite(val)) {
                              if (val <= 0) {
                                setConsumeQty(minVal);
                              } else if (val > item.quantity) {
                                setConsumeQty(item.quantity);
                              } else {
                                setConsumeQty(isInt ? Math.round(val) : Math.round(val * 10000) / 10000);
                              }
                            }
                          }}
                          className="flex-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3 py-1.5 text-sm text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
                        />
                        <button
                          type="button"
                          onClick={() => setConsumeQty(item.quantity)}
                          className="rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-2.5 py-1.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition cursor-pointer"
                        >
                          All
                        </button>
                      </div>

                      <p className="text-[11px] text-[var(--app-text-muted)]">
                        {consumeQty >= item.quantity
                          ? "All stock will be marked consumed."
                          : `Remaining stock: ${remaining} ${item.unit}`}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPortionModal(false)}
                          className="flex-1 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] py-2 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkAsUsed(consumeQty)}
                          disabled={isConsuming || !Number.isFinite(consumeQty) || consumeQty <= 0 || consumeQty > item.quantity || (isInt && !Number.isInteger(consumeQty))}
                          className="flex-1 rounded-lg bg-[var(--app-accent-emerald)] py-2 text-xs font-bold text-white hover:brightness-105 transition disabled:opacity-50 cursor-pointer"
                        >
                          {isConsuming ? "Logging..." : "Confirm Used"}
                        </button>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPortionModal(true)}
                      className="sl-focus-ring flex items-center justify-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-105 transition cursor-pointer"
                    >
                      <Utensils size={14} />
                      <span>Mark as Used</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="sl-focus-ring flex items-center justify-center gap-1.5 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-2.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
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

                {/* Add More Stock - Contextual Restock Modal */}
                <button
                  type="button"
                  onClick={() => setShowRestockModal(true)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={14} className="text-[var(--app-accent-emerald)]" />
                    <span>Add More Stock</span>
                  </span>
                  <ChevronRight size={14} className="text-[var(--app-text-muted)]" />
                </button>

                {/* Set Expiry Reminder - Contextual Item-Specific Reminder Modal */}
                <button
                  type="button"
                  onClick={() => setShowReminderModal(true)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <Bell size={14} className="text-blue-500" />
                    <span>Set Expiry Reminder</span>
                  </span>
                  <ChevronRight size={14} className="text-[var(--app-text-muted)]" />
                </button>

                {/* Move to Another Category - Inline Category Reassigner */}
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <Folder size={14} className="text-amber-500" />
                    <span>Move to Another Category</span>
                  </span>
                  <ChevronRight size={14} className="text-[var(--app-text-muted)]" />
                </button>

                {/* Delete Product - Safe Deletion Dialog with Reason Tracking & Undo */}
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer text-left"
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

      {/* Contextual Action Modals (Spec 05) */}
      <ProductRestockModal
        isOpen={showRestockModal}
        onClose={() => setShowRestockModal(false)}
        item={item}
        isBusiness={isBusiness}
        onSuccess={(newQty) => {
          item.quantity = newQty;
          onRefresh();
        }}
      />

      <ProductCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        item={item}
        onSuccess={(newCat) => {
          item.category = newCat;
          onRefresh();
        }}
      />

      <ProductReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        item={item}
        onSuccess={(formattedDate) => {
          setActiveReminder(formattedDate);
          onRefresh();
        }}
      />

      <ProductDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        item={item}
        onSuccess={(deletedId) => {
          setShowDeleteModal(false);
          onClose();
          onRefresh();
          onDelete?.(deletedId);
        }}
        onRestore={() => {
          onRefresh();
        }}
      />
    </>
  );
}
