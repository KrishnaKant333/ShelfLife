import Link from "next/link";

import ConsumerSignupForm from "@/components/auth/ConsumerSignupForm";

export default function ConsumerSignupPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium opacity-70 transition hover:opacity-100"
          >
            ← Back to ShelfLife
          </Link>

          <h1 className="mt-8 text-4xl font-bold tracking-tight">
            Create your ShelfLife account
          </h1>

          <p className="mt-3 text-sm opacity-70">
            Keep track of what you have, what is expiring,
            and what you can use next.
          </p>
        </div>

        <ConsumerSignupForm />

        <div className="mt-8 rounded-xl border p-4 text-center text-sm">
          Running a business?{" "}
          <Link
            href="/business/signup"
            className="font-semibold underline underline-offset-4"
          >
            Create a business account
          </Link>
        </div>
      </div>
    </main>
  );
}