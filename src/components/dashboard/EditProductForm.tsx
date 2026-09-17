"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Package,
  Layers,
  Scale,
  Calendar,
  Check,
  AlertCircle,
  Upload,
  Search,
  Loader2,
  Globe,
  Trash2,
} from "lucide-react";

import {
  updateInventoryItem,
  lookupProductImageAction,
  type CreateInventoryState,
} from "@/lib/actions/inventory";
import { uploadSingleProductImageAction } from "@/lib/actions/label-scan";
import { isIntegerUnit, formatDateForInput } from "@/lib/normalization";
import { isOpenFoodFactsImage } from "@/lib/openfoodfacts";
import ProductThumbnail from "@/components/inventory/ProductThumbnail";

interface EditProductFormProps {
  product: {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    expiryType?: string | null;
    imageUrl?: string | null;
    additionalImageUrls?: string | null;
  };
}

const initialState: CreateInventoryState = {};

export default function EditProductForm({
  product,
}: EditProductFormProps) {
  const updateAction = updateInventoryItem.bind(
    null,
    product.id
  );

  const [state, formAction, pending] = useActionState(
    updateAction,
    initialState
  );
  const [unit, setUnit] = useState(product.unit || "");
  const [expiryDateValue, setExpiryDateValue] = useState(formatDateForInput(product.expiryDate));
  const [expiryTypeState, setExpiryTypeState] = useState(product.expiryType ?? (product.expiryDate ? "MANUFACTURER_EXPIRY" : "UNKNOWN"));
  const isInt = isIntegerUnit(unit);
  const isEstimated = expiryTypeState === "AI_ESTIMATED";

  const [currentImageUrl, setCurrentImageUrl] = useState(product.imageUrl || "");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setLookupMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadSingleProductImageAction(formData);
      if (res.url) {
        setCurrentImageUrl(res.url);
      }
    } catch (err: any) {
      setLookupMessage(err.message || "Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLookup() {
    setLookupLoading(true);
    setLookupMessage("");
    try {
      const res = await lookupProductImageAction(product.name, product.category);
      if (res.imageUrl) {
        setCurrentImageUrl(res.imageUrl);
        setLookupMessage("Authentic packaging matched via Open Food Facts (ODbL)!");
      } else {
        setLookupMessage("No authentic match found. Category fallback icon will be used.");
      }
    } catch {
      setLookupMessage("Lookup timed out. Category fallback icon will be used.");
    } finally {
      setLookupLoading(false);
    }
  }

  return (
    <form
      action={formAction}
      className="sl-editorial-card rounded-2xl bg-[var(--app-surface-elevated)] border border-[var(--app-border-subtle)] p-5 md:p-8 shadow-xl relative overflow-hidden"
    >
      {/* Decorative subtle ambient highlight */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Product Imagery Banner: Spec 06 6-Tier Hierarchy Controls */}
      <div className="relative z-10 mb-6 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/20">
              <ProductThumbnail
                src={currentImageUrl}
                alt={product.name}
                category={product.category}
                size="md"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-display)]">
                  Product Thumbnail
                </span>
                {isOpenFoodFactsImage(currentImageUrl) && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Globe size={10} /> Open Food Facts
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                {currentImageUrl
                  ? (isOpenFoodFactsImage(currentImageUrl) ? "Open community verified photo (ODbL)" : "Current active packaging photo")
                  : "No photo attached. Rendering Tier 6 category fallback icon."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text-display)] hover:bg-[var(--app-surface-base)] transition disabled:opacity-50"
            >
              {photoUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {currentImageUrl ? "Change Photo" : "Upload Photo"}
            </button>

            <button
              type="button"
              onClick={() => void handleLookup()}
              disabled={lookupLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-40"
            >
              {lookupLoading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
              Lookup OFF
            </button>

            {currentImageUrl && (
              <button
                type="button"
                onClick={() => setCurrentImageUrl("")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition"
              >
                <Trash2 size={12} />
                Remove
              </button>
            )}
          </div>
        </div>

        {lookupMessage && (
          <p className="mt-3 text-xs font-medium text-[var(--app-accent-emerald)] bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg">
            {lookupMessage}
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoUpload}
        disabled={photoUploading}
        className="sr-only"
      />

      {/* Preserve existing product imagery during text updates */}
      <input type="hidden" name="imageUrl" value={currentImageUrl} />
      {product.additionalImageUrls && (
        <input
          type="hidden"
          name="additionalImageUrls"
          value={product.additionalImageUrls}
        />
      )}
      <input type="hidden" name="expiryType" value={expiryTypeState} />

      <div className="grid gap-5 md:grid-cols-2 md:gap-6 relative z-10">
        {/* Product Name */}
        <div className="group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
          <label
            htmlFor="name"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]"
          >
            <Package size={13} className="text-[var(--app-accent-emerald)]" />
            Product Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            defaultValue={product.name}
            required
            className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)]/50 outline-none transition"
          />
        </div>

        {/* Category */}
        <div className="group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
          <label
            htmlFor="category"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]"
          >
            <Layers size={13} className="text-[var(--app-accent-emerald)]" />
            Category
          </label>

          <input
            id="category"
            name="category"
            type="text"
            defaultValue={product.category}
            required
            className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)]/50 outline-none transition"
          />
        </div>

        {/* Quantity */}
        <div className="group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
          <label
            htmlFor="quantity"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]"
          >
            <Scale size={13} className="text-[var(--app-accent-emerald)]" />
            Quantity
          </label>

          <input
            id="quantity"
            name="quantity"
            type="number"
            min={isInt ? "1" : "0.0001"}
            step={isInt ? "1" : "any"}
            inputMode={isInt ? "numeric" : "decimal"}
            defaultValue={product.quantity}
            required
            className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)]/50 outline-none transition"
          />
        </div>

        {/* Unit */}
        <div className="group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
          <label
            htmlFor="unit"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]"
          >
            <span className="text-[10px] font-bold text-[var(--app-accent-emerald)]">#</span>
            Unit of Measure
          </label>

          <input
            id="unit"
            name="unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            placeholder="e.g. packs, kg, items"
            className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)]/50 outline-none transition"
          />
        </div>

        {/* Expiry Date & Provenance */}
        <div className="md:col-span-2 group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
          <div className="flex items-center justify-between">
            <label
              htmlFor="expiryDate"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]"
            >
              <Calendar size={13} className="text-[var(--app-accent-emerald)]" />
              Expiry Date
            </label>
            {isEstimated && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-500 border border-amber-500/20 cursor-help"
                title={`Estimated based on standard grocery shelf life for ${product.category}. Adjusting date confirms it as manufacturer date.`}
              >
                <Sparkles size={11} className="shrink-0" />
                AI Estimated ✦
              </span>
            )}
          </div>

          <input
            id="expiryDate"
            name="expiryDate"
            type="date"
            value={expiryDateValue}
            onChange={(e) => {
              setExpiryDateValue(e.target.value);
              setExpiryTypeState(e.target.value ? "MANUFACTURER_EXPIRY" : "UNKNOWN");
            }}
            className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] outline-none transition font-mono"
          />
          {isEstimated && (
            <p className="mt-2 text-xs text-amber-500/90 flex items-center gap-1.5">
              <Sparkles size={12} className="shrink-0" />
              Calculated using standard {product.category || "category"} shelf life. Adjusting this date confirms it as authoritative manufacturer expiry.
            </p>
          )}
        </div>
      </div>

      {state.error && (
        <div role="alert" aria-live="polite" className="mt-6 flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="sticky bottom-3 z-20 -mx-2 mt-8 flex items-center justify-end gap-3 border-t border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)]/95 px-3 pt-4 backdrop-blur-md md:static md:mx-0 md:mt-10 md:border-t md:border-[var(--app-border-subtle)]/70 md:bg-transparent md:px-0 md:pt-6 md:backdrop-blur-none">
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center justify-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-display)] transition-all"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--app-accent-emerald)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? (
            "Saving Changes..."
          ) : (
            <>
              <Check size={14} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}