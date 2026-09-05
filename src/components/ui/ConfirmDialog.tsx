"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isPending?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  isPending = false,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onCancel]);

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        onKeyDown={handleDialogKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-sm space-y-4 rounded-[var(--sl-radius-xl)] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface-raised)] p-6 shadow-[var(--sl-shadow-lg)]"
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isDestructive
              ? "bg-[var(--sl-color-danger)]/10 text-[var(--sl-color-danger)]"
              : "bg-[var(--sl-color-warning)]/10 text-[var(--sl-color-warning)]"
          }`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="text-base font-bold text-[var(--sl-color-text)]"
            >
              {title}
            </h3>
            <p id="confirm-dialog-message" className="mt-1 text-sm text-[var(--sl-color-text-muted)]">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            ref={cancelButtonRef}
            disabled={isPending}
            className="sl-focus-ring min-h-11 rounded-[var(--sl-radius-md)] border border-[var(--sl-color-border-strong)] bg-[var(--sl-color-surface-raised)] px-4 py-2 text-sm font-semibold text-[var(--sl-color-text)] transition hover:bg-[var(--sl-color-surface-inset)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`sl-focus-ring min-h-11 rounded-[var(--sl-radius-md)] px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${
              isDestructive
                ? "bg-[var(--sl-color-danger)] text-white"
                : "bg-[var(--sl-color-action)] text-[var(--sl-color-on-action)]"
            }`}
          >
            {isPending ? <Loader2 size={16} className="animate-spin" aria-label="Working" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
