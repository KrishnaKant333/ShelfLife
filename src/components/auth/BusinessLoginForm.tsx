"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

type LoginState = {
  error?: string;
};

const initialState: LoginState = {};

export default function BusinessLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_previousState: LoginState, formData: FormData) => {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      const result = await signIn("credentials", {
        email,
        password,
        accountType: "business",
        redirect: false,
      });

      if (result?.error) {
        return {
          error: "Invalid business email or password. Please verify your credentials.",
        };
      }

      window.location.href = "/business/dashboard";
      return {};
    },
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#aab7ab]"
        >
          Business email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@business.com"
          className="sl-focus-ring min-h-[44px] w-full rounded-xl border border-white/10 bg-[#0e1410] px-4 py-2.5 text-sm text-[#f0f5ee] outline-none transition placeholder:text-[#69766b] focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#aab7ab]"
          >
            Password
          </label>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Your password"
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
            <span>Signing in...</span>
          </>
        ) : (
          "Sign In to Business"
        )}
      </button>

      <p className="text-center text-xs sm:text-sm text-[#aab7ab]">
        Don&apos;t have a business account?{" "}
        <Link
          href="/business/signup"
          className="font-semibold text-white underline underline-offset-4 transition hover:text-[#92c69b]"
        >
          Create a business account
        </Link>
      </p>
    </form>
  );
}