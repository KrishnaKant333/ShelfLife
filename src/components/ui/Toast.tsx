"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col gap-2 sm:max-w-sm"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="alert"
              className={`flex items-start gap-3 rounded-[var(--sl-radius-md)] border px-4 py-3 text-sm font-medium shadow-[var(--sl-shadow-lg)] transition-all ${
                toast.type === "success"
                  ? "bg-[var(--sl-color-surface-raised)] border-[var(--sl-color-success)]/40 text-[var(--sl-color-text)]"
                  : "bg-[var(--sl-color-surface-raised)] border-[var(--sl-color-danger)]/40 text-[var(--sl-color-text)]"
              }`}
            >
              {toast.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--sl-color-success)] mt-0.5" />
              ) : (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--sl-color-danger)] mt-0.5" />
              )}
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="sl-focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--sl-radius-sm)] text-[var(--sl-color-text-muted)] hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)] transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
