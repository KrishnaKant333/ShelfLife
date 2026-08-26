import Link from "next/link";

import DeleteBusinessProductButton from "@/components/business/DeleteBusinessProductButton";
import { getBusinessInventory } from "@/lib/business-inventory";
import { getInventoryStatus } from "@/lib/inventory-status";
import { formatExpiry } from "@/lib/format-expiry";

export default async function BusinessInventoryPage() {
  const inventory = await getBusinessInventory();

  return (
    <main className="p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[var(--shelf-forest)]">
              Business Inventory
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--shelf-dark)]">
              Products
            </h1>

            <p className="mt-2 text-sm text-[var(--shelf-muted)]">
              Manage everything currently tracked for your business.
            </p>
          </div>

          
          <div className="flex gap-2">
            <Link
              href="/business/dashboard/inventory/import"
              
              className="inline-flex items-center justify-center rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
            >
              Import CSV
            </Link>

            <Link
              href="/business/dashboard/inventory/new"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--shelf-border)] px-4 py-2.5 bg-white text-sm font-medium text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {inventory.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-[var(--shelf-surface)] p-10 text-center shadow-xl">
            <h2 className="text-lg font-semibold text-[var(--shelf-dark)]">
              No products yet
            </h2>

            <p className="mt-2 text-sm text-[var(--shelf-muted)]">
              Add your first product or import your inventory from a CSV.
            </p>

            <Link
              href="/business/dashboard/inventory/new"
              className="mt-5 inline-flex rounded-xl bg-[var(--shelf-forest)] px-5 py-2.5 text-sm font-medium text-white"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl bg-[var(--shelf-surface)] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="border-b border-[var(--shelf-border)]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium text-[var(--shelf-muted)]">
                      Product
                    </th>

                    <th className="px-6 py-4 text-xs font-medium text-[var(--shelf-muted)]">
                      Category
                    </th>

                    <th className="px-6 py-4 text-xs font-medium text-[var(--shelf-muted)]">
                      Quantity
                    </th>

                    <th className="px-6 py-4 text-xs font-medium text-[var(--shelf-muted)]">
                      Expiry
                    </th>

                    <th className="px-6 py-4 text-xs font-medium text-[var(--shelf-muted)]">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-medium text-[var(--shelf-muted)]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.map((item) => {
                    const status = getInventoryStatus(
                      item.quantity,
                      item.expiryDate,
                    );

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-[var(--shelf-border)] last:border-0"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-[var(--shelf-dark)]">
                          {item.name}
                        </td>

                        <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">
                          {item.category}
                        </td>

                        <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">
                          {item.quantity} {item.unit}
                        </td>

                        <td className="px-6 py-4 text-sm text-[var(--shelf-muted)]">
                          {formatExpiry(item.expiryDate)}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-[var(--shelf-cream)] px-3 py-1 text-xs text-[var(--shelf-dark)]">
                            {status}
                          </span>
                        </td>

                        <td className="flex gap-3 px-6 py-4">
                          <Link
                            href={`/business/dashboard/inventory/${item.id}/edit`}
                            className="text-sm font-medium text-[var(--shelf-forest)] hover:underline"
                          >
                            Edit
                          </Link>

                          <DeleteBusinessProductButton id={item.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}