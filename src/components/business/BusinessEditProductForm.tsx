"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Package, Layers, Scale, Calendar, Check, AlertCircle } from "lucide-react";

import {
  updateBusinessInventoryItem,
  type BusinessInventoryState,
} from "@/lib/actions/business-inventory";
import { isIntegerUnit, formatDateForInput } from "@/lib/normalization";

interface BusinessEditProductFormProps {
  product: {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    imageUrl?: string | null;
    additionalImageUrls?: string | null;
  };
}

const initialState: BusinessInventoryState = {};

export default function BusinessEditProductForm({
  product,
}: BusinessEditProductFormProps) {
  const updateAction = updateBusinessInventoryItem.bind(
    null,
    product.id,
  );

  const [state, formAction, pending] = useActionState(
    updateAction,
    initialState,
  );
  const [unit, setUnit] = useState(product.unit || "");
  const isInt = isIntegerUnit(unit);

  return (
    <form
      action={formAction}
      className="sl-editorial-card rounded-2xl bg-[var(--app-surface-elevated)] border border-[var(--app-border-subtle)] p-5 md:p-8 shadow-xl relative overflow-hidden"
    >
      {/* Decorative ambient highlight */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Preserve existing product imagery during text updates */}
      {product.imageUrl && (
        <input type="hidden" name="imageUrl" value={product.imageUrl} />
      )}
      {product.additionalImageUrls && (
        <input
          type="hidden"
          name="additionalImageUrls"
          value={product.additionalImageUrls}
        />
      )}

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

        {/* Expiry Date */}
        <div className="md:col-span-2 group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
          <label
            htmlFor="expiryDate"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]"
          >
            <Calendar size={13} className="text-[var(--app-accent-emerald)]" />
            Commercial Expiry Date
          </label>

          <input
            id="expiryDate"
            name="expiryDate"
            type="date"
            defaultValue={formatDateForInput(product.expiryDate)}
            className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] outline-none transition font-mono"
          />
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
          href="/business/dashboard/inventory"
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