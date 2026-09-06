"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  X,
  Trash2,
  Utensils,
  TrendingUp,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    accountType: "consumer" | "business";
  };
  onCloseMobile?: () => void;
  inventory?: InventoryItem[];
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export default function Sidebar({ user, onCloseMobile, inventory = [], collapsed = false, onToggleCollapsed }: SidebarProps) {
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
      icon: AlertTriangle,
      count: alertCount,
    },
    {
      label: "Notifications",
      href: `${prefix}/notifications`,
      icon: Bell,
      count: 0,
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
    <aside className={`flex h-full flex-col border-r border-[var(--sl-color-border)] bg-[var(--sl-color-surface)] p-4 shadow-[var(--sl-shadow-sm)] transition-[width] duration-200 ${collapsed ? "w-20" : "w-64"}`}>
      {/* Header / Logo */}
      <div className="mb-8 flex items-center justify-between">
        <div className={collapsed ? "hidden" : ""}>
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
            autoFocus
            aria-label="Close navigation"
            className="sl-focus-ring flex h-11 w-11 items-center justify-center rounded-[var(--sl-radius-md)] text-[var(--sl-color-text-muted)] hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)] lg:hidden"
          >
            <X size={18} />
          </button>
        )}
        {onToggleCollapsed && !onCloseMobile && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="sl-focus-ring flex h-11 w-11 items-center justify-center rounded-[var(--sl-radius-md)] text-[var(--sl-color-text-muted)] hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
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
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center justify-between gap-3 rounded-xl py-3 text-sm font-semibold transition duration-150 ${collapsed ? "justify-center px-3" : "px-4"} ${isActive
                  ? "border-l-4 border-[var(--sl-color-action)] bg-[var(--sl-color-action-soft)] pl-3 text-[var(--sl-color-action)]"
                  : "text-[var(--sl-color-text-muted)] hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]"
                }`}
            >
              <span className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`} title={collapsed ? item.label : undefined}>
                <Icon size={18} className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className={collapsed ? "hidden" : ""}>{item.label}</span>
              </span>
              {item.count > 0 && !collapsed && (
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
            aria-current={pathname === `${prefix}/settings` ? "page" : undefined}
            className={`sl-focus-ring flex min-h-11 items-center gap-3 rounded-[var(--sl-radius-md)] py-3 text-sm font-semibold transition duration-150 ${collapsed ? "justify-center px-3" : "px-4"} ${pathname === `${prefix}/settings`
              ? "bg-[var(--sl-color-action-soft)] text-[var(--sl-color-action)]"
              : "text-[var(--sl-color-text-muted)] hover:bg-[var(--sl-color-surface-inset)] hover:text-[var(--sl-color-text)]"
            }`}
        >
          <Settings size={18} className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          <span className={collapsed ? "hidden" : ""}>Settings</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`sl-focus-ring flex min-h-11 w-full items-center gap-3 rounded-[var(--sl-radius-md)] py-3 text-left text-sm font-semibold text-[var(--sl-color-danger)] transition duration-150 hover:bg-[var(--sl-color-danger)]/10 ${collapsed ? "justify-center px-3" : "px-4"}`}
        >
          <LogOut size={18} className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          <span className={collapsed ? "hidden" : ""}>Sign out</span>
        </button>

        <div className={`px-4 py-2 bg-[var(--shelf-cream)]/30 rounded-xl border border-[var(--shelf-border)]/50 ${collapsed ? "hidden" : ""}`}>
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