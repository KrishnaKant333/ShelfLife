"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Plus, 
  Camera, 
  Package, 
  Bell, 
  LayoutDashboard,
  ChefHat,
  SlidersHorizontal 
} from "lucide-react";

interface MobileActionDockProps {
  user: {
    accountType: "consumer" | "business";
  };
  alertCount?: number;
}

export default function MobileActionDock({
  user,
  alertCount = 0,
}: MobileActionDockProps) {
  const pathname = usePathname();
  const isBusiness = user.accountType === "business";
  const basePath = isBusiness ? "/business/dashboard" : "/dashboard";

  // Hide on authentication, login, or dedicated standalone pages
  if (
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/verify-email")
  ) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: basePath,
      icon: LayoutDashboard,
      isActive: pathname === basePath,
    },
    {
      label: "Inventory",
      href: `${basePath}/inventory`,
      icon: Package,
      isActive: pathname.startsWith(`${basePath}/inventory`) && !pathname.includes("/new"),
    },
    {
      label: "Add Product",
      href: `${basePath}/inventory/new`,
      icon: Plus,
      isPrimary: true,
      isActive: pathname === `${basePath}/inventory/new`,
    },
    {
      label: "Scan Label",
      href: `${basePath}/inventory/new?tab=label`,
      icon: Camera,
      isActive: pathname.includes("tab=label"),
    },
    {
      label: "Safeguards",
      href: `${basePath}/alerts`,
      icon: Bell,
      badge: alertCount > 0 ? alertCount : undefined,
      isActive: pathname.startsWith(`${basePath}/alerts`),
    },
  ];

  return (
    <div
      role="navigation"
      aria-label="Mobile quick actions dock"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--shelf-surface)]/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-[var(--shelf-border)] shadow-2xl px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          if (item.isPrimary) {
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="relative -top-3 flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--shelf-forest)] text-white flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-transform">
                  <Plus size={22} className="stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold text-[var(--shelf-forest)] mt-0.5">
                  Add Item
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={`touch-target flex flex-col items-center justify-center relative min-w-[52px] py-1 rounded-xl transition ${
                active
                  ? "text-[var(--shelf-forest)] font-semibold"
                  : "text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
              }`}
            >
              <div className="relative">
                <Icon size={19} className={active ? "text-[var(--shelf-forest)]" : ""} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-[var(--shelf-surface)]">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${active ? "font-semibold text-[var(--shelf-forest)]" : "font-normal"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
