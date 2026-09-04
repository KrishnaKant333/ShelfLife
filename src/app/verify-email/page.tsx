import Link from "next/link";
import { verifyEmailAction } from "@/lib/actions/auth";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-[var(--shelf-dark)]">Invalid verification link</h1>
        <p className="mt-3 text-[var(--shelf-muted)]">This link is missing its verification token.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-[var(--shelf-dark)]">Verify your email</h1>
      <p className="mt-3 text-[var(--shelf-muted)]">Confirm your email address to finish creating your ShelfLife account.</p>
      <form action={verifyEmailAction.bind(null, token)} className="mt-8">
        <button className="rounded-xl bg-[var(--shelf-forest)] px-5 py-3 font-semibold text-white">Verify email address</button>
      </form>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-[var(--shelf-forest)]">Return home</Link>
    </main>
  );
}