"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { label: "For Consumers", href: "#consumer" },
  { label: "For Business", href: "#business" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) menuButtonRef.current?.focus();
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--sl-color-border)] bg-[var(--sl-color-canvas)]/90 backdrop-blur-md">
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
              className="sl-focus-ring rounded-[var(--sl-radius-sm)] px-1 text-sm font-medium text-[var(--sl-color-action)] transition hover:text-[var(--sl-color-text)]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/consumer/login"
            className="sl-focus-ring rounded-[var(--sl-radius-pill)] px-4 py-2 text-sm font-medium text-[var(--sl-color-text)] transition hover:bg-[var(--sl-color-surface-inset)]"
          >
            Sign In
          </Link>
          <Link
            href="/get-started"
            className="sl-focus-ring inline-flex min-h-11 items-center gap-2 rounded-[var(--sl-radius-pill)] bg-[var(--sl-color-action)] px-5 py-2.5 text-sm font-semibold text-[var(--sl-color-on-action)] transition hover:bg-[var(--sl-color-action-hover)]"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>

        <button
          type="button"
          ref={menuButtonRef}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="public-mobile-navigation"
          className="sl-focus-ring flex h-11 w-11 items-center justify-center rounded-[var(--sl-radius-md)] border border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] text-[var(--sl-color-text)] md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {mobileOpen && (
        <div id="public-mobile-navigation" className="border-t border-[var(--sl-color-border)] bg-[var(--sl-color-canvas)] md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="sl-focus-ring rounded-[var(--sl-radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--sl-color-text-muted)] transition hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/consumer/login"
              onClick={() => setMobileOpen(false)}
              className="sl-focus-ring mt-2 min-h-11 rounded-[var(--sl-radius-md)] border border-[var(--sl-color-border-strong)] px-3 py-2.5 text-center text-sm font-medium text-[var(--sl-color-text)]"
            >
              Sign In
            </Link>
            <Link
              href="/get-started"
              onClick={() => setMobileOpen(false)}
              className="sl-focus-ring mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--sl-radius-md)] bg-[var(--sl-color-action)] px-3 py-2.5 text-sm font-semibold text-[var(--sl-color-on-action)]"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <div className="mt-3 flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}