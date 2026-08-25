import { getInventory } from "@/lib/inventory";
import { getInventoryStatus } from "@/lib/inventory-status";
import Link from "next/link";
import { formatExpiry } from "@/lib/format-expiry";
import DeleteProductButton from "@/components/dashboard/DeleteProductButton";

export default async function InventoryPage() {
  const inventory = await getInventory();
  return (
    <main className="p-6 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[var(--shelf-forest)]">
              Inventory
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--shelf-dark)]">
              Your Products
            </h1>

            <p className="mt-2 text-sm text-[var(--shelf-muted)]">
              Manage everything currently being tracked.
            </p>
          </div>

          <Link
            href="/dashboard/inventory/new"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
          >
            + Add Product
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-[var(--shelf-surface)] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
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
                    item.expiryDate
                  );

                  return (
                  <tr
                    key={item.name}
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
                    <td className="px-6 py-4 flex gap-2"> 
                      <Link
                        href={`/dashboard/inventory/${item.id}/edit`}
                        className="text-sm font-medium text-[var(--shelf-forest)] hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={item.id} />
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}