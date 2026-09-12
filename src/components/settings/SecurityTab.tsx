"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, KeyRound, Smartphone, LogOut, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { updatePasswordAction } from "@/lib/actions/settings";

export default function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setStatusMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    startTransition(async () => {
      const res = await updatePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({ type: "success", text: res.message || "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <section className="sl-editorial-card p-6 space-y-5">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <KeyRound size={18} className="text-[var(--shelf-forest)]" />
            Security & Password Management
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Maintain account security with a strong password. Never reuse passwords across services.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                statusMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20"
              }`}
            >
              {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="current-password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] text-sm text-[var(--shelf-dark)] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--shelf-forest)] text-white shadow-xs hover:opacity-90 active:scale-95 transition disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Updating Credentials...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Active Device Session */}
      <section className="sl-editorial-card p-6 space-y-4">
        <div className="border-b border-[var(--shelf-border)] pb-3">
          <h3 className="text-base font-serif font-medium text-[var(--shelf-dark)] flex items-center gap-2">
            <Smartphone size={18} className="text-[var(--shelf-forest)]" />
            Active Session & Authentication
          </h3>
          <p className="text-xs text-[var(--shelf-muted)] mt-0.5">
            Devices and browser instances with active authorization tokens.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/20 dark:bg-white/[0.01] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold text-[var(--shelf-dark)]">
                Current Browser Session (Active Now)
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-[var(--shelf-forest)] font-bold uppercase">
                JWT Auth.js
              </span>
            </div>
            <p className="text-[11px] text-[var(--shelf-muted)]">
              Encrypted session token with automatic credential rotation.
            </p>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </section>

      {/* Enterprise Two-Factor Standby */}
      <section className="sl-editorial-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-[var(--shelf-forest)]" />
            <div>
              <h4 className="text-xs font-semibold text-[var(--shelf-dark)]">
                Two-Factor Hardware Authentication (FIDO2 / WebAuthn)
              </h4>
              <p className="text-[11px] text-[var(--shelf-muted)] mt-0.5">
                Physical security keys and biometric authentication standby.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-[var(--shelf-cream)] dark:bg-white/5 border border-[var(--shelf-border)] text-[var(--shelf-muted)]">
            Enterprise Standby
          </span>
        </div>
      </section>
    </div>
  );
}
