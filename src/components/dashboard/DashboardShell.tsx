"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import AppHeader from "./AppHeader";
import { getInventoryStatus } from "@/lib/inventory-status";
import MobileActionDock from "@/components/ui/MobileActionDock";

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

export default function DashboardShell({
  children,
  user,
  inventory = [],
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  const alertCount = inventory.reduce((count, item) => {
    const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
    return status === "Expired" || status === "Expiring" || status === "Low Stock"
      ? count + 1
      : count;
  }, 0);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  function handleMobileDrawerKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const focusable = mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  useEffect(() => {
    if (!mobileMenuOpen) mobileMenuButtonRef.current?.focus();
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[var(--app-surface-base)] text-[var(--app-text-body)] flex flex-col lg:flex-row transition-colors">
      {/* Skip to Main Content Link (WCAG 2.2 Standard) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[var(--shelf-forest)] focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          id="dashboard-mobile-navigation"
          className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs transition-opacity duration-200 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard navigation"
        >
          <div
            ref={mobileDrawerRef}
            onKeyDown={handleMobileDrawerKeyDown}
            className="h-full w-72 max-w-[86vw] transform transition-transform duration-300"
          >
            <Sidebar
              user={user}
              onCloseMobile={() => setMobileMenuOpen(false)}
              inventory={inventory}
            />
          </div>
          <button
            type="button"
            aria-label="Close dashboard navigation"
            className="flex-1 cursor-default"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <div
        className={`hidden shrink-0 lg:block transition-[width] duration-200 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="fixed top-0 bottom-0 z-20">
          <Sidebar
            user={user}
            inventory={inventory}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
          />
        </div>
      </div>

      {/* Main Workspace Column */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Unified Authenticated Top Header */}
        <AppHeader
          user={user}
          alertCount={alertCount}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Content Viewport with mobile dock bottom offset */}
        <main id="main-content" className="flex-1 px-3 sm:px-6 lg:px-8 py-5 sm:py-6 pb-28 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* One-Handed Mobile Action Dock */}
      <MobileActionDock user={user} alertCount={alertCount} />
    </div>
  );
}
