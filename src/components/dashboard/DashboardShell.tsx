"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getInventoryStatus } from "@/lib/inventory-status";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    accountType: "consumer" | "business";
  };
  inventory?: InventoryItem[];
}

export default function DashboardShell({ children, user, inventory = [] }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const prefix = user.accountType === "business" ? "/business/dashboard" : "/dashboard";
  const alertCount = inventory.reduce((count, item) => {
    const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
    return status === "Expired" || status === "Expiring" || status === "Low Stock" ? count + 1 : count;
  }, 0);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) mobileMenuButtonRef.current?.focus();
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[var(--sl-color-canvas)] text-[var(--sl-color-text)] flex flex-col lg:flex-row">
      {/* Mobile Top Navigation Bar */}
      <header className="flex min-h-16 items-center justify-between border-b border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] px-4 py-3 lg:hidden shadow-[var(--sl-shadow-sm)]">
        <Image
          src="/logo/shelflife.png"
          alt="ShelfLife"
          width={100}
          height={32}
          className="h-8 w-auto object-contain"
          priority
        />
        <div className="flex items-center gap-2">
          <Link href={`${prefix}/notifications`} aria-label="Notifications" className="sl-focus-ring relative flex h-11 w-11 items-center justify-center rounded-[var(--sl-radius-md)] text-[var(--sl-color-text-muted)] hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]">
            <Bell size={20} />
            {alertCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--shelf-terracotta)] px-1 text-[9px] font-bold text-white">{alertCount > 9 ? "9+" : alertCount}</span>}
          </Link>
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open dashboard menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="dashboard-mobile-navigation"
            className="sl-focus-ring flex h-11 w-11 items-center justify-center rounded-[var(--sl-radius-md)] text-[var(--sl-color-text-muted)] hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Overlay Sidebar Drawer */}
      {mobileMenuOpen && (
        <div id="dashboard-mobile-navigation" className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs transition-opacity duration-200 lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard navigation">
          <div className="h-full w-72 max-w-[86vw] transform transition-transform duration-300 animate-slide-in">
            <Sidebar user={user} onCloseMobile={() => setMobileMenuOpen(false)} inventory={inventory} />
          </div>
          <button type="button" aria-label="Close dashboard navigation" className="flex-1 cursor-default" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <div className={`hidden shrink-0 lg:block ${sidebarCollapsed ? "w-20" : "w-64"}`}>
        <div className="fixed h-screen">
          <Sidebar user={user} inventory={inventory} collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((value) => !value)} />
        </div>
      </div>

      {/* Main Page Content Body */}
      <main className="min-w-0 flex-1 lg:pl-0">
        <div className="relative py-4 md:py-6">
          <div className="absolute right-6 top-2 hidden lg:block">
            <Link href={`${prefix}/notifications`} aria-label="Notifications" className="sl-focus-ring relative inline-flex h-11 w-11 items-center justify-center rounded-[var(--sl-radius-md)] text-[var(--sl-color-text-muted)] hover:bg-[var(--sl-color-surface)] hover:text-[var(--sl-color-text)]">
              <Bell size={20} />
              {alertCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--shelf-terracotta)] px-1 text-[9px] font-bold text-white">{alertCount > 9 ? "9+" : alertCount}</span>}
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
