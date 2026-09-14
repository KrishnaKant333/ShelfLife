# ShelfLife Specification: Real Product Thumbnails & Image Priority Hierarchy

**Cycle**: P3 / Imagery and Polish  
**Status**: 🟡 Queued for Implementation (Specification Ready)  
**Applies To**: Consumer Kitchen (`/dashboard`) and Commercial Operations (`/business/dashboard`)

---

## 1. Objective

Elevate product imagery into a reliable, high-fidelity visual anchor across the ShelfLife platform. Establish an authoritative **6-Tier Image Priority Cascade** ensuring that every product displays the most authentic visual representation available—from user camera captures to Open Food Facts open-data imagery—while strictly prohibiting deceptive random stock photos.

---

## 2. Problem & Current Limitations

1. **Missing Visual Identity**:
   - Items added via receipt OCR or manual entry often have no image at all, forcing generic gray placeholders that make visual pantry auditing slow.
2. **Discarded Capture Data**:
   - In previous label scanning flows, the photo captured by the user to extract text was discarded after parsing instead of being saved as the product's persistent thumbnail.
3. **Inconsistent Representation**:
   - Different parts of the app (Inventory grid, mobile list, Product Drawer, Export PDF) rendered different fallback states, creating a fragmented visual impression.

---

## 3. Product Principle

**Authenticity over decoration.** A photo of the actual product on your shelf is 100x more valuable than a generic glossy stock photo of a random apple. If authentic imagery is unavailable, a clean, honest category icon is infinitely better than a misleading placeholder.

---

## 4. The 6-Tier Image Priority Hierarchy

Every product thumbnail in ShelfLife resolves through this strict deterministic cascade:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   6-TIER IMAGE PRIORITY HIERARCHY                      │
├─────────┬───────────────────────────┬──────────────┬───────────────────┤
│ Tier 1  │ User-Captured Photo       │ Direct Truth │ Camera / Upload   │
├─────────┼───────────────────────────┼──────────────┼───────────────────┤
│ Tier 2  │ Multi-View Front Panel    │ Primary Angle│ Multi-image scan  │
├─────────┼───────────────────────────┼──────────────┼───────────────────┤
│ Tier 3  │ Delivery Screenshot Crop  │ Ingested Art │ Cart / OCR extract│
├─────────┼───────────────────────────┼──────────────┼───────────────────┤
│ Tier 4  │ Open Food Facts Match     │ Verified Data│ Open Database     │
├─────────┼───────────────────────────┼──────────────┼───────────────────┤
│ Tier 5  │ Prior User Catalog Item   │ Historical   │ Same product name │
├─────────┼───────────────────────────┼──────────────┼───────────────────┤
│ Tier 6  │ Category Fallback Icon    │ Honest Icon  │ Curated SVG/Emoji │
└─────────┴───────────────────────────┴──────────────┴───────────────────┘
```

### Detailed Tier Breakdown

| Tier | Source | Origin & Processing | Provenance Tag |
| :---: | :--- | :--- | :--- |
| **Tier 1** | **User-Captured Photo** | Direct camera snap or photo upload during single-product manual entry. | `user_capture` |
| **Tier 2** | **Multi-View Front Panel** | The designated "Front Angle" from a multi-view scan session. | `multiview_front` |
| **Tier 3** | **Cart Screenshot Crop** | Cropped product thumbnail extracted from supported delivery apps (BigBasket, Instacart, Blinkit). | `import_crop` |
| **Tier 4** | **Open Food Facts** | High-resolution packaging photo fetched from Open Food Facts open API using normalized brand + product title matching. | `openfoodfacts` |
| **Tier 5** | **Historical Product Asset** | Thumbnail previously saved by the same user for an identical product name. | `pantry_history` |
| **Tier 6** | **Category Icon Fallback** | Purpose-crafted, elegant SVG category icon or food glyph (Dairy, Produce, Bakery, Meat, Pantry, Beverage). | `category_fallback` |

---

## 5. Functional & Architectural Requirements

### 5.1 Image Retention from Scan Label

- When a user snaps or uploads a photo in **Scan Label** (`/inventory/new`), the client immediately converts or uploads the image asset.
- Upon successful text extraction, that exact photo is bound to `imageUrl` in the review draft.
- The user can tap *"Change Photo"* if they prefer to replace it before saving.

### 5.2 Open Food Facts Integration & Attribution

1. **Query Mechanism**:
   - Asynchronous server action (`fetchOpenFoodFactsImage(productName, category)`) queries the Open Food Facts API:
     `https://world.openfoodfacts.org/cgi/search.pl?search_terms=[term]&search_simple=1&action=process&json=1`
   - Strict timeout: 2.5 seconds max. If OFF is unresponsive, gracefully falls to Tier 5/6 without blocking UI rendering.
2. **Open Data Licensing & Attribution**:
   - Open Food Facts photos are licensed under the **Open Database License (ODbL)** and **Creative Commons Attribution-ShareAlike (CC-BY-SA)**.
   - When an OFF image is displayed in the Product Detail Dossier, a subtle caption is rendered:
     > *"Product image via [Open Food Facts](https://world.openfoodfacts.org), contributed by the open community."*
3. **Caching**:
   - Matched image URLs are cached locally to minimize redundant external network queries.

### 5.3 Deterministic Fallback Component (`ProductThumbnail.tsx`)

A unified, resilient React component rendered on all product surfaces:
- Handles image loading state with skeleton shimmer.
- Automatically catches `404` or broken image URLs (`onError`) and cleanly falls back to the Tier 6 category glyph without displaying a broken browser icon.
- Aspect ratio: Strict 1:1 square with `object-cover`.

### 5.4 Export Hub Inclusion

- On `/dashboard/inventory/export`, printable PDF and data preview views include the Tier 1–4 product thumbnail whenever present, rendering a clean, commercial inventory catalog.

---

## 6. Prohibited Practices

- **Random Stock Photo Scraping**: Strictly prohibited. Never query Unsplash, Google Images, or Bing to inject random glamour photos of food.
- **Unverified AI Image Hallucination**: Never use generative AI (e.g. DALL-E) to fabricate a product label or brand package.

---

## 7. Consumer vs. Business Parity

- **Consumer**: Enjoys colorful retail grocery thumbnails matching actual consumer brands.
- **Business**: Uses commercial supplier invoice image crops, master carton photos, and industrial category glyphs (e.g. *Cold Storage Dairy*, *Dry Grains Pallet*).

---

## 8. Acceptance Criteria

- [ ] Scan Label photos are retained and saved as the item's primary thumbnail.
- [ ] Multi-view sessions designate the Front angle as `imageUrl`.
- [ ] Open Food Facts integration resolves matching retail product photos within 2.5s.
- [ ] Proper ODbL attribution link is visible in the full Product Dossier for OFF assets.
- [ ] Zero broken image icon states occur across Grid, List, Drawer, and PDF Export.
- [ ] Random stock photos and AI-hallucinated product packaging are strictly omitted.
