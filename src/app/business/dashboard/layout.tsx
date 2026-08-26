import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

interface BusinessDashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Overview",
    href: "/business/dashboard",
  },
  {
    name: "Inventory",
    href: "/business/dashboard/inventory",
  },
  {
    name: "Alerts",
    href: "/business/dashboard/alerts",
  },
  {
    name: "Analytics",
    href: "/business/dashboard/analytics",
  },
];

export default async function BusinessDashboardLayout({
  children,
}: BusinessDashboardLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/business/login");
  }

  if (session.user.accountType !== "business") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--shelf-cream)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--shelf-border)] bg-[var(--shelf-surface)] lg:flex lg:flex-col">
        <div className="border-b border-[var(--shelf-border)] px-6 py-6">
          <Link
            href="/business/dashboard"
            className="text-xl font-semibold text-[var(--shelf-dark)]"
          >
            ShelfLife
          </Link>

          <p className="mt-1 text-xs text-[var(--shelf-muted)]">
            Business
          </p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)]"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-[var(--shelf-border)] p-4">
          <Link
            href="/business/dashboard/settings"
            className="block rounded-xl px-4 py-3 text-sm font-medium text-[var(--shelf-muted)] transition hover:bg-[var(--shelf-cream)] hover:text-[var(--shelf-dark)]"
          >
            Settings
          </Link>

          <div className="mt-4 px-4">
            <p className="truncate text-sm font-medium text-[var(--shelf-dark)]">
              {session.user.name}
            </p>

            <p className="truncate text-xs text-[var(--shelf-muted)]">
              {session.user.email}
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        {children}
      </div>
    </div>
  );
}