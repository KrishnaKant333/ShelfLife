"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  X,
  Trash2,
  Utensils,
  TrendingUp,
} from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    accountType: "consumer" | "business";
  };
  onCloseMobile?: () => void;
  inventory?: InventoryItem[];
}

export default function Sidebar({ user, onCloseMobile, inventory = [] }: SidebarProps) {
  const pathname = usePathname();
  const isBusiness = user.accountType === "business";
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  // Calculate alert count from inventory
  const alertCount = inventory.reduce((count, item) => {
    const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
    return status === "Expired" || status === "Expiring" || status === "Low Stock" ? count + 1 : count;
  }, 0);

  const navigation = [
    {
      label: "Overview",
      href: prefix,
      icon: LayoutDashboard,
      count: 0,
    },
    {
      label: "Inventory",
      href: `${prefix}/inventory`,
      icon: Package,
      count: 0,
    },
    {
      label: "Alerts",
      href: `${prefix}/alerts`,
      icon: Bell,
      count: alertCount,
    },
    {
      label: "Analytics",
      href: `${prefix}/analytics`,
      icon: BarChart3,
      count: 0,
    },
    {
      label: "Waste Insights",
      href: `${prefix}/waste`,
      icon: Trash2,
      count: 0,
    },
    ...(isBusiness
      ? [
          {
            label: "Inventory Strategy",
            href: `${prefix}/strategy`,
            icon: TrendingUp,
            count: 0,
          },
        ]
      : [
          {
            label: "Recipes",
            href: `${prefix}/recipes`,
            icon: Utensils,
            count: 0,
          },
        ]),
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 shadow-sm">
      {/* Header / Logo */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href={prefix} onClick={onCloseMobile} className="shrink-0">
            <Image
              src="/logo/shelflife.png"
              alt="ShelfLife"
              width={130}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--shelf-muted)]">
            {isBusiness ? "Business Console" : "Consumer Inventory"}
          </p>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-[var(--shelf-muted)] hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)] lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          // Exact match for Overview, startsWith for others to highlight nested pages like inventory/new
          const isActive =
            item.label === "Overview"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition duration-150 ${isActive
                  ? "bg-[var(--shelf-cream)] text-[var(--shelf-forest)] border-l-4 border-[var(--shelf-forest)] pl-3"
                  : "text-[var(--shelf-muted)] hover:bg-[var(--shelf-cream)]/50 hover:text-[var(--shelf-dark)]"
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.label}
              </span>
              {item.count > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold shrink-0">
                  {item.count > 99 ? "99+" : item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Account / Settings */}
      <div className="mt-auto border-t border-[var(--shelf-border)] pt-4 space-y-2">
        <Link
          href={`${prefix}/settings`}
          onClick={onCloseMobile}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition duration-150 ${pathname === `${prefix}/settings`
              ? "bg-[var(--shelf-cream)] text-[var(--shelf-forest)]"
              : "text-[var(--shelf-muted)] hover:bg-[var(--shelf-cream)]/50 hover:text-[var(--shelf-dark)]"
            }`}
        >
          <Settings size={18} strokeWidth={1.8} />
          Settings
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--shelf-terracotta)] hover:bg-[var(--shelf-terracotta)]/10 transition duration-150 text-left"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Sign out
        </button>

        <div className="px-4 py-2 bg-[var(--shelf-cream)]/30 rounded-xl border border-[var(--shelf-border)]/50">
          <p className="truncate text-xs font-semibold text-[var(--shelf-dark)]">
            {user.name || "Default User"}
          </p>
          <p className="truncate text-[10px] text-[var(--shelf-muted)] mt-0.5">
            {user.email}
          </p>
        </div>
      </div>
    </aside>
  );
}