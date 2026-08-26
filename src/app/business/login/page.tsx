import Link from "next/link";

import BusinessLoginForm from "@/components/auth/BusinessLoginForm";

export default function BusinessLoginPage() {
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
            Welcome back
          </h1>

          <p className="mt-3 text-sm opacity-70">
            Sign in to manage your business with ShelfLife.
          </p>
        </div>

        <BusinessLoginForm />

        <div className="mt-8 rounded-xl border p-4 text-center text-sm">
          Managing your personal inventory?{" "}
          <Link
            href="/consumer/login"
            className="font-semibold underline underline-offset-4"
          >
            Consumer login
          </Link>
        </div>
      </div>
    </main>
  );
}