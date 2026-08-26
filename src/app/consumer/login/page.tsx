import Link from "next/link";

import ConsumerLoginForm from "@/components/auth/ConsumerLoginForm";

export default function ConsumerLoginPage() {
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
            Sign in to manage your ShelfLife inventory.
          </p>
        </div>

        <ConsumerLoginForm />

        <div className="mt-8 rounded-xl border p-4 text-center text-sm">
          Running a business?{" "}
          <Link
            href="/business/login"
            className="font-semibold underline underline-offset-4"
          >
            Business login
          </Link>
        </div>
      </div>
    </main>
  );
}