import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
}

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--shelf-muted)]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--shelf-dark)] md:mt-3 md:text-3xl">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs text-[var(--shelf-muted)]">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--shelf-cream)] text-[var(--shelf-forest)]">
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}