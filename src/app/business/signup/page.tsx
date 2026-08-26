import Link from "next/link";

import BusinessSignupForm from "@/components/auth/BusinessSignupForm";

export default function BusinessSignupPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-md">
        <Link
          href="/"
          className="text-sm font-medium opacity-70 transition hover:opacity-100"
        >
          ← Back to ShelfLife
        </Link>

        <div className="mb-8 mt-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Set up your business
          </h1>

          <p className="mt-3 text-sm opacity-70">
            Manage inventory, expiry dates, stock levels, and
            business operations with ShelfLife.
          </p>
        </div>

        <BusinessSignupForm />

        <div className="mt-8 rounded-xl border p-4 text-center text-sm">
          Managing your personal inventory?{" "}
          <Link
            href="/consumer/signup"
            className="font-semibold underline underline-offset-4"
          >
            Create a consumer account
          </Link>
        </div>
      </div>
    </main>
  );
}