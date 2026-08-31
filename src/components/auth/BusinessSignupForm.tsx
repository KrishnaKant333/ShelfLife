"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { registerBusiness } from "@/lib/actions/auth";

const initialState = {
  error: "",
};

export default function BusinessSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    registerBusiness,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--shelf-dark)]">
          Your name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Your name"
          className="w-full rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3.5 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)] focus:ring-4 focus:ring-[var(--shelf-forest)]/10"
        />
      </div>

      <div>
        <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-[var(--shelf-dark)]">
          Business name
        </label>

        <input
          id="businessName"
          name="businessName"
          type="text"
          autoComplete="organization"
          required
          placeholder="Your business name"
          className="w-full rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3.5 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)] focus:ring-4 focus:ring-[var(--shelf-forest)]/10"
        />
      </div>

      <div>
        <label htmlFor="industry" className="mb-2 block text-sm font-medium text-[var(--shelf-dark)]">
          Industry
        </label>

        <input
          id="industry"
          name="industry"
          type="text"
          required
          placeholder="e.g. Grocery, Retail, Restaurant"
          className="w-full rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3.5 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)] focus:ring-4 focus:ring-[var(--shelf-forest)]/10"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--shelf-dark)]">
          Business email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@business.com"
          className="w-full rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3.5 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)] focus:ring-4 focus:ring-[var(--shelf-forest)]/10"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[var(--shelf-dark)]">
          Password
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="At least 8 characters"
            className="w-full rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3.5 pr-12 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)] focus:ring-4 focus:ring-[var(--shelf-forest)]/10"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-3 flex items-center text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[var(--shelf-dark)]">
          Confirm password
        </label>

        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Repeat your password"
            className="w-full rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3.5 pr-12 text-[var(--shelf-dark)] outline-none transition placeholder:text-[var(--shelf-muted)] focus:border-[var(--shelf-forest)] focus:ring-4 focus:ring-[var(--shelf-forest)]/10"
          />
          <button
            type="button"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="absolute inset-y-0 right-3 flex items-center text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)]"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[var(--shelf-forest)] px-4 py-3.5 font-semibold text-white transition hover:bg-[var(--shelf-dark)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating business..." : "Create Business Account"}
      </button>

      <p className="text-center text-sm text-[var(--shelf-muted)]">
        Already have an account?{" "}
        <Link
          href="/business/login"
          className="font-semibold text-[var(--shelf-dark)] underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}