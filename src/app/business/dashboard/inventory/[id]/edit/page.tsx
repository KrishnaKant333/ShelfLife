import Link from "next/link";

import { auth } from "@/auth";
import BusinessEditProductForm from "@/components/business/BusinessEditProductForm";
import { db } from "@/prisma/db";

interface BusinessEditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BusinessEditProductPage({
  params,
}: BusinessEditProductPageProps) {
  const session = await auth();

  if (!session?.user?.businessId) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">
          Unauthorized
        </h1>
      </main>
    );
  }

  if (session.user.accountType !== "business") {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">
          Unauthorized
        </h1>
      </main>
    );
  }

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    return <p className="p-8">Invalid product ID.</p>;
  }

  const product =
    await db.orm.public.InventoryItem.first({
      id: productId,
      businessId: Number(session.user.businessId),
    });

  if (!product) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">
          Product not found
        </h1>

        <Link
          href="/business/dashboard/inventory"
          className="mt-4 inline-block text-sm font-medium text-[var(--shelf-forest)]"
        >
          ← Back to inventory
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 md:px-0 py-6 md:py-10">
      <div className="mb-6 md:mb-8">
        <Link
          href="/business/dashboard/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-forest)] hover:underline transition-colors"
        >
          <span aria-hidden="true">←</span> Back to inventory
        </Link>

        <h1 className="sl-display-serif mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-[var(--app-text-display)]">
          Edit Product
        </h1>

        <p className="mt-1.5 text-sm text-[var(--app-text-muted)]">
          Update the commercial inventory stock and parameters for <span className="font-medium text-[var(--app-text-display)]">{product.name}</span>.
        </p>
      </div>

      <BusinessEditProductForm product={product} />
    </main>
  );
}