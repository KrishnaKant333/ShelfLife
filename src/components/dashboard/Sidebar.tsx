"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
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

export default function Sidebar({
  user,
  onCloseMobile,
  collapsed = false,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const isBusiness = user.accountType === "business";
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SL";

  const navigationSections = [
    {
      title: "Workspace",
      items: [
        {
          label: "Overview",
          href: prefix,
          icon: LayoutDashboard,
        },
        {
          label: "Inventory",
          href: `${prefix}/inventory`,
          icon: Package,
        },
      ],
    },
    {
      title: "Intelligence",
      items: [
        {
          label: "Analytics",
          href: `${prefix}/analytics`,
          icon: BarChart3,
        },
        {
          label: "Waste Insights",
          href: `${prefix}/waste`,
          icon: Trash2,
        },
        ...(isBusiness
          ? [
              {
                label: "Inventory Strategy",
                href: `${prefix}/strategy`,
                icon: TrendingUp,
              },
            ]
          : [
              {
                label: "Recipes",
                href: `${prefix}/recipes`,
                icon: Utensils,
              },
            ]),
      ],
    },
  ];

  return (
    <aside
      className={`flex h-full flex-col border-r border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-4 transition-[width] duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header / Brand */}
      <div className="mb-6 flex items-center justify-between">
        <div className={collapsed ? "hidden" : "flex flex-col"}>
          <Link href={prefix} onClick={onCloseMobile} className="shrink-0 flex items-center">
            <Image
              src="/logo/shelflife.png"
              alt="ShelfLife"
              width={120}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent-emerald)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              {isBusiness ? "Business Workspace" : "Personal Pantry"}
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            autoFocus
            aria-label="Close navigation"
            className="sl-focus-ring flex h-10 w-10 items-center justify-center rounded-lg text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-body)] lg:hidden"
          >
            <X size={18} />
          </button>
        )}

        {/* Desktop collapse toggle */}
        {onToggleCollapsed && !onCloseMobile && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="sl-focus-ring flex h-8 w-8 items-center justify-center rounded-md text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-body)] transition"
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)] opacity-80">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
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
                  className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition duration-150 ${
                    collapsed ? "justify-center px-2" : "px-3"
                  } ${
                    isActive
                      ? "border-l-2 border-[var(--app-accent-emerald)] bg-[var(--app-surface-base)] text-[var(--app-accent-emerald)] font-semibold shadow-2xs"
                      : "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-body)]"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={18}
                    className="shrink-0"
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className={collapsed ? "hidden" : "truncate"}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / Account / Settings */}
      <div className="mt-auto border-t border-[var(--app-border-subtle)] pt-3 space-y-1.5">
        <Link
          href={`${prefix}/settings`}
          onClick={onCloseMobile}
          aria-current={pathname === `${prefix}/settings` ? "page" : undefined}
          className={`sl-focus-ring flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition duration-150 ${
            collapsed ? "justify-center px-2" : "px-3"
          } ${
            pathname === `${prefix}/settings`
              ? "bg-[var(--app-surface-base)] text-[var(--app-accent-emerald)] font-semibold"
              : "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-body)]"
          }`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={18} className="shrink-0" strokeWidth={1.8} />
          <span className={collapsed ? "hidden" : ""}>Settings</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`sl-focus-ring flex w-full items-center gap-3 rounded-lg py-2 text-left text-sm font-medium text-[var(--app-accent-terracotta)] transition duration-150 hover:bg-[var(--app-surface-base)] ${
            collapsed ? "justify-center px-2" : "px-3"
          }`}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={18} className="shrink-0" strokeWidth={1.8} />
          <span className={collapsed ? "hidden" : ""}>Sign out</span>
        </button>

        {/* User Card */}
        <div
          className={`mt-2 flex items-center gap-2.5 rounded-lg border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-2 ${
            collapsed ? "hidden" : ""
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent-emerald)] text-[11px] font-bold text-white shadow-2xs">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[var(--app-text-display)]">
              {user.name || "Default User"}
            </p>
            <p className="truncate text-[10px] text-[var(--app-text-muted)]">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}