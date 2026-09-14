import { db } from "@/prisma/db";
import { deleteProductImages, isShelfLifeOwnedImage } from "@/lib/storage";

/**
 * Extracts and deduplicates all image URLs from an inventory item record or payload.
 */
export function parseItemImageUrls(item?: {
  imageUrl?: string | null;
  additionalImageUrls?: string | null;
}): string[] {
  if (!item) return [];

  const urls: string[] = [];

  if (item.imageUrl && typeof item.imageUrl === "string") {
    const trimmed = item.imageUrl.trim();
    if (trimmed) urls.push(trimmed);
  }

  if (item.additionalImageUrls && typeof item.additionalImageUrls === "string") {
    const trimmed = item.additionalImageUrls.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsed.forEach((u) => {
            if (typeof u === "string" && u.trim()) {
              urls.push(u.trim());
            }
          });
        } else if (typeof parsed === "string" && parsed.trim()) {
          urls.push(parsed.trim());
        }
      } catch {
        // Handle comma-separated fallback
        trimmed.split(",").forEach((part) => {
          const clean = part.trim();
          if (clean) urls.push(clean);
        });
      }
    }
  }

  return Array.from(new Set(urls));
}

/**
 * Filters a list of candidate URLs down to those that:
 * 1. Are owned by ShelfLife (local /uploads/ or Vercel Blob) — never Open Food Facts or external CDNs.
 * 2. Are NOT referenced by any other InventoryItem in the database (excluding excludeItemIds).
 */
export async function filterUnreferencedOwnedImages(
  candidateUrls: string[],
  excludeItemIds: number[] = []
): Promise<string[]> {
  if (!candidateUrls || candidateUrls.length === 0) return [];

  // Filter to unique ShelfLife-owned assets first
  const ownedCandidates = Array.from(
    new Set(candidateUrls.filter((u) => isShelfLifeOwnedImage(u)))
  );

  if (ownedCandidates.length === 0) return [];

  try {
    const allItems = await db.orm.public.InventoryItem.all();
    const excludeSet = new Set(excludeItemIds);
    const otherItems = allItems.filter((item) => !excludeSet.has(item.id));

    // Build the set of all URLs still actively referenced by other inventory items
    const referencedUrls = new Set<string>();
    for (const item of otherItems) {
      const itemUrls = parseItemImageUrls(item);
      itemUrls.forEach((url) => referencedUrls.add(url));
    }

    // Only return URLs that are NOT referenced by any remaining items
    return ownedCandidates.filter((url) => !referencedUrls.has(url));
  } catch (error) {
    console.error(
      "[Storage Lifecycle] Failed to check database references for candidate images:",
      error instanceof Error ? error.message : error
    );
    // If we cannot verify references safely, do NOT delete to prevent catastrophic asset loss
    return [];
  }
}

/**
 * Safely deletes unreferenced ShelfLife-owned images.
 * Never throws — failures are logged clearly for observability without leaking secrets.
 * Returns the number of successfully deleted assets.
 */
export async function safeDeleteUnreferencedImages(
  candidateUrls: string[],
  excludeItemIds: number[] = []
): Promise<number> {
  if (!candidateUrls || candidateUrls.length === 0) return 0;

  try {
    const unreferenced = await filterUnreferencedOwnedImages(candidateUrls, excludeItemIds);
    if (unreferenced.length === 0) return 0;

    const deletedCount = await deleteProductImages(unreferenced);
    return deletedCount;
  } catch (error) {
    console.error(
      "[Storage Lifecycle] Unexpected error during unreferenced image cleanup:",
      error instanceof Error ? error.message : error
    );
    return 0;
  }
}
