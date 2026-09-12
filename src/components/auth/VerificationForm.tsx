"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { AlertCircle, Loader2 } from "lucide-react";

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
        setError("This verification link is invalid or has expired. Please request a new verification email.");
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
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs sm:text-sm text-red-300 text-left"
      >
        <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-4 text-sm text-[#aab7ab]"
    >
      <Loader2 className="h-6 w-6 animate-spin text-[#22c55e]" />
      <span>Verifying your email and preparing your workspace...</span>
    </div>
  );
}
