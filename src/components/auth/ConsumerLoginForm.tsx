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
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--shelf-dark)]">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
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
            autoComplete="current-password"
            required
            placeholder="Your password"
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
        {pending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-[var(--shelf-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/consumer/signup"
          className="font-semibold text-[var(--shelf-dark)] underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}