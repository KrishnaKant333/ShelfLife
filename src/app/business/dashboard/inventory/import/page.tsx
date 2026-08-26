import Link from "next/link";

import BusinessCsvImport from "@/components/business/BusinessCsvImport";

export default function BusinessInventoryImportPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-8">
      <div className="mb-8">
        <Link
          href="/business/dashboard/inventory"
          className="text-sm font-medium text-[var(--shelf-forest)]"
        >
          ← Back to inventory
        </Link>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--shelf-dark)]">
          Import Inventory
        </h1>

        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Upload your existing inventory and review it before importing.
        </p>
      </div>

      <BusinessCsvImport />
    </main>
  );
}