import Link from "next/link";
import CsvImport from "@/components/dashboard/CsvImport";

export default function BusinessInventoryImportPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 md:px-0 py-6 md:py-10">
      <div className="mb-6 md:mb-8">
        <Link
          href="/business/dashboard/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-forest)] hover:underline transition-colors"
        >
          <span aria-hidden="true">←</span> Back to Inventory
        </Link>
        <h1 className="sl-display-serif mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-[var(--app-text-display)]">
          Bulk Import Products
        </h1>
        <p className="mt-1.5 text-sm text-[var(--app-text-muted)]">
          Upload bulk commercial supplier inventory spreadsheets and verify row mapping before committing.
        </p>
      </div>

      <CsvImport />
    </main>
  );
}