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
    <main className="mx-auto max-w-4xl p-6 md:p-8">
      <div className="mb-6">
        <Link
          href="/business/dashboard/inventory"
          className="text-sm font-medium text-[var(--shelf-forest)]"
        >
          ← Back to inventory
        </Link>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Edit Product
        </h1>

        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Update the information for {product.name}.
        </p>
      </div>

      <BusinessEditProductForm product={product} />
    </main>
  );
}