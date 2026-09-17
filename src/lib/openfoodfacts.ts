/**
 * Open Food Facts Integration for ShelfLife
 * Implements Tier 4 of the 6-Tier Image Priority Hierarchy.
 *
 * Requirements:
 * - Deterministic, authenticated open-data image fetching
 * - Strict 2.5-second timeout (fails gracefully to Tier 5/6 without blocking)
 * - In-memory / server caching to prevent duplicate lookups
 * - Strict adherence to ODbL open-data attribution
 */

interface OpenFoodFactsResult {
  imageUrl: string;
  productName?: string;
  brand?: string;
  source: "openfoodfacts";
}

interface CacheEntry {
  data: OpenFoodFactsResult | null;
  expiresAt: number;
}

// 24-hour server-side in-memory cache
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const offMemoryCache = new Map<string, CacheEntry>();

/**
 * Strips retail measurement units, pack counts, and punctuation to improve search recall.
 * e.g. "Amul Salted Butter 500g" => "Amul Salted Butter"
 *      "Oatly Barilla 1L Pack of 2" => "Oatly Barilla"
 */
export function cleanSearchQuery(rawName: string): string {
  if (!rawName) return "";
  let clean = rawName
    .replace(/\b\d+(\.\d+)?\s*(g|kg|ml|l|ltr|oz|lb|pcs|pieces|pack|pk)\b/gi, "")
    .replace(/\b(pack\s+of\s+\d+|family\s+pack|combo)\b/gi, "")
    .replace(/[()[\]{},;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // If cleaning leaves it too short, revert to original trimmed
  return clean.length >= 2 ? clean : rawName.trim();
}

/**
 * Checks if a given image URL originates from Open Food Facts servers.
 */
export function isOpenFoodFactsImage(url?: string | null): boolean {
  if (!url) return false;
  return url.includes("images.openfoodfacts.org") || url.includes("static.openfoodfacts.org");
}

export const OPEN_FOOD_FACTS_ATTRIBUTION = {
  label: "Product image via Open Food Facts",
  provider: "Open Food Facts",
  url: "https://world.openfoodfacts.org",
  license: "ODbL / CC-BY-SA",
  disclaimer: "Contributed by the open food community under the Open Database License.",
};

/**
 * Queries Open Food Facts for an authentic packaging thumbnail.
 * Implements strict 2.5-second timeout.
 */
export async function fetchOpenFoodFactsImage(
  productName: string,
  _category?: string
): Promise<OpenFoodFactsResult | null> {
  const cleanTerm = cleanSearchQuery(productName);
  if (!cleanTerm || cleanTerm.length < 2) return null;

  const cacheKey = cleanTerm.toLowerCase();
  const cached = offMemoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const endpoint = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    cleanTerm
  )}&search_simple=1&action=process&json=1&page_size=5`;

  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(2500),
      headers: {
        "User-Agent": "ShelfLife/1.0 (Windows NT 10.0; Win64; x64) contact@shelflife.app",
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      offMemoryCache.set(cacheKey, { data: null, expiresAt: Date.now() + 60_000 }); // short cache on error
      return null;
    }

    const data = await res.json();
    const products = data.products;
    if (!Array.isArray(products) || products.length === 0) {
      offMemoryCache.set(cacheKey, { data: null, expiresAt: Date.now() + 300_000 });
      return null;
    }

    // Find the first product that has a valid front packaging image
    for (const p of products) {
      const img =
        p.image_front_url ||
        p.image_url ||
        p.selected_images?.front?.display?.en ||
        p.selected_images?.front?.small?.en;

      if (typeof img === "string" && img.startsWith("http")) {
        const result: OpenFoodFactsResult = {
          imageUrl: img,
          productName: p.product_name,
          brand: p.brands,
          source: "openfoodfacts",
        };
        offMemoryCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
        return result;
      }
    }

    offMemoryCache.set(cacheKey, { data: null, expiresAt: Date.now() + 300_000 });
    return null;
  } catch (_err) {
    // Gracefully handle timeout (AbortError) or network failure without breaking the caller
    return null;
  }
}
