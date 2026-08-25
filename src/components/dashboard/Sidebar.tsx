import Link from "next/link";

import Image from "next/image";
import {
  Bell,
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
  },
  {
    label: "Alerts",
    href: "/dashboard/alerts",
    icon: Bell,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 lg:block">
      <div className="mb-10">
        <div className="relative left-0.5">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo/shelflife.png"
              alt="ShelfLife"
              width={150}
              height={150}
              className="h-14 w-auto object-contain"
              priority
              />
          </Link>  
        </div>

        <p className="mt-1 text-xs text-[var(--shelf-muted)]">
          Inventory Intelligence Platform
        </p>
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)]"
            >
              <Icon size={18} strokeWidth={1.8} />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-10">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)]"
        >
          <Settings size={18} strokeWidth={1.8} />

          Settings
        </Link>
      </div>
    </aside>
  );
}