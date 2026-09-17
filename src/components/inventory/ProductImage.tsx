"use client";

import ProductThumbnail, {
  type ProductThumbnailSize,
  type ProductThumbnailProps,
  getCategoryMeta,
} from "@/components/inventory/ProductThumbnail";

export interface ProductImageProps {
  src?: string | null;
  alt: string;
  category: string;
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
}

export { getCategoryMeta };

/**
 * ProductImage Component
 * Backwards-compatible wrapper delegating to ProductThumbnail, adhering to the
 * 6-Tier Image Priority Hierarchy with deterministic fallback and loading shimmer.
 */
export default function ProductImage({
  src,
  alt,
  category,
  className = "",
  priority = false,
  size = "md",
}: ProductImageProps) {
  return (
    <ProductThumbnail
      src={src}
      alt={alt}
      category={category}
      className={className}
      priority={priority}
      size={size as ProductThumbnailSize}
    />
  );
}
