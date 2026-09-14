"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import {
  createBusinessInventoryItem,
  type BusinessInventoryState,
} from "@/lib/actions/business-inventory";
import { isIntegerUnit } from "@/lib/normalization";

const initialState: BusinessInventoryState = {};

export default function BusinessAddProductForm() {
  const [state, formAction, pending] = useActionState(
    createBusinessInventoryItem,
    initialState,
  );
  const [unit, setUnit] = useState("");
  const isInt = isIntegerUnit(unit);

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-[var(--shelf-surface)] border border-[var(--shelf-border)] p-6 shadow-sm"
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
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-dark)] placeholder:text-[var(--shelf-muted)] px-4 py-3 outline-none transition focus:border-[var(--shelf-forest)]"
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
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-dark)] placeholder:text-[var(--shelf-muted)] px-4 py-3 outline-none transition focus:border-[var(--shelf-forest)]"
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
            placeholder={isInt ? "e.g. 50" : "e.g. 0.5"}
            required
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-dark)] placeholder:text-[var(--shelf-muted)] px-4 py-3 outline-none transition focus:border-[var(--shelf-forest)]"
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
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-dark)] placeholder:text-[var(--shelf-muted)] px-4 py-3 outline-none transition focus:border-[var(--shelf-forest)]"
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
            className="w-full rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-[var(--shelf-dark)] px-4 py-3 outline-none transition focus:border-[var(--shelf-forest)]"
          />
        </div>
      </div>

      {state.error && (
        <p className="mt-5 rounded-xl bg-[var(--shelf-terracotta)]/10 border border-[var(--shelf-terracotta)]/20 px-4 py-3 text-sm text-[var(--shelf-terracotta)]">
          {state.error}
        </p>
      )}

      <div className="mt-8 flex justify-end gap-3">
        <Link
          href="/business/dashboard/inventory"
          className="rounded-xl border border-[var(--shelf-border)] px-5 py-3 text-sm font-medium text-[var(--shelf-dark)] hover:bg-[var(--shelf-cream)] transition"
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