"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, Bell, Search, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface AppHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    accountType: "consumer" | "business";
  };
  alertCount?: number;
  onOpenMobileMenu?: () => void;
}

export default function AppHeader({
  user,
  alertCount = 0,
  onOpenMobileMenu,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isBusiness = user.accountType === "business";
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus mobile input when mobile search is toggled open
  useEffect(() => {
    if (isMobileSearchOpen) {
      mobileInputRef.current?.focus();
    }
  }, [isMobileSearchOpen]);

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`${prefix}/inventory?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`${prefix}/inventory`);
    }
    setIsMobileSearchOpen(false);
  }

  function handleClearSearch() {
    setSearchQuery("");
    if (pathname.includes("/inventory")) {
      router.push(`${prefix}/inventory`);
    }
    searchInputRef.current?.focus();
  }

  // Derive user initials for clean avatar pill
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SL";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)]/90 px-4 sm:px-6 backdrop-blur-md transition-colors">
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen ? (
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full items-center gap-2 md:hidden"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
            />
            <input
              ref={mobileInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inventory & products..."
              className="sl-focus-ring h-10 w-full rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] pl-9 pr-9 text-sm text-[var(--app-text-body)] placeholder:text-[var(--app-text-muted)] outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] hover:text-[var(--app-text-body)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[var(--app-accent-emerald)] px-3 py-2 text-xs font-semibold text-white shadow-2xs"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(false)}
            aria-label="Close search"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)]"
          >
            <X size={20} />
          </button>
        </form>
      ) : (
        <>
          {/* Left Zone: Brand (Mobile) / Workspace Context Badge (Desktop) */}
          <div className="flex items-center gap-3">
            {/* Mobile Logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link href={prefix} className="shrink-0 flex items-center">
                <Image
                  src="/logo/shelflife.png"
                  alt="ShelfLife"
                  width={90}
                  height={28}
                  className="h-7 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Workspace Context Badge (Desktop) */}
            <div className="hidden lg:flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-[var(--app-accent-emerald)] shadow-[0_0_8px_var(--app-accent-emerald)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
                Workspace:
              </span>
              <span className="inline-flex items-center rounded-full border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-2.5 py-0.5 text-xs font-medium text-[var(--app-text-body)]">
                {isBusiness ? "Business Workspace Pro" : "Personal Pantry"}
              </span>
            </div>
          </div>

          {/* Center Zone: Functional Quick Search Form (Desktop) */}
          <div className="hidden md:flex items-center">
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              className="relative flex items-center"
            >
              <Search
                size={14}
                className="pointer-events-none absolute left-3 text-[var(--app-text-muted)]"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inventory & products..."
                aria-label="Search inventory and products"
                className="sl-focus-ring h-9 w-64 lg:w-80 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] pl-9 pr-14 text-xs text-[var(--app-text-body)] placeholder:text-[var(--app-text-muted)] transition hover:border-[var(--app-border-strong)] focus:border-[var(--app-accent-emerald)] outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search input"
                    className="flex h-5 w-5 items-center justify-center rounded text-[var(--app-text-muted)] hover:text-[var(--app-text-body)]"
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center rounded border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--app-text-muted)]">
                    ⌘K
                  </kbd>
                )}
              </div>
            </form>
          </div>

          {/* Right Zone: Actions, Alerts, Notifications, Theme, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Icon Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Open search input"
              className="sl-focus-ring flex md:hidden h-11 w-11 items-center justify-center rounded-xl text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-body)]"
            >
              <Search size={19} />
            </button>

            {/* Actionable Alerts Bell */}
            <Link
              href={`${prefix}/alerts`}
              aria-label={alertCount > 0 ? `${alertCount} urgent alerts require attention` : "Actionable Inventory Safeguards"}
              title="Actionable Inventory Safeguards"
              className="sl-focus-ring relative flex h-11 w-11 items-center justify-center rounded-xl text-[var(--app-accent-terracotta)] hover:bg-[var(--app-surface-base)] transition"
            >
              <AlertTriangle size={19} />
              {alertCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--app-accent-terracotta)] px-1 text-[9px] font-bold text-white shadow-xs">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </Link>

            {/* Quiet Notifications Bell */}
            <Link
              href={`${prefix}/notifications`}
              aria-label="Notifications Activity Feed"
              title="Activity & Notifications Feed"
              className="sl-focus-ring relative flex h-11 w-11 items-center justify-center rounded-xl text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-body)] transition"
            >
              <Bell size={19} />
            </Link>

            {/* Authenticated Workspace Theme Toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>

            <div className="hidden sm:block h-5 w-[1px] bg-[var(--app-border-subtle)] mx-1" />

            {/* User Profile Capsule (Desktop) */}
            <Link
              href={`${prefix}/settings`}
              aria-label="User Settings"
              className="sl-focus-ring hidden sm:flex items-center gap-2 rounded-xl p-1.5 hover:bg-[var(--app-surface-base)] transition min-h-[44px]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--app-accent-emerald)] text-[11px] font-bold text-white shadow-xs">
                {userInitials}
              </div>
              <span className="hidden lg:inline-block max-w-[120px] truncate text-xs font-medium text-[var(--app-text-body)]">
                {user.name || "My Account"}
              </span>
            </Link>

            {/* Mobile Hamburger Drawer Trigger */}
            {onOpenMobileMenu && (
              <button
                type="button"
                onClick={onOpenMobileMenu}
                aria-label="Open mobile navigation menu"
                className="sl-focus-ring flex lg:hidden h-11 w-11 items-center justify-center rounded-xl text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-body)]"
              >
                <Menu size={21} />
              </button>
            )}
          </div>
        </>
      )}
    </header>
  );
}
