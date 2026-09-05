import Link from "next/link";

import EditProductForm from "@/components/dashboard/EditProductForm";

import { auth } from "@/auth";
import { db } from "@/prisma/db";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main>
        <h1>Unauthorized</h1>
        <Link href="/consumer/login">
          Log in to continue
        </Link>
      </main>
    );
  }

  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    return <p>Invalid product ID.</p>;
  }

  const product = await db.orm.public.InventoryItem.first({
    id: productId,
    userId: Number(session.user.id),
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
    <main className="mx-auto max-w-4xl px-4 sm:px-6 md:px-0">
      <div className="mb-3 mt-6 md:mt-8">
        <Link
          href="/dashboard/inventory"
          className="text-sm font-medium text-[var(--shelf-forest)]"
        >
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