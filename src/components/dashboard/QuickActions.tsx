import Link from "next/link";
import { Plus, Camera, FileText, Upload, Zap } from "lucide-react";

interface QuickActionsProps {
  isBusiness?: boolean;
}

export default function QuickActions({ isBusiness = false }: QuickActionsProps) {
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  const actions = [
    {
      label: "Add Product",
      description: "Enter inventory item manually",
      href: `${prefix}/inventory/new`,
      icon: Plus,
      color: "text-[var(--shelf-forest)] bg-[var(--shelf-forest)]/10 border-[var(--shelf-forest)]/20",
    },
    {
      label: "Scan Label",
      description: "Extract label with Vision AI",
      href: `${prefix}/inventory/new?tab=label`,
      icon: Camera,
      color: "text-[var(--shelf-sage)] bg-[var(--shelf-sage)]/10 border-[var(--shelf-sage)]/20",
    },
    {
      label: "Import Invoice",
      description: "Auto-extract from invoice photo",
      href: `${prefix}/inventory/invoice`,
      icon: FileText,
      color: "text-[var(--shelf-amber)] bg-[var(--shelf-amber)]/10 border-[var(--shelf-amber)]/20",
    },
    {
      label: "Import CSV",
      description: "Bulk load spreadsheet products",
      href: `${prefix}/inventory/import`,
      icon: Upload,
      color: "text-[var(--shelf-blue)] bg-[var(--shelf-blue)]/10 border-[var(--shelf-blue)]/20",
    },
  ];

  return (
    <section
      aria-labelledby="quick-actions-title"
      className="sl-editorial-card flex flex-col justify-between p-5 sm:p-6 h-full"
    >
      <div>
        <div className="flex items-center justify-between border-b border-[var(--app-border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-surface-base)] text-[var(--shelf-forest)]">
              <Zap size={16} />
            </div>
            <div>
              <h3
                id="quick-actions-title"
                className="font-serif text-base font-bold text-[var(--app-text-display)]"
              >
                Quick Actions
              </h3>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Fast ingestion & tools
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--shelf-muted)] bg-[var(--shelf-cream)]/50 border border-[var(--shelf-border)] px-2 py-0.5 rounded-md">
            Ingestion
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col justify-between rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--shelf-forest)]/40 hover:shadow-xs cursor-pointer"
              >
                <div>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${action.color}`}>
                    <Icon size={16} />
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-[var(--shelf-dark)] group-hover:text-[var(--shelf-forest)] transition-colors">
                    {action.label}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-[var(--shelf-muted)] leading-tight line-clamp-2">
                    {action.description}
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-mono font-bold text-[var(--shelf-forest)] group-hover:underline">
                  Launch →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}