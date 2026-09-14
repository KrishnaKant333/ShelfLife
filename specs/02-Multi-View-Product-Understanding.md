# ShelfLife Specification: Multi-View Product Understanding

**Cycle**: P1 / Product Understanding Improvements  
**Status**: 🟡 Queued for Implementation (Specification Ready)  
**Applies To**: Consumer Kitchen (`/dashboard/inventory/new`) and Commercial Operations (`/business/dashboard/inventory/new`)

---

## 1. Objective

Enable multi-angle product understanding across both file upload and progressive camera capture workflows. Allow users to provide multiple photographs of a single physical product (front, back, bottom, and side panels) and have ShelfLife's AI intelligently synthesize these angles into **one comprehensive, high-confidence inventory record** without creating duplicate items.

---

## 2. Problem & Observed Friction

Food and grocery packaging is inherently three-dimensional:
- **Front Panel**: Contains branding, primary product name, and marketing claims (e.g. *"Organic Greek Yogurt"*).
- **Back Panel**: Contains net quantity, serving sizes, ingredients, allergen warnings, and nutritional tables.
- **Top / Bottom / Flap / Rim**: Contains stamped expiry dates, batch/lot codes, and manufacturing timestamps.

Currently, ShelfLife processes product imagery as a single image. If a user uploads the front panel, the system often misses the stamped expiry date on the bottom flap. If the user uploads the expiry stamp, the system misses the brand name. Users are forced to manually enter whatever the single angle did not capture.

---

## 3. Product Principle

**A product is a physical entity, not a flat plane.** Capturing different angles of the same box of cereal, bottle of oil, or jar of spices should deepen the system's understanding of that item, not create three separate products.

---

## 4. Scope

- **Upload Mode**: Multi-file dropzone allowing users to select or drop 1 to 4 images at once.
- **Camera Capture Mode**: Interactive, progressive viewfinder that allows capturing consecutive angles with real-time field accumulation.
- **AI Extraction Pipeline (`src/lib/actions/label-scan.ts`)**: Multi-image vision prompt synthesizing visual inputs into a single structured schema.
- **Storage & Data Modeling**: Primary thumbnail designation with auxiliary image persistence.
- **Confirmation UX**: Existing review and edit step retains full manual override capability before inventory write.

---

## 5. Functional Requirements

### 5.1 Angle Roles & Expected Intelligence

| Panel Angle | Primary Information Harvested | Secondary Fallbacks |
| :--- | :--- | :--- |
| **Front (Main)** | Brand name, product title, sub-variant, category | Net weight, volume label |
| **Back** | Net quantity, standard unit, ingredients list, allergens | Manufacturer address, storage advice |
| **Bottom / Rim / Flap** | Expiry date, Best-Before date, Manufacturing date | Batch code, Lot number |
| **Side / Top** | Nutrition facts, serving sizes, barcode/UPC | Storage conditions (Keep refrigerated) |

### 5.2 Upload Mode Requirements

1. **Multi-File Selection**:
   - The file input and drag-and-drop zone accepts up to 4 images simultaneously (`image/*`).
   - Visual preview carousel shows all selected thumbnails with badge indicators (`Angle 1 (Front)`, `Angle 2 (Back)`, etc.) before extraction.
   - User can re-order or remove individual thumbnails.
2. **Unified Batch Extraction**:
   - All uploaded images are sent to the vision model in a single multi-part payload.
   - The AI is instructed:
     > *"You are analyzing multiple views of ONE SINGLE food product. Merge all information across images into one unified product record. Never output multiple items."*
   - Results populate the single unified review form.

### 5.3 Progressive Camera Capture Mode

1. **Streamlined Viewfinder Experience**:
   - The user opens the camera scanner.
   - Upon snapping the first image (Front), the system immediately captures it, displays a thumbnail chip in a persistent bottom tray, and displays a subtle prompt:
     > *"Front captured! Snap back for ingredients or rim for expiry — or tap Review."*
   - Shutter button remains active for consecutive angle snaps without resetting the camera stream.
   - Maximum angle limit: 4 photos per item.
