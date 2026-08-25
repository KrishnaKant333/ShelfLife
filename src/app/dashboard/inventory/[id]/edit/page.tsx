import Link from "next/link";

import EditProductForm from "@/components/dashboard/EditProductForm";
import { db } from "@/prisma/db";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    return <p>Invalid product ID.</p>;
  }

  const product =
    await db.orm.public.InventoryItem.first({
      id: productId,
    });

  if (!product) {
    return (
      <main>
        <h1>Product not found</h1>
        <Link href="/dashboard/inventory">
          Back to inventory
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl">
      <div className="mb-3 mt-8">
        <Link
          href="/dashboard/inventory"
          className="text-sm font-medium text-[var(--shelf-forest)]">
          ← Back to inventory
        </Link>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Edit Product
        </h1>

        <p className="mt-2 text-[var(--shelf-muted)]">
          Update the information for {product.name}.
        </p>
      </div>

      <EditProductForm product={product} />
    </main>
  );
}