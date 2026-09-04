import Link from "next/link";
import {
  Plus,
  ScanBarcode,
  Camera,
  FileText,
  Upload,
} from "lucide-react";

interface QuickActionsProps {
  isBusiness?: boolean;
}

export default function QuickActions({ isBusiness = false }: QuickActionsProps) {
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  const actions = [
    {
      label: "Add Product",
      description: "Enter inventory manually",
      href: `${prefix}/inventory/new`,
      icon: Plus,
      color: "text-[var(--shelf-forest)] bg-[var(--shelf-cream)]",
    },
    {
      label: "Scan Barcode",
      description: "Scan product barcode via camera",
      href: `${prefix}/inventory/new?tab=barcode`,
      icon: ScanBarcode,
      color: "text-[var(--shelf-blue)] bg-[var(--shelf-blue)]/10",
    },
    {
      label: "Scan Label",
      description: "Extract label details using Groq AI",
      href: `${prefix}/inventory/new?tab=label`,
      icon: Camera,
      color: "text-[var(--shelf-sage)] bg-[var(--shelf-sage)]/10",
    },
    {
      label: "Import Invoice",
      description: "Auto-extract items from invoice photo",
      href: `${prefix}/inventory/invoice`,
      icon: FileText,
      color: "text-[var(--shelf-amber)] bg-[var(--shelf-amber)]/10",
    },
    {
      label: "Import CSV",
      description: "Bulk load spreadsheet products",
      href: `${prefix}/inventory/import`,
      icon: Upload,
      color: "text-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10",
    },
  ];

  return (
    <section className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--shelf-dark)]">
        Quick Actions
      </h2>
      <p className="mt-1 text-sm text-[var(--shelf-muted)]">
        Add or import inventory items using intelligent scan tools.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col justify-between rounded-xl border border-[var(--shelf-border)] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--shelf-sage)] hover:shadow-sm"
            >
              <div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
                  <Icon size={20} />
                </div>
                <h4 className="mt-4 text-sm font-semibold text-[var(--shelf-dark)] group-hover:text-[var(--shelf-forest)]">
                  {action.label}
                </h4>
                <p className="mt-1 text-xs text-[var(--shelf-muted)] leading-relaxed">
                  {action.description}
                </p>
              </div>
              <div className="mt-4 text-xs font-semibold text-[var(--shelf-forest)] group-hover:underline">
                Launch →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}