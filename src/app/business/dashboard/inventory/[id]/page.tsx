import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/prisma/db";
import { getInventoryStatus } from "@/lib/inventory-status";
import ProductDossierView from "@/components/inventory/ProductDossierView";
import type { ConsumptionRecord } from "@/lib/actions/recipes";

interface BusinessProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function BusinessProductPage({ params }: BusinessProductPageProps) {
  const session = await auth();

  if (!session?.user?.id || !session.user.businessId) {
    redirect("/auth/signin");
  }

  const resolvedParams = await params;
  const productId = Number(resolvedParams.id);

  if (!productId || isNaN(productId)) {
    notFound();
  }

  const businessId = Number(session.user.businessId);

  // Fetch product verified by business ownership
  const product = await db.orm.public.InventoryItem.first({
    id: productId,
    businessId,
  });

  if (!product) {
    return (
      <div className="sl-editorial-card p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-surface-base)] border border-[var(--app-border-subtle)] text-[var(--app-text-muted)] mx-auto">
          <PackageOpen size={30} />
        </div>
        <h2 className="sl-display-serif text-2xl font-bold text-[var(--app-text-display)]">
          Commercial Asset Not Found
        </h2>
        <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
          The requested commercial inventory batch does not exist or has been depleted from your catalog.
        </p>
        <Link
          href="/business/dashboard/inventory"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--app-accent-emerald)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:brightness-105 transition"
        >
          <ArrowLeft size={14} />
          <span>Return to Business Catalog</span>
        </Link>
      </div>
    );
  }

  // Calculate FIFO rank relative to all business inventory items
  const allBusinessItems = await db.orm.public.InventoryItem.where({
    businessId,
  }).all();

  allBusinessItems.sort((a, b) => {
    const aTime = a.expiryDate ? new Date(a.expiryDate).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.expiryDate ? new Date(b.expiryDate).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });

  const rankIndex = allBusinessItems.findIndex((i) => i.id === product.id);
  const fifoRank = rankIndex >= 0 ? rankIndex + 1 : 1;

  // Fetch historical consumption logs for this commercial asset
  let consumptionRecords = await db.orm.public.InventoryConsumption.where({
    businessId,
    inventoryItemId: product.id,
  }).all();

  if (consumptionRecords.length === 0) {
    const allConsumptions = await db.orm.public.InventoryConsumption.where({
      businessId,
    }).all();

    consumptionRecords = allConsumptions.filter(
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
        isBusiness={true}
        fifoRank={fifoRank}
      />
    </div>
  );
}