import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/prisma/db";
import { getInventoryStatus } from "@/lib/inventory-status";
import ProductDossierView from "@/components/inventory/ProductDossierView";
import type { ConsumptionRecord } from "@/lib/actions/recipes";

interface ConsumerProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConsumerProductPage({ params }: ConsumerProductPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const resolvedParams = await params;
  const productId = Number(resolvedParams.id);

  if (!productId || isNaN(productId)) {
    notFound();
  }

  // Fetch product verified by ownership
  const product = await db.orm.public.InventoryItem.first({
    id: productId,
    userId: Number(session.user.id),
  });

  if (!product) {
    return (
      <div className="sl-editorial-card p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-surface-base)] border border-[var(--app-border-subtle)] text-[var(--app-text-muted)] mx-auto">
          <PackageOpen size={30} />
        </div>
        <h2 className="sl-display-serif text-2xl font-bold text-[var(--app-text-display)]">
          Product Dossier Not Found
        </h2>
        <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
          The requested food item does not exist or may have been consumed or removed from your pantry.
        </p>
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105 transition"
        >
          <ArrowLeft size={14} />
          <span>Return to Inventory</span>
        </Link>
      </div>
    );
  }

  // Fetch historical consumption logs for this product
  let consumptionRecords = await db.orm.public.InventoryConsumption.where({
    userId: Number(session.user.id),
    inventoryItemId: product.id,
  }).all();

  // If no direct ID match, fallback to product name match
  if (consumptionRecords.length === 0) {
    const allUserConsumptions = await db.orm.public.InventoryConsumption.where({
      userId: Number(session.user.id),
    }).all();

    consumptionRecords = allUserConsumptions.filter(
      (r) => r.productName.toLowerCase() === product.name.toLowerCase()
    );
  }

  consumptionRecords.sort(
    (a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime()
  );

  const formattedHistory: ConsumptionRecord[] = consumptionRecords.map((r) => ({
    id: r.id,
    productName: r.productName,
    quantityUsed: r.quantityUsed,
    unit: r.unit,
    consumedAt: r.consumedAt,
  }));

  // Compute status
  const status = getInventoryStatus(product.quantity, product.expiryDate, product.unit);
  const itemWithStatus = {
    ...product,
    status,
    createdAt: (product as any).createdAt ?? null,
  };

  return (
    <div className="space-y-6">
      <ProductDossierView
        item={itemWithStatus}
        history={formattedHistory}
        isBusiness={false}
      />
    </div>
  );
}