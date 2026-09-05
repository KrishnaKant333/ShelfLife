import Link from "next/link";

export default async function VerificationPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--shelf-forest)]">Almost there</p>
      <h1 className="mt-4 text-4xl font-bold text-[var(--shelf-dark)]">Verify your email</h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[var(--shelf-muted)]">
        We created your account. Open the verification link sent to {email || "your email address"} to finish setup. You will be signed in and redirected to your dashboard automatically.
      </p>
      <p className="mt-6 text-sm font-medium text-[var(--shelf-muted)]">Keep this page open or return to it after clicking the link in Gmail. Verification will complete your sign-in and redirect you automatically.</p>
      <Link href="/" className="mt-8 inline-flex rounded-xl border border-[var(--shelf-border)] px-5 py-3 text-sm font-semibold text-[var(--shelf-dark)]">Return home</Link>
    </main>
  );
}
