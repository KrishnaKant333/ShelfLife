import Link from "next/link";

import BusinessAddProductForm from "@/components/business/BusinessAddProductForm";

export default function BusinessAddProductPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8">
      <div className="mb-6">
        <Link
          href="/business/dashboard/inventory"
          className="text-sm font-medium text-[var(--shelf-forest)]"
        >
          ← Back to inventory
        </Link>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Add Product
        </h1>

        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Add a product to your business inventory.
        </p>
      </div>

      <BusinessAddProductForm />
    </main>
  );
}