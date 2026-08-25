import Link from "next/link";
import {
  Plus,
  ScanBarcode,
  Upload,
} from "lucide-react";

const actions = [
  {
    label: "Add Product",
    description: "Add inventory manually",
    href: "/dashboard/inventory?action=add",
    icon: Plus,
  },
  {
    label: "Scan Barcode",
    description: "Quickly identify a product",
    href: "/dashboard/inventory?action=scan",
    icon: ScanBarcode,
  },
  {
    label: "Import Inventory",
    description: "Upload a CSV or invoice",
    href: "/dashboard/inventory?action=import",
    icon: Upload,
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-2xl bg-[var(--shelf-surface)] p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-[var(--shelf-dark)]">
        Quick Actions
      </h2>

      <p className="mt-1 text-sm text-[var(--shelf-muted)]">
        Manage your inventory faster.
      </p>

      <div className="mt-6 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-4 rounded-xl border border-[var(--shelf-border)] p-3 transition hover:-translate-y-0.5 hover:border-[var(--shelf-sage)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
                <Icon size={18} />
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--shelf-dark)]">
                  {action.label}
                </p>

                <p className="mt-1 text-xs text-[var(--shelf-muted)]">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}