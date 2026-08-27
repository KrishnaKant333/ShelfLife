import Link from "next/link";

import BusinessInvoiceUpload from "@/components/business/BusinessInvoiceUpload";

export default function BusinessInvoicePage() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="mb-8">
        <Link
          href="/business/dashboard/inventory"
          className="text-sm font-medium text-[var(--shelf-forest)]"
        >
          ← Back to inventory
        </Link>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Import from Invoice
        </h1>

        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Upload an invoice and ShelfLife will extract
          the products for you.
        </p>
      </div>

      <BusinessInvoiceUpload />
    </main>
  );
}