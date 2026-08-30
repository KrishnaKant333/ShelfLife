"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import Image from "next/image";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
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
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-1.5 text-[var(--shelf-muted)] hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)]"
        >
          <Menu size={22} />
        </button>
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
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="fixed h-screen w-64">
          <Sidebar user={user} inventory={inventory} />
        </div>
      </div>

      {/* Main Page Content Body */}
      <main className="min-w-0 flex-1 lg:pl-0">
        <div className="py-4 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
