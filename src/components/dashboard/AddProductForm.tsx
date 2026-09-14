"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import {
  createInventoryItem,
  type CreateInventoryState,
} from "@/lib/actions/inventory";
import { isIntegerUnit } from "@/lib/normalization";

const initialState: CreateInventoryState = {};

export default function AddProductForm() {
  const [state, formAction, pending] = useActionState(
    createInventoryItem,
    initialState
  );
  const [unit, setUnit] = useState("");
  const isInt = isIntegerUnit(unit);

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-[var(--shelf-surface)] p-6 shadow-2xl"
    >
      <div className="grid gap-6 md:grid-cols-2">
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
            placeholder="e.g. Fresh Milk"
            required
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)]"
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
            placeholder="e.g. Dairy"
            required
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)]"
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
            placeholder={isInt ? "e.g. 2" : "e.g. 0.5"}
            required
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)]"
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
            placeholder="e.g. litres, kg, packets"
            required
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)]"
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
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 text-[var(--shelf-dark)] outline-none transition focus:border-[var(--shelf-forest)]"
          />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-5 rounded-xl bg-[var(--shelf-terracotta)]/10 px-4 py-3 text-sm text-[var(--shelf-terracotta)]">
          {state.error}
        </p>
      )}

      <div className="mt-8 flex justify-end gap-3">
        <Link
          href="/dashboard/inventory"
          className="rounded-xl border border-[var(--shelf-border)] px-5 py-3 text-sm font-medium text-[var(--shelf-dark)]"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add Product"}
        </button>
      </div>
    </form>
  );
}