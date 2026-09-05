import Link from "next/link";
import {
  Plus,
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

      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex min-h-32 flex-col justify-between rounded-xl border border-[var(--shelf-border)] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--shelf-sage)] hover:shadow-sm sm:min-h-0 sm:p-4"
            >
              <div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${action.color} sm:h-10 sm:w-10`}>
                  <Icon size={18} />
                </div>
                <h4 className="mt-3 text-sm font-semibold text-[var(--shelf-dark)] group-hover:text-[var(--shelf-forest)] sm:mt-4">
                  {action.label}
                </h4>
                <p className="mt-1 text-[11px] leading-5 text-[var(--shelf-muted)] sm:text-xs">
                  {action.description}
                </p>
              </div>
              <div className="mt-3 text-[11px] font-semibold text-[var(--shelf-forest)] group-hover:underline sm:mt-4 sm:text-xs">
                Launch →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}