"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {

  function selectAudience(
    audience: "business" | "consumer"
  ) {
    document
      .getElementById("audience")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    window.dispatchEvent(
      new CustomEvent("shelflife-audience", {
        detail: audience,
      })
    );
  }

  return (
    <nav className="bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-[var(--shelf-border)] bg-[var(--background)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo/shelflife.png"
            alt="ShelfLife"
            width={150}
            height={150}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#product"
            className="text-sm text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)]"
          >
            Product
          </a>

          <button
            className="text-sm text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)] cursor-pointer"
            type="button"
            onClick={() => selectAudience("business")}
          >
            For Business
          </button>

          <button
            className="text-sm text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)] cursor-pointer"
            type="button"
            onClick={() => selectAudience("consumer")}
          >
            For Consumers
          </button>

          <a
            href="#pricing"
            className="text-sm text-[var(--shelf-muted)] transition hover:text-[var(--shelf-dark)]"
          >
            Pricing
          </a>
        </div>
        {/* Desktop CTA */}
        <Link
          href="/dashboard"
          className="hidden items-center gap-2 rounded-full bg-[var(--shelf-green)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--shelf-dark)] md:flex"
        >
          Get Started
          <ArrowRight size={16} />
        </Link>

        {/* Mobile menu */}
        <details className="relative md:hidden">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--shelf-border)] bg-white text-[var(--shelf-dark)]">
            <Menu size={20} />
          </summary>

          <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-[var(--shelf-border)] bg-white p-3 shadow-lg">

            <div className="flex flex-col">
              <a
                href="#product"
                className="rounded-xl px-4 py-3 text-sm text-[var(--shelf-muted)] hover:bg-[var(--shelf-light)]"
              >
                Product
              </a>

              <a
                href="#business"
                className="rounded-xl px-4 py-3 text-sm text-[var(--shelf-muted)] hover:bg-[var(--shelf-light)]"
              >
                For Businesses
              </a>

              <a
                href="#consumers"
                className="rounded-xl px-4 py-3 text-sm text-[var(--shelf-muted)] hover:bg-[var(--shelf-light)]"
              >
                For Consumers
              </a>

              <a
                href="#pricing"
                className="rounded-xl px-4 py-3 text-sm text-[var(--shelf-muted)] hover:bg-[var(--shelf-light)]"
              >
                Pricing
              </a>

              <Link
                href="/dashboard"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[var(--shelf-green)] px-4 py-3 text-sm font-medium text-white"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </details>

      </div>
    </nav>
  );
}