import Link from "next/link";

import AddProductForm from "@/components/dashboard/AddProductForm";

export default function NewInventoryItemPage() {
  return (
    <main className="mx-auto max-w-4xl">
      <div className="mt-8 mb-3 ">
        <Link
          href="/dashboard/inventory"
          className="text-sm font-medium text-[var(--shelf-forest)]">
          ← Back to inventory
        </Link>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Add Product
        </h1>

        <p className="mt-2 text-[var(--shelf-muted)]">
          Add a product to your ShelfLife inventory.
        </p>
      </div>

      <AddProductForm />
    </main>
  );
}