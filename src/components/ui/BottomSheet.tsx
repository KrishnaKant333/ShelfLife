"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-lg",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Touch handlers for mobile swipe-down dismissal
  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    if (diff > 0) {
      // Only drag downward
      setTranslateY(diff);
    }
  }

  function handleTouchEnd() {
    if (translateY > 120) {
      // Swipe threshold exceeded
      onClose();
    }
    setTranslateY(0);
    setTouchStartY(null);
    setIsDragging(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Interactive bottom sheet"}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: translateY > 0 ? `translateY(${translateY}px)` : undefined,
          transition: isDragging ? "none" : "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`w-full ${maxWidth} bg-[var(--shelf-surface)] border-t md:border border-[var(--shelf-border)] rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh] animate-in slide-in-from-bottom-6 md:zoom-in-95 duration-200`}
      >
        {/* Mobile Tactile Drag Handle Bar */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="md:hidden pt-3 pb-1 cursor-grab active:cursor-grabbing flex items-center justify-center w-full select-none touch-none"
        >
          <div className="w-12 h-1.5 rounded-full bg-[var(--shelf-border-strong)]/80 dark:bg-stone-700" />
        </div>

        {/* Header */}
        {(title || description) && (
          <div className="px-5 py-3.5 border-b border-[var(--shelf-border)] flex items-start justify-between gap-3">
            <div>
              {title && (
                <h3 className="text-base font-serif font-semibold text-[var(--shelf-dark)] leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="touch-target p-1.5 -mr-1.5 rounded-xl text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] hover:bg-[var(--shelf-border)]/40 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 dark:bg-white/[0.01] pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
