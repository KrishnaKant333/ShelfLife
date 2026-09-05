"use client";

import Link from "next/link";
import { AlertTriangle, Bell, Package } from "lucide-react";
import { getInventoryStatus } from "@/lib/inventory-status";
import { formatExpiry } from "@/lib/format-expiry";

type NotificationItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
};

export default function NotificationCenter({ inventory, isBusiness = false }: { inventory: NotificationItem[]; isBusiness?: boolean }) {
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";
  const notifications = inventory.flatMap((item) => {
    const status = getInventoryStatus(item.quantity, item.expiryDate, item.unit);
    if (status === "Expired") return [{ item, title: `${item.name} is expired`, detail: "Discard this item before it is used.", tone: "text-[var(--shelf-terracotta)]" }];
    if (status === "Expiring") return [{ item, title: `${item.name} expires soon`, detail: formatExpiry(item.expiryDate), tone: "text-[var(--shelf-amber)]" }];
    if (status === "Low Stock") return [{ item, title: `${item.name} is low stock`, detail: `${item.quantity} ${item.unit} remaining`, tone: "text-[var(--shelf-terracotta)]" }];
    return [];
  });

  return <main className="mx-auto max-w-4xl p-4 sm:p-6 md:p-10"><div className="flex items-center gap-3"><Bell className="text-[var(--shelf-forest)]" /><div><p className="text-sm font-semibold text-[var(--shelf-forest)]">Notifications</p><h1 className="mt-1 text-3xl font-bold text-[var(--shelf-dark)]">Needs your attention</h1></div></div><div className="mt-6 space-y-3 md:mt-8">{notifications.length === 0 ? <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-6 text-center md:p-8"><Package className="mx-auto text-[var(--shelf-forest)]" /><p className="mt-3 font-semibold text-[var(--shelf-dark)]">You are all caught up</p><p className="mt-1 text-sm text-[var(--shelf-muted)]">No expiry, low-stock, or waste alerts need attention.</p></div> : notifications.map(({ item, title, detail, tone }) => <Link key={`${item.id}-${title}`} href={`${prefix}/inventory/${item.id}`} className="flex items-start gap-3 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 transition hover:border-[var(--shelf-sage)] sm:items-center sm:gap-4 sm:p-5"><AlertTriangle className={`mt-0.5 shrink-0 ${tone}`} /><div><p className="font-semibold text-[var(--shelf-dark)]">{title}</p><p className="mt-1 text-sm text-[var(--shelf-muted)]">{detail}</p></div></Link>)}</div></main>;
}
