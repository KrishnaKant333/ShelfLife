"use client";

import { useActionState } from "react";
import Link from "next/link";

import { registerBusiness } from "@/lib/actions/auth";

const initialState = {
  error: "",
};

export default function BusinessSignupForm() {
  const [state, formAction, pending] = useActionState(
    registerBusiness,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Your name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Your name"
          className="w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2"
        />
      </div>

      <div>
        <label
          htmlFor="businessName"
          className="mb-2 block text-sm font-medium"
        >
          Business name
        </label>

        <input
          id="businessName"
          name="businessName"
          type="text"
          autoComplete="organization"
          required
          placeholder="Your business name"
          className="w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="industry" className="mb-2 block text-sm font-medium">
          Industry
        </label>

        <input
          id="industry"
          name="industry"
          type="text"
          required
          placeholder="e.g. Grocery, Retail, Restaurant"
          className="w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2"
        />
      </div>

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
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="At least 8 characters"
          className="w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium"
        >
          Confirm password
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="Repeat your password"
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
        {pending ? "Creating business..." : "Create Business Account"}
      </button>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/business/login"
          className="font-semibold underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}