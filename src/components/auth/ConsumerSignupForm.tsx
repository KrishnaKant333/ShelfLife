"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { registerConsumer } from "@/lib/actions/auth";

const initialState = {
  error: "",
};

export default function ConsumerSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    registerConsumer,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--sl-color-text)]">
          Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Your name"
          className="sl-focus-ring w-full rounded-2xl border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-4 py-3.5 text-[var(--sl-color-text)] outline-none transition placeholder:text-[var(--sl-color-text-muted)]"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--sl-color-text)]">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="sl-focus-ring w-full rounded-2xl border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-4 py-3.5 text-[var(--sl-color-text)] outline-none transition placeholder:text-[var(--sl-color-text-muted)]"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--sl-color-text)]">
          Password
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="sl-focus-ring w-full rounded-2xl border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-4 py-3.5 pr-12 text-[var(--sl-color-text)] outline-none transition placeholder:text-[var(--sl-color-text-muted)]"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            className="sl-focus-ring absolute inset-y-1 right-2 flex w-11 items-center justify-center rounded-xl text-[var(--sl-color-text-muted)] transition hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[var(--sl-color-text)]">
          Confirm password
        </label>

        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Repeat your password"
            className="sl-focus-ring w-full rounded-2xl border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-4 py-3.5 pr-12 text-[var(--sl-color-text)] outline-none transition placeholder:text-[var(--sl-color-text-muted)]"
          />
          <button
            type="button"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="sl-focus-ring absolute inset-y-1 right-2 flex w-11 items-center justify-center rounded-xl text-[var(--sl-color-text-muted)] transition hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {state?.error && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-2xl border border-[var(--sl-color-danger)]/20 bg-[var(--sl-color-danger)]/10 px-4 py-3 text-sm text-[var(--sl-color-danger)]"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="sl-focus-ring w-full rounded-2xl bg-[var(--sl-color-action)] px-4 py-3.5 font-semibold text-[var(--sl-color-on-action)] transition hover:bg-[var(--sl-color-action-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-[var(--sl-color-text-muted)]">
        Already have an account?{" "}
        <Link
          href="/consumer/login"
          className="font-semibold text-[var(--sl-color-text)] underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}