"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

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
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#aab7ab]"
        >
          Your name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="e.g. Alex Miller"
          className="sl-focus-ring min-h-[44px] w-full rounded-xl border border-white/10 bg-[#0e1410] px-4 py-2.5 text-sm text-[#f0f5ee] outline-none transition placeholder:text-[#69766b] focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#aab7ab]"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="sl-focus-ring min-h-[44px] w-full rounded-xl border border-white/10 bg-[#0e1410] px-4 py-2.5 text-sm text-[#f0f5ee] outline-none transition placeholder:text-[#69766b] focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#aab7ab]"
        >
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
            className="sl-focus-ring min-h-[44px] w-full rounded-xl border border-white/10 bg-[#0e1410] px-4 py-2.5 pr-12 text-sm text-[#f0f5ee] outline-none transition placeholder:text-[#69766b] focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            className="sl-focus-ring absolute inset-y-1 right-1 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#aab7ab]"
        >
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
            className="sl-focus-ring min-h-[44px] w-full rounded-xl border border-white/10 bg-[#0e1410] px-4 py-2.5 pr-12 text-sm text-[#f0f5ee] outline-none transition placeholder:text-[#69766b] focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
          />
          <button
            type="button"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="sl-focus-ring absolute inset-y-1 right-1 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {state?.error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs sm:text-sm text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="sl-focus-ring flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#2d6042] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#36704d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          "Create Consumer Account"
        )}
      </button>

      <p className="text-center text-xs sm:text-sm text-[#aab7ab]">
        Already have an account?{" "}
        <Link
          href="/consumer/login"
          className="font-semibold text-white underline underline-offset-4 transition hover:text-[#92c69b]"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}