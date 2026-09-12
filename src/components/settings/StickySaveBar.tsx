"use client";

import { Check, Loader2, AlertCircle, RotateCcw } from "lucide-react";

interface StickySaveBarProps {
  visible: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  message?: string;
}

export default function StickySaveBar({
  visible,
  isSaving,
  onSave,
  onDiscard,
  message = "You have unsaved changes",
}: StickySaveBarProps) {
  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Unsaved changes bar"
      className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:right-8 sm:left-auto z-40 max-w-lg transition-all animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-center justify-between gap-4 p-3 sm:px-4 sm:py-3 rounded-2xl bg-[var(--shelf-surface)]/95 dark:bg-stone-900/95 backdrop-blur-md border border-[var(--shelf-border)] shadow-xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className="text-xs font-semibold text-[var(--shelf-dark)] truncate">
            {message}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isSaving}
            onClick={onDiscard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] hover:bg-[var(--shelf-border)]/40 transition disabled:opacity-50"
          >
            <RotateCcw size={13} />
            <span>Discard</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[var(--shelf-forest)] text-white shadow-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={13} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
