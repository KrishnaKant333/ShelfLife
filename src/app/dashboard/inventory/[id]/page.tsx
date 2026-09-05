import Link from "next/link";
import { Archive, Milk, Package, Wheat } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/prisma/db";
import { formatExpiry } from "@/lib/format-expiry";
import { getInventoryStatus } from "@/lib/inventory-status";

export default async function ConsumerProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return <p className="p-8">Unauthorized.</p>;
  const product = await db.orm.public.InventoryItem.first({ id: Number((await params).id), userId: Number(session.user.id) });
  if (!product) return <main className="p-8"><h1>Product not found</h1><Link href="/dashboard/inventory">Back to inventory</Link></main>;
  const Icon = product.category.toLowerCase().includes("dairy") ? Milk : product.category.toLowerCase().includes("grain") ? Wheat : Package;
  return <main className="mx-auto max-w-4xl p-4 sm:p-6 md:p-10"><Link href="/dashboard/inventory" className="text-sm font-medium text-[var(--shelf-forest)]">Back to inventory</Link><div className="mt-5 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-5 sm:p-8"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--shelf-cream)] text-[var(--shelf-forest)] sm:h-20 sm:w-20"><Icon size={32} /></div><h1 className="mt-5 text-3xl font-bold text-[var(--shelf-dark)]">{product.name}</h1><p className="mt-2 text-[var(--shelf-muted)]">{product.category}</p><div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4"><div><p className="text-xs text-[var(--shelf-muted)]">Quantity</p><p className="font-semibold text-[var(--shelf-dark)]">{product.quantity} {product.unit}</p></div><div><p className="text-xs text-[var(--shelf-muted)]">Expiry</p><p className="font-semibold text-[var(--shelf-dark)]">{formatExpiry(product.expiryDate)}</p></div><div><p className="text-xs text-[var(--shelf-muted)]">Status</p><p className="font-semibold text-[var(--shelf-dark)]">{getInventoryStatus(product.quantity, product.expiryDate, product.unit)}</p></div></div><Link href={`/dashboard/inventory/${product.id}/edit`} className="mt-6 inline-flex rounded-xl bg-[var(--shelf-forest)] px-5 py-3 font-semibold text-white sm:mt-8">Edit product</Link></div></main>;
}