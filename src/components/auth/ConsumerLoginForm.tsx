"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";

type LoginState = {
  error?: string;
};

const initialState: LoginState = {};

export default function ConsumerLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_previousState: LoginState, formData: FormData) => {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      const result = await signIn("credentials", {
        email,
        password,
        accountType: "consumer",
        redirect: false,
      });

      if (result?.error) {
        return {
          error: "Invalid email or password.",
        };
      }

      window.location.href = "/dashboard";

      return {};
    },
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
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
            autoComplete="current-password"
            required
            placeholder="Your password"
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
        {pending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-[var(--sl-color-text-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/consumer/signup"
          className="font-semibold text-[var(--sl-color-text)] underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}