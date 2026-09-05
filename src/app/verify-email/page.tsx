import Link from "next/link";
import { createHash } from "node:crypto";
import { db } from "@/prisma/db";
import VerificationForm from "@/components/auth/VerificationForm";

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

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const user = await db.orm.public.User.first({
    emailVerificationTokenHash: tokenHash,
  });

  if (!user || !user.emailVerificationExpiresAt || new Date(user.emailVerificationExpiresAt).getTime() < Date.now()) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-[var(--shelf-dark)]">Verification link expired</h1>
        <p className="mt-3 text-[var(--shelf-muted)]">Request a new verification email to continue.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-[var(--shelf-forest)]">Return home</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-[var(--shelf-dark)]">Verify your email</h1>
      <p className="mt-3 text-[var(--shelf-muted)]">Confirm your email address to finish creating your ShelfLife account.</p>
      <VerificationForm token={token} accountType={user.accountType} />
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-[var(--shelf-forest)]">Return home</Link>
    </main>
  );
}