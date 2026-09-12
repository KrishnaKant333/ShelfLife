"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "For Consumers", href: "#consumer" },
  { label: "For Business", href: "#business" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header className="sticky top-3 sm:top-4 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-6xl transition-all duration-300">
      <nav
        className={`mx-auto flex h-16 sm:h-18 items-center justify-between px-5 sm:px-7 rounded-full border transition-all duration-300 ${
          scrolled
            ? "bg-black/50 border-white/20 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
            : "bg-black/30 border-white/10 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.35)]"
        }`}
      >
        <Link href="/" className="shrink-0 flex items-center">
          <Image
            src="/logo/shelflife.png"
            alt="ShelfLife"
            width={150}
            height={150}
            className="h-10 w-auto object-contain sm:h-12 brightness-110"
            priority
          />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="sl-focus-ring rounded-full px-2 py-1 text-sm font-medium text-white/85 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/consumer/login"
            className="sl-focus-ring rounded-full px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/get-started"
            className="sl-focus-ring inline-flex min-h-10 items-center gap-2 rounded-full bg-[#2d6042] px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#36704d]"
          >
            Get Started
            <ArrowRight size={15} />
          </Link>
        </div>

        <button
          type="button"
          ref={menuButtonRef}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="public-mobile-navigation"
          className="sl-focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {mobileOpen && (
        <div
          id="public-mobile-navigation"
          className="mt-2 rounded-2xl border border-white/15 bg-black/90 p-5 shadow-2xl backdrop-blur-2xl md:hidden"
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="sl-focus-ring rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Link
                href="/consumer/login"
                onClick={() => setMobileOpen(false)}
                className="sl-focus-ring rounded-xl border border-white/20 px-3 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/get-started"
                onClick={() => setMobileOpen(false)}
                className="sl-focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d6042] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#36704d]"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
