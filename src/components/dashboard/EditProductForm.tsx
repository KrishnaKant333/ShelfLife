"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import {
  updateInventoryItem,
  type CreateInventoryState,
} from "@/lib/actions/inventory";
import { isIntegerUnit } from "@/lib/normalization";

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
  const [expiryDateValue, setExpiryDateValue] = useState(product.expiryDate?.slice(0, 10) ?? "");
  const [expiryTypeState, setExpiryTypeState] = useState(product.expiryType ?? (product.expiryDate ? "MANUFACTURER_EXPIRY" : "UNKNOWN"));
  const isInt = isIntegerUnit(unit);
  const isEstimated = expiryTypeState === "AI_ESTIMATED";

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-[var(--shelf-surface)] p-4 shadow-2xl md:p-6"
    >
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
      <input type="hidden" name="expiryType" value={expiryTypeState} />
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
          >
            Product name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            defaultValue={product.name}
            className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium"
          >
            Category
          </label>

          <input
            id="category"
            name="category"
            type="text"
            defaultValue={product.category}
            required
            className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition"
          />
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="mb-2 block text-sm font-medium"
          >
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
            className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition"
          />
        </div>

        <div>
          <label
            htmlFor="unit"
            className="mb-2 block text-sm font-medium"
          >
            Unit
          </label>

          <input
            id="unit"
            name="unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition"
          />
        </div>

        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium text-[var(--shelf-dark)]"
            >
              Expiry date
            </label>
            {isEstimated && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-help"
                title={`Estimated based on standard grocery shelf life for ${product.category}. Adjusting date confirms it as manufacturer date.`}
              >
                <Sparkles size={12} className="shrink-0" />
                Estimated ✦
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
            className={`sl-focus-ring w-full rounded-xl border bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition ${
              isEstimated
                ? "border-amber-400/80 bg-amber-500/5 focus:border-amber-500"
                : "border-[var(--shelf-border)]"
            }`}
          />
          {isEstimated && (
            <p className="mt-1.5 text-xs text-amber-700/80 dark:text-amber-300/80">
              AI category estimate. Adjusting this date confirms it as manufacturer expiry.
            </p>
          )}
        </div>
      </div>

      {state.error && (
        <p role="alert" aria-live="polite" className="mt-5 rounded-xl bg-[var(--shelf-terracotta)]/10 px-4 py-3 text-sm text-[var(--shelf-terracotta)]">
          {state.error}
        </p>
      )}

      <div className="sticky bottom-3 z-10 -mx-1 mt-6 flex justify-end gap-3 border-t border-[var(--shelf-border)] bg-[var(--shelf-surface)]/95 px-1 pt-4 backdrop-blur-sm md:static md:mx-0 md:mt-8 md:border-0 md:bg-transparent md:px-0 md:pt-0 md:backdrop-blur-none">
        <Link
          href="/dashboard/inventory"
          className="sl-focus-ring rounded-xl border border-[var(--shelf-border)] px-5 py-3 text-sm font-medium text-[var(--shelf-dark)]"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="sl-focus-ring rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}