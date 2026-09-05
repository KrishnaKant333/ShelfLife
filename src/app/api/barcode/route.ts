import { NextRequest, NextResponse } from "next/server";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v3/product";

type OpenFoodFactsProduct = {
  code?: unknown;
  product_name?: unknown;
  product_name_en?: unknown;
  generic_name?: unknown;
  generic_name_en?: unknown;
  brands?: unknown;
  categories?: unknown;
  categories_tags?: unknown;
  quantity?: unknown;
  product_quantity?: unknown;
  product_quantity_unit?: unknown;
  image_front_url?: unknown;
  image_url?: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstCategory(product: OpenFoodFactsProduct): string {
  const tags = Array.isArray(product.categories_tags) ? product.categories_tags : [];
  const taggedCategory = tags.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  const rawCategory = taggedCategory || text(product.categories).split(",")[0];

  return rawCategory
    .replace(/^[a-z]{2}:/i, "")
    .split("-")
    .map((word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(" ")
    .trim();
}

function packageDetails(product: OpenFoodFactsProduct): { quantity: number; unit: string } {
  const productQuantity = typeof product.product_quantity === "number"
    ? product.product_quantity
    : Number(product.product_quantity);
  const productUnit = text(product.product_quantity_unit);

  if (Number.isFinite(productQuantity) && productQuantity > 0 && productUnit) {
    return { quantity: productQuantity, unit: productUnit };
  }

  const rawQuantity = text(product.quantity);
  const match = rawQuantity.match(/([0-9]+(?:[.,][0-9]+)?)\s*([a-zA-Z]+)?/);
  if (match) {
    const parsedQuantity = Number(match[1].replace(",", "."));
    if (Number.isFinite(parsedQuantity) && parsedQuantity > 0) {
      return { quantity: parsedQuantity, unit: match[2] || "pack" };
    }
  }

  return { quantity: 1, unit: "pack" };
}

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode")?.trim() || "";

  if (!/^\d{8,14}$/.test(barcode)) {
    return NextResponse.json(
      { status: "error", error: "The scanned barcode is not valid." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${OPEN_FOOD_FACTS_URL}/${encodeURIComponent(barcode)}.json?fields=code,product_name,product_name_en,generic_name,generic_name_en,brands,categories,categories_tags,quantity,product_quantity,product_quantity_unit,image_front_url,image_url`,
      {
        headers: { "User-Agent": "ShelfLife/1.0 (barcode lookup)" },
        cache: "no-store",
      },
    );

    if (response.status === 404) {
      return NextResponse.json({ status: "not_found", barcode });
    }

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", barcode, error: "Open Food Facts is temporarily unavailable." },
        { status: 502 },
      );
    }

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("product" in payload)) {
      return NextResponse.json(
        { status: "error", barcode, error: "Open Food Facts returned an invalid response." },
        { status: 502 },
      );
    }

    const product = (payload as { product?: unknown }).product;
    if (!product || typeof product !== "object" || Array.isArray(product)) {
      return NextResponse.json({ status: "not_found", barcode });
    }

    const facts = product as OpenFoodFactsProduct;
    const name = text(facts.product_name) || text(facts.product_name_en) || text(facts.generic_name) || text(facts.generic_name_en);
    const brand = text(facts.brands).split(",")[0]?.trim() || "";
    const category = firstCategory(facts);
    const packageInfo = packageDetails(facts);
    const imageUrl = text(facts.image_front_url) || text(facts.image_url);
    const result = {
      barcode: text(facts.code) || barcode,
      name,
      brand,
      category,
      quantity: packageInfo.quantity,
      unit: packageInfo.unit,
      imageUrl,
    };

    const missingFields = [
      !name && "product name",
      !category && "category",
      !imageUrl && "image",
    ].filter(Boolean);

    return NextResponse.json({
      status: missingFields.length > 0 ? "incomplete" : "found",
      product: result,
      missingFields,
    });
  } catch (error) {
    console.error("Barcode lookup failed:", error);
    return NextResponse.json(
      { status: "error", barcode, error: "Barcode lookup failed. Please enter the product manually." },
      { status: 502 },
    );
  }
}
