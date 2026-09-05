"use client";

import { useState } from "react";
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
  const prefix = user.accountType === "business" ? "/business/dashboard" : "/dashboard";
  const alertCount = inventory.reduce((count, item) => {
    const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
    return status === "Expired" || status === "Expiring" || status === "Low Stock" ? count + 1 : count;
  }, 0);

  return (
    <div className="min-h-screen bg-[var(--shelf-cream)] flex flex-col lg:flex-row">
      {/* Mobile Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-3 lg:hidden shadow-sm">
        <Image
          src="/logo/shelflife.png"
          alt="ShelfLife"
          width={100}
          height={32}
          className="h-8 w-auto object-contain"
          priority
        />
        <div className="flex items-center gap-2">
          <Link href={`${prefix}/notifications`} aria-label="Notifications" className="relative rounded-lg p-1.5 text-[var(--shelf-muted)] hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)]">
            <Bell size={20} />
            {alertCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--shelf-terracotta)] px-1 text-[9px] font-bold text-white">{alertCount > 9 ? "9+" : alertCount}</span>}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open dashboard menu"
            className="rounded-lg p-1.5 text-[var(--shelf-muted)] hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)]"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Overlay Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/40 backdrop-blur-xs transition-opacity duration-200">
          <div className="w-64 h-full transform transition-transform duration-300 animate-slide-in">
            <Sidebar user={user} onCloseMobile={() => setMobileMenuOpen(false)} inventory={inventory} />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
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
            <Link href={`${prefix}/notifications`} aria-label="Notifications" className="relative inline-flex rounded-lg p-2 text-[var(--shelf-muted)] hover:bg-[var(--shelf-surface)] hover:text-[var(--shelf-dark)]">
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
