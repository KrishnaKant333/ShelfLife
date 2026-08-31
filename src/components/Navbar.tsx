"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "For Consumers", href: "#consumer" },
  { label: "For Business", href: "#business" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--shelf-border)] bg-[var(--background)]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo/shelflife.png"
            alt="ShelfLife"
            width={150}
            height={150}
            className="h-12 w-auto object-contain md:h-14"
            priority
          />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[var(--shelf-forest)] transition hover:text-[var(--shelf-dark)]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/consumer/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
          >
            Sign In
          </Link>
          <Link
            href="/consumer/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--shelf-green)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--shelf-dark)]"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--shelf-border)] bg-white text-[var(--shelf-dark)] md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-[var(--shelf-border)] bg-[var(--background)] md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)]"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/consumer/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-xl border border-[var(--shelf-border)] px-3 py-2.5 text-center text-sm font-medium text-[var(--shelf-dark)]"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--shelf-green)] px-3 py-2.5 text-sm font-medium text-white"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}