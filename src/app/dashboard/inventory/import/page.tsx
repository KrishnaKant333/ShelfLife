import Link from "next/link";
import CsvImport from "@/components/dashboard/CsvImport";

export default function ConsumerInventoryImportPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 md:px-0 py-6 md:py-10">
      <div className="mb-6 md:mb-8">
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-forest)] hover:underline transition-colors"
        >
          <span aria-hidden="true">←</span> Back to Inventory
        </Link>
        <h1 className="sl-display-serif mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-[var(--app-text-display)]">
          Bulk Import Products
        </h1>
        <p className="mt-1.5 text-sm text-[var(--app-text-muted)]">
          Upload standard product CSV spreadsheets and review validation details before committing to your inventory.
        </p>
      </div>

      <CsvImport />
    </main>
  );
}
