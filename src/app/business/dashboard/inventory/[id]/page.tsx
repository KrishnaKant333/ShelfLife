import Link from "next/link";
import { Milk, Package, Wheat } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/prisma/db";
import { formatExpiry } from "@/lib/format-expiry";
import { getInventoryStatus } from "@/lib/inventory-status";

export default async function BusinessProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.businessId) return <p className="p-8">Unauthorized.</p>;
  const product = await db.orm.public.InventoryItem.first({ id: Number((await params).id), businessId: Number(session.user.businessId) });
  if (!product) return <main className="p-8"><h1>Product not found</h1><Link href="/business/dashboard/inventory">Back to inventory</Link></main>;
  const Icon = product.category.toLowerCase().includes("dairy") ? Milk : product.category.toLowerCase().includes("grain") ? Wheat : Package;
  return <main className="mx-auto max-w-4xl p-6 md:p-10"><Link href="/business/dashboard/inventory" className="text-sm font-medium text-[var(--shelf-forest)]">Back to inventory</Link><div className="mt-6 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-8"><div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--shelf-cream)] text-[var(--shelf-forest)]"><Icon size={36} /></div><h1 className="mt-6 text-3xl font-bold text-[var(--shelf-dark)]">{product.name}</h1><p className="mt-2 text-[var(--shelf-muted)]">{product.category}</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-[var(--shelf-muted)]">Quantity</p><p className="font-semibold text-[var(--shelf-dark)]">{product.quantity} {product.unit}</p></div><div><p className="text-xs text-[var(--shelf-muted)]">Expiry</p><p className="font-semibold text-[var(--shelf-dark)]">{formatExpiry(product.expiryDate)}</p></div><div><p className="text-xs text-[var(--shelf-muted)]">Status</p><p className="font-semibold text-[var(--shelf-dark)]">{getInventoryStatus(product.quantity, product.expiryDate, product.unit)}</p></div></div><Link href={`/business/dashboard/inventory/${product.id}/edit`} className="mt-8 inline-flex rounded-xl bg-[var(--shelf-forest)] px-5 py-3 font-semibold text-white">Edit product</Link></div></main>;
}