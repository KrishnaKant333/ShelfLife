"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

type LoginState = {
  error?: string;
};

const initialState: LoginState = {};

export default function BusinessLoginForm() {
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
          error: "Invalid business email or password.",
        };
      }

      window.location.href = "/business/dashboard";

      return {};
    },
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Business email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@business.com"
          className="w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Your password"
          className="w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2"
        />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign In to Business"}
      </button>

      <p className="text-center text-sm">
        Don&apos;t have a business account?{" "}
        <Link
          href="/business/signup"
          className="font-semibold underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}