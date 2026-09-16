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
    <main className="mx-auto max-w-4xl px-4 sm:px-6 md:px-0 py-6 md:py-10">
      <div className="mb-6 md:mb-8">
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-forest)] hover:underline transition-colors"
        >
          <span aria-hidden="true">←</span> Back to inventory
        </Link>

        <h1 className="sl-display-serif mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-[var(--app-text-display)]">
          Edit Product
        </h1>

        <p className="mt-1.5 text-sm text-[var(--app-text-muted)]">
          Update the inventory parameters and shelf life details for <span className="font-medium text-[var(--app-text-display)]">{product.name}</span>.
        </p>
      </div>

      <EditProductForm product={product} />
    </main>
  );
}