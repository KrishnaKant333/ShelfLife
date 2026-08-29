import Link from "next/link";
import InvoiceImport from "@/components/dashboard/InvoiceImport";

export default function ConsumerInvoiceImportPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="mb-8">
        <Link
          href="/dashboard/inventory"
          className="text-sm font-semibold text-[var(--shelf-forest)] hover:underline"
        >
          ← Back to Inventory
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
          AI Invoice Import
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Upload an image of a business invoice or receipt, and ShelfLife will auto-extract products.
        </p>
      </div>

      <InvoiceImport />
    </main>
  );
}
