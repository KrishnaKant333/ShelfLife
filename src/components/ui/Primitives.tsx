import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { CheckCircle2, Info, Loader2, TriangleAlert } from "lucide-react";

const buttonTones = {
  primary: "bg-[var(--sl-color-action)] text-[var(--sl-color-on-action)] hover:bg-[var(--sl-color-action-hover)]",
  secondary: "border border-[var(--sl-color-border-strong)] bg-[var(--sl-color-surface-raised)] text-[var(--sl-color-text)] hover:bg-[var(--sl-color-surface-inset)]",
  quiet: "text-[var(--sl-color-text-muted)] hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]",
  danger: "bg-[var(--sl-color-danger)] text-white hover:brightness-95",
} as const;

type ButtonTone = keyof typeof buttonTones;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
  loading?: boolean;
}

export function Button({
  tone = "primary",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`sl-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--sl-radius-md)] px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${buttonTones[tone]} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
}

export function Surface({ raised = false, className = "", ...props }: SurfaceProps) {
  return <div {...props} className={`${raised ? "sl-surface-raised" : "sl-surface"} ${className}`} />;
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Field({ label, hint, error, id, className = "", ...props }: FieldProps) {
  const fieldId = id || props.name;
  const descriptionId = hint || error ? `${fieldId}-description` : undefined;

  return (
    <label className="block space-y-2" htmlFor={fieldId}>
      <span className="block text-sm font-semibold text-[var(--sl-color-text)]">{label}</span>
      <input
        {...props}
        id={fieldId}
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        className={`sl-focus-ring min-h-11 w-full rounded-[var(--sl-radius-md)] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface-raised)] px-3.5 py-2.5 text-sm text-[var(--sl-color-text)] outline-none placeholder:text-[var(--sl-color-text-subtle)] focus:border-[var(--sl-color-focus)] ${error ? "border-[var(--sl-color-danger)]" : ""} ${className}`}
      />
      {(hint || error) && (
        <span id={descriptionId} className={`block text-xs ${error ? "text-[var(--sl-color-danger)]" : "text-[var(--sl-color-text-muted)]"}`}>
          {error || hint}
        </span>
      )}
    </label>
  );
}

export function StatusBadge({ tone = "info", children }: { tone?: "success" | "warning" | "danger" | "info"; children: ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "warning" ? TriangleAlert : tone === "danger" ? TriangleAlert : Info;
  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-[var(--sl-radius-pill)] border px-2.5 py-1 text-xs font-semibold sl-status-${tone}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-[var(--sl-radius-md)] bg-[var(--sl-color-surface-inset)] ${className}`} />;
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="sl-surface flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
      {icon && <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--sl-radius-lg)] bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)]">{icon}</div>}
      <h2 className="text-lg font-semibold text-[var(--sl-color-text)]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--sl-color-text-muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
