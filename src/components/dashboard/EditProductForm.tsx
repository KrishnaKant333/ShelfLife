"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  updateInventoryItem,
  type CreateInventoryState,
} from "@/lib/actions/inventory";

interface EditProductFormProps {
  product: {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
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

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-[var(--shelf-surface)] p-4 shadow-2xl md:p-6"
    >
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
            min="1"
            step="any"
            inputMode="decimal"
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
            defaultValue={product.unit}
            required
            className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="expiryDate"
            className="mb-2 block text-sm font-medium"
          >
            Expiry date
          </label>

          <input
            id="expiryDate"
            name="expiryDate"
            type="date"
            defaultValue={product.expiryDate?.slice(0, 10) ?? ""}
            className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition"
          />
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