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
          className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="alert"
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium max-w-sm transition-all ${
                toast.type === "success"
                  ? "bg-[var(--shelf-surface)] border-[var(--shelf-forest)]/30 text-[var(--shelf-dark)]"
                  : "bg-[var(--shelf-surface)] border-[var(--shelf-terracotta)]/30 text-[var(--shelf-dark)]"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--shelf-forest)] mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--shelf-terracotta)] mt-0.5" />
              )}
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] transition"
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
