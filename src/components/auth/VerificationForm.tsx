"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function VerificationForm({
  token,
  accountType,
}: {
  token: string;
  accountType: "consumer" | "business";
}) {
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const result = await signIn("credentials", {
        verificationToken: token,
        accountType,
        redirect: false,
      });

      if (cancelled) return;
      if (result?.error) {
        setError("This verification link is invalid or has expired.");
        return;
      }

      window.location.replace(accountType === "business" ? "/business/dashboard" : "/dashboard");
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [accountType, token]);

  if (error) {
    return <p role="alert" aria-live="assertive" className="mt-6 rounded-xl bg-[var(--sl-color-danger)]/10 px-4 py-3 text-sm text-[var(--sl-color-danger)]">{error}</p>;
  }

  return <p role="status" aria-live="polite" className="mt-6 text-sm text-[var(--sl-color-text-muted)]">Verifying your email and signing you in...</p>;
}
