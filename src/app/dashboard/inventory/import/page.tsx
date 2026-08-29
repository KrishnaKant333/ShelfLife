import Link from "next/link";
import CsvImport from "@/components/dashboard/CsvImport";

export default function ConsumerInventoryImportPage() {
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
          Bulk Import Products
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Upload your product list CSV file and review details before committing.
        </p>
      </div>

      <CsvImport />
    </main>
  );
}