2. **Progressive Field Accumulation**:
   - As angles are snapped, the client maintains an accumulated extraction state:
     - If Image 1 extracts `name: "Organic Whole Milk"`, `quantity: 1`, `unit: "L"`, but `expiryDate: null`.
     - Image 2 captures the cap stamp: `expiryDate: "2026-09-24"`.
     - The consolidated record merges the high-confidence fields from both.
3. **Confidence-Weighted Merging**:
   - High-confidence fields from primary angles are not overwritten by blurry or occluded secondary angles.
   - Text explicitly identified as an expiry date on a stamp panel takes precedence over ambiguous numeric text on a front marketing banner.

---

## 6. Data & Schema Architecture

### 6.1 Database Schema Evolution (Planned for Implementation Phase)

```prisma
model InventoryItem {
  id                    Int       @id @default(autoincrement())
  userId                Int
  businessId            Int?
  name                  String
  category              String
  quantity              Float
  unit                  String
  expiryDate            DateTime?
  imageUrl              String?   // Primary front thumbnail
  additionalImageUrls   String[]  // Auxiliary views (back, nutrition, expiry stamp)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  // ... relations
}
```

- **Primary Image (`imageUrl`)**:
  - The front-facing image is designated as the primary thumbnail.
  - Used for inventory cards, mobile list rows, search results, and CSV/PDF export previews.
- **Auxiliary Images (`additionalImageUrls`)**:
  - Stored as an array of URLs or cloud storage paths.
  - Rendered in a carousel within the Product Details Digital Dossier (`ProductDetailDrawer.tsx` / full dossier page).
  - Enables users to inspect the physical packaging, nutrition label, or expiry stamp retrospectively without retaining physical trash.

---

## 7. AI Vision Prompting & Deterministic Validation

### 7.1 Multi-View Vision Prompt Rules

1. **Explicit Identity Synthesis**:
   - The prompt instructs the LLM to reconcile differences:
     - Example: Front says *"Zero Sugar Cola"*, side says *"Can contains 330ml"*. Merged result: Name = *"Zero Sugar Cola"*, Quantity = `330`, Unit = `"ml"`.
2. **Strict Field Confidence Invariant**:
   - Missing fields on one panel must be resolved from other panels if available.
   - Conflicting dates: Stamped alphanumeric dates (e.g. `24 SEP 26` or `EXP 09/26`) outrank printed copyright or packaging design dates.
3. **Deterministic Authority**:
   - Extracted quantities and units pass through `normalizeQuantity` and `isIntegerUnit`.
   - Extracted dates pass through ISO 8601 validation. Ambiguous dates trigger manual review rather than silent truncation.

---

## 8. Consumer vs. Business Parity

- **Consumer**: Primary usage revolves around retail grocery packaging (tetra paks, cans, cereal boxes, produce bags).
- **Business**: Primary usage includes commercial master cartons, bulk spice sacks, crates, and vacuum-sealed food-service cuts. Multi-view captures commercial batch codes and distributor labeling alongside expiration.
- **Workflow**: Both workflows conclude at the identical interactive review/edit confirmation screen before committing to inventory.

---

## 9. Acceptance Criteria

- [ ] Uploading 2–4 photos of one product produces exactly **one** unified draft item in the review stage.
- [ ] Front panel branding and bottom panel expiry stamp are merged into a single inventory record.
- [ ] Camera mode supports rapid multi-shot capture without refreshing or reloading the viewfinder.
- [ ] The primary front image is saved as `imageUrl`, and secondary angles are accessible in the Digital Dossier.
- [ ] No image upload or camera action creates duplicate inventory rows.
- [ ] User can manually edit or override any extracted field before saving.
