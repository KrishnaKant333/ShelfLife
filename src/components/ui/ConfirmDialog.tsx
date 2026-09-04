"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] shadow-xl p-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isDestructive
              ? "bg-[var(--shelf-terracotta)]/10 text-[var(--shelf-terracotta)]"
              : "bg-[var(--shelf-amber)]/10 text-[var(--shelf-amber)]"
          }`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="text-base font-bold text-[var(--shelf-dark)]"
            >
              {title}
            </h3>
            <p className="mt-1 text-sm text-[var(--shelf-muted)]">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--shelf-border)] px-4 py-2 text-sm font-semibold text-[var(--shelf-dark)] bg-[var(--shelf-surface)] hover:bg-[var(--shelf-cream)] transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 ${
              isDestructive
                ? "bg-[var(--shelf-terracotta)]"
                : "bg-[var(--shelf-forest)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
