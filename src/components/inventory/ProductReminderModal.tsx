"use client";

import { useState, useMemo } from "react";
import { Bell, Calendar, Clock, Check, Sparkles, AlertTriangle } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import { setExpiryReminderAction } from "@/lib/actions/inventory";
import { useToast } from "@/components/ui/Toast";
import type { InventoryItem } from "@/lib/inventory";

interface ProductReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
  onSuccess: (reminderDate: string) => void;
}

type PresetDays = 1 | 2 | 3 | 7 | "custom";

export default function ProductReminderModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: ProductReminderModalProps) {
  const { showToast } = useToast();

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // Determine initial preset based on whether 3-day preset is still in the future
  const initialPreset: PresetDays = useMemo(() => {
    if (!item?.expiryDate) return 3;
    const expTime = new Date(item.expiryDate).getTime();
    if (expTime - 3 * 24 * 60 * 60 * 1000 >= todayStart.getTime()) return 3;
    if (expTime - 1 * 24 * 60 * 60 * 1000 >= todayStart.getTime()) return 1;
    return "custom";
  }, [item?.expiryDate, todayStart]);

  const [selectedPreset, setSelectedPreset] = useState<PresetDays>(initialPreset);
  const [customDate, setCustomDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate target reminder date
  const targetDate: Date = (() => {
    if (selectedPreset === "custom" && customDate) {
      const d = new Date(customDate + (customDate.includes("T") ? "" : "T00:00:00"));
      if (!Number.isNaN(d.getTime())) return d;
    }
    if (item.expiryDate) {
      const exp = new Date(item.expiryDate);
      const days = selectedPreset === "custom" ? 3 : selectedPreset;
      return new Date(exp.getTime() - days * 24 * 60 * 60 * 1000);
    }
    // Fallback if no expiry date on item: 3 days from now
    return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  })();

  const isPastDate = targetDate < todayStart;

  const formattedTarget = targetDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedExpiry = item.expiryDate
    ? new Date(item.expiryDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleConfirm = async () => {
    if (isPastDate) {
      showToast("Reminder date cannot be set in the past.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const days = selectedPreset === "custom" ? 0 : selectedPreset;
      const res = await setExpiryReminderAction(
        item.id,
        days,
        selectedPreset === "custom" ? customDate : undefined
      );

      if (res.success && res.reminderDate) {
        // Save reminder metadata in localStorage so drawer can render the active reminder badge
        try {
          const raw = localStorage.getItem("shelflife_item_reminders");
          const map = raw ? JSON.parse(raw) : {};
          map[item.id] = {
            reminderDate: res.reminderDate,
            scheduledLabel: formattedTarget,
            setAt: new Date().toISOString(),
          };
          localStorage.setItem("shelflife_item_reminders", JSON.stringify(map));
        } catch {
          // ignore
        }

        showToast(`Reminder scheduled for ${formattedTarget}.`, "success");
        onSuccess(res.reminderDate);
        onClose();
      } else {
        showToast(res.error || "Failed to schedule reminder.", "error");
      }
    } catch {
      showToast("An error occurred while saving reminder.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Set Expiry Reminder: ${item.name}`}
      description={
        formattedExpiry
          ? `Product is marked to expire on ${formattedExpiry}.`
          : "Schedule a notification in your activity feed to check this item."
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Preset Selector Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[var(--app-text-body)]">
            Remind me:
          </label>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 1 as PresetDays, label: "1 day before expiry" },
              { id: 2 as PresetDays, label: "2 days before expiry" },
              { id: 3 as PresetDays, label: "3 days before expiry (Default)" },
              { id: 7 as PresetDays, label: "1 week before expiry" },
            ].map((p) => {
              const isSelected = selectedPreset === p.id;
              const presetTime = item.expiryDate
                ? new Date(item.expiryDate).getTime() - (p.id as number) * 24 * 60 * 60 * 1000
                : Date.now() + 3 * 24 * 60 * 60 * 1000;
              const isPresetPassed = presetTime < todayStart.getTime();

              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={isPresetPassed}
                  onClick={() => setSelectedPreset(p.id)}
                  className={`sl-focus-ring flex items-center justify-between rounded-xl border p-3 text-left transition ${
                    isPresetPassed
                      ? "border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] text-[var(--app-text-muted)] opacity-40 cursor-not-allowed"
                      : isSelected
                      ? "border-[var(--app-accent-emerald)] bg-[var(--app-accent-emerald)]/10 text-[var(--app-accent-emerald)] font-bold shadow-2xs cursor-pointer"
                      : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] cursor-pointer"
                  }`}
                >
                  <span className="text-xs leading-tight">
                    {p.label}
                    {isPresetPassed && (
                      <span className="block text-[10px] text-rose-500 font-normal mt-0.5">
                        Passed
                      </span>
                    )}
                  </span>
                  {isSelected && !isPresetPassed && (
                    <Check size={14} className="text-[var(--app-accent-emerald)] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Date Option */}
          <button
            type="button"
            onClick={() => {
              setSelectedPreset("custom");
              if (!customDate) {
                setCustomDate(todayStr);
              }
            }}
            className={`sl-focus-ring flex w-full items-center justify-between rounded-xl border p-3 text-left transition cursor-pointer ${
              selectedPreset === "custom"
                ? "border-[var(--app-accent-emerald)] bg-[var(--app-accent-emerald)]/10 text-[var(--app-accent-emerald)] font-bold"
                : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text-display)]"
            }`}
          >
            <span className="text-xs flex items-center gap-2">
              <Calendar size={13} />
              <span>Custom Reminder Date</span>
            </span>
            {selectedPreset === "custom" && <Check size={14} className="text-[var(--app-accent-emerald)] shrink-0" />}
          </button>

          {selectedPreset === "custom" && (
            <div className="pt-1">
              <input
                type="date"
                min={todayStr}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-3.5 py-2.5 text-xs text-[var(--app-text-display)] outline-none focus:border-[var(--app-accent-emerald)]"
              />
            </div>
          )}
        </div>

        {/* Past Date Warning Alert */}
        {isPastDate && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Reminder date cannot be in the past ({formattedTarget}). Please choose a future date.</span>
          </div>
        )}

        {/* Scheduled Target Confirmation Card */}
        <div className="rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-accent-emerald)]">
            <Bell size={13} />
            <span>Target Notification</span>
          </div>
          <p className="text-sm font-bold text-[var(--app-text-display)] flex items-center gap-2">
            <span>{formattedTarget}</span>
          </p>
          <p className="text-[11px] text-[var(--app-text-muted)]">
            A notification will be logged to your activity ledger on this date.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="sl-focus-ring flex-1 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-2.5 text-xs font-semibold text-[var(--app-text-body)] hover:bg-[var(--app-surface-elevated)] transition cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || isPastDate || (selectedPreset === "custom" && !customDate)}
            className="sl-focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] py-2.5 text-xs font-bold text-white shadow-xs hover:brightness-105 transition disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {isSubmitting ? (
              <span>Scheduling...</span>
            ) : (
              <>
                <Check size={14} />
                <span>Save Reminder</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
