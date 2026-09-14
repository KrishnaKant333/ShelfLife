import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { put, del } from "@vercel/blob";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "products");

/**
 * Checks if Vercel Blob storage is configured via environment variable.
 */
export function isBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Checks whether a given image URL represents an asset created and owned by ShelfLife.
 * - TRUE for local uploads (/uploads/products/...)
 * - TRUE for Vercel Blob objects (*.public.blob.vercel-storage.com)
 * - FALSE for Open Food Facts, external CDNs, placeholders, and data URIs.
 */
export function isShelfLifeOwnedImage(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // 1. Local filesystem uploads
  if (trimmed.startsWith("/uploads/products/") || trimmed.startsWith("/uploads/")) {
    return true;
  }

  // 2. Vercel Blob persistent object storage
  try {
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
      const parsed = new URL(trimmed);
      if (parsed.hostname.endsWith(".public.blob.vercel-storage.com")) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Saves a product image buffer or file.
 * - In production (or when BLOB_READ_WRITE_TOKEN is configured):
 *   Uploads to Vercel Blob persistent object storage and returns the permanent HTTPS URL.
 * - In local development (when BLOB_READ_WRITE_TOKEN is not configured):
 *   Saves into public/uploads/products/ and returns the relative URL.
 */
export async function saveProductImage(
  buffer: Buffer,
  originalFilename?: string,
  contentType: string = "image/jpeg"
): Promise<string> {
  const ext = getExtension(originalFilename, contentType);
  const hash = crypto.randomBytes(6).toString("hex");
  const filename = `product-${Date.now()}-${hash}.${ext}`;

  // 1. Production / Persistent Object Storage (Vercel Blob)
  if (isBlobStorageConfigured()) {
    try {
      const blob = await put(`products/${filename}`, buffer, {
        access: "public",
        contentType,
      });
      return blob.url;
    } catch (error) {
      console.error("[Storage] Failed to upload image to Vercel Blob:", error);
      throw new Error(
        "Failed to upload product image to persistent storage: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }

  // 2. Local Development Fallback (Local Filesystem)
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const filepath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filepath, buffer);
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error("[Storage] Failed to save image to local filesystem:", error);
    throw new Error(
      "Failed to save product image locally: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
}

/**
 * Deletes a single product image from storage.
 * - Safely ignores external URLs (e.g. Open Food Facts) and null/empty inputs.
 * - If Vercel Blob URL and BLOB_READ_WRITE_TOKEN is configured: calls `@vercel/blob` `del()`.
 * - If local URL (/uploads/products/...): deletes file from local public/ folder.
 */
export async function deleteProductImage(url?: string | null): Promise<boolean> {
  if (!url || !isShelfLifeOwnedImage(url)) {
    return false;
  }

  const trimmed = url.trim();

  // 1. Vercel Blob Object Storage
  if (trimmed.includes(".public.blob.vercel-storage.com")) {
    if (!isBlobStorageConfigured()) {
      console.warn("[Storage] BLOB_READ_WRITE_TOKEN not configured; cannot delete Blob asset:", trimmed);
      return false;
    }
    try {
      await del(trimmed);
      return true;
    } catch (error) {
      console.error(
        `[Storage] Failed to delete Vercel Blob asset [${trimmed}]:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      return false;
    }
  }

  // 2. Local Filesystem Storage
  if (trimmed.startsWith("/uploads/")) {
    try {
      const relativePath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
      const normalized = path.normalize(relativePath);
      // Path traversal guard
      if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
        console.error("[Storage] Path traversal attempt detected during deletion:", trimmed);
        return false;
      }
      const filepath = path.join(process.cwd(), "public", normalized);
      try {
        await fs.unlink(filepath);
        return true;
      } catch (unlinkError: unknown) {
        const code = (unlinkError as { code?: string }).code;
        if (code === "ENOENT") {
          return true; // Already removed
        }
        throw unlinkError;
      }
    } catch (error) {
      console.error(
        `[Storage] Failed to delete local image file [${trimmed}]:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      return false;
    }
  }

  return false;
}

/**
 * Deletes multiple product images from storage.
 * Deduplicates URLs and filters strictly to ShelfLife-owned assets.
 * Returns the count of successfully deleted assets.
 */
export async function deleteProductImages(
  urls: (string | null | undefined)[]
): Promise<number> {
  if (!urls || urls.length === 0) return 0;

  // Filter and deduplicate
  const uniqueUrls = Array.from(
    new Set(urls.filter((u): u is string => Boolean(u && isShelfLifeOwnedImage(u))))
  );

  if (uniqueUrls.length === 0) return 0;

  let deletedCount = 0;
  const blobUrls = uniqueUrls.filter((u) => u.includes(".public.blob.vercel-storage.com"));
  const localUrls = uniqueUrls.filter((u) => u.startsWith("/uploads/"));

  // Batch delete Blob URLs
  if (blobUrls.length > 0 && isBlobStorageConfigured()) {
    try {
      await del(blobUrls);
      deletedCount += blobUrls.length;
    } catch (error) {
      console.error(
        "[Storage] Batch Blob deletion failed, falling back to sequential deletion:",
        error instanceof Error ? error.message : error
      );
      for (const url of blobUrls) {
        const ok = await deleteProductImage(url);
        if (ok) deletedCount++;
      }
    }
  }

  // Delete local filesystem URLs
  for (const url of localUrls) {
    const ok = await deleteProductImage(url);
    if (ok) deletedCount++;
  }

  return deletedCount;
}

function getExtension(filename?: string, contentType?: string): string {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/jpeg" || contentType === "image/jpg") return "jpg";

  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "webp"].includes(ext)) {
      return ext === "jpeg" ? "jpg" : ext;
    }
  }

  return "jpg";
}
