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
    return <p role="alert" className="mt-6 rounded-xl bg-[var(--shelf-terracotta)]/10 px-4 py-3 text-sm text-[var(--shelf-terracotta)]">{error}</p>;
  }

  return <p className="mt-6 text-sm text-[var(--shelf-muted)]">Verifying your email and signing you in...</p>;
}
