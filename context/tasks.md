# ShelfLife Task Breakdown: Real-World Usage Cycle

**Status Tracking Key**:
- [x] Completed
- [ ] Planned / Queued
- [~] In Progress
- [!] Blocked

---

## 🟢 P0: Foundation & Database Parity (COMPLETED)
- [x] **Task 0.1**: Categorize units into continuous vs. discrete in `src/lib/normalization.ts` (`isIntegerUnit`).
- [x] **Task 0.2**: Update Quick Consume Modal with unit-aware `step`, `min`, decimal parsing, and 4-decimal precision rounding.
- [x] **Task 0.3**: Update Product Detail Drawer with decimal portion support, slider step tuning, and direct decimal input.
- [x] **Task 0.4**: Update inline consume dialog in `InventoryView.tsx`.
- [x] **Task 0.5**: Update Consumer and Business Add/Edit product forms and invoice upload tables to support fractional quantities.
- [x] **Task 0.6**: Create and check in Prisma Next migration `20260913T1748_alter_quantity_used_to_float8`.
- [x] **Task 0.7**: Execute production database migration using temporary environment variable; verify `quantityUsed` altered from `int4` to `float8`.
- [x] **Task 0.8**: Re-emit Prisma contract (`npm run contract:emit`) ensuring runtime codecs match `pg/float8@1`.

---

## 🟡 P1: Product Understanding Improvements (QUEUED)

### Milestone P1-A: Multi-View Product Understanding (COMPLETED)
- [x] **Task 1.1**: Update `AddProductFlow.tsx` file input to accept multiple images (`multiple`, max 4).
- [x] **Task 1.2**: Build thumbnail preview tray in upload mode with angle badges (Front, Back, Expiry/Bottom).
- [x] **Task 1.3**: Update camera viewfinder to support consecutive snaps with thumbnail accumulation tray and non-blocking shutter.
- [x] **Task 1.4**: Author multi-image Groq vision prompt in `label-scan.ts` reconciling multi-angle visual inputs into a single unified JSON schema.
- [x] **Task 1.5**: Design and apply migration for `InventoryItem.additionalImageUrls` (`String?`).
- [x] **Task 1.6**: Render auxiliary angle carousel in `ProductDetailDrawer.tsx`.
- [x] **Task 1.7**: Refactor `src/lib/storage.ts` to use Vercel Blob (`@vercel/blob`) in production with local filesystem fallback for development; eliminate corrupt base64 fallbacks; preserve image URLs across product edits.
- [x] **Task 1.8**: Product Image Lifecycle & Orphan Cleanup — implement complete storage deletion abstraction (`deleteProductImage`/`deleteProductImages`), dual Blob/local dispatch, external image shielding (Open Food Facts), reference-aware shared asset protection, pre-confirmation discard & review cleanup, AI inference & creation failure cleanup, and deliberate zero-quantity image preservation. Tested 29/29 assertions passed across local filesystem and live Vercel Blob.

### Milestone P1-B: Intelligent Missing Expiry Hierarchy
- [ ] **Task 2.1**: Remove hard blocking requirement for `expiryDate` in `InvoiceImport.tsx` and `BusinessInvoiceUpload.tsx`.
- [ ] **Task 2.2**: Implement category-based default shelf life heuristics in `src/lib/inventory.ts`.
- [ ] **Task 2.3**: Introduce `expiryType` provenance enum (`MANUFACTURER_EXPIRY`, `BEST_BEFORE`, `MFG_PLUS_SHELF_LIFE`, `AI_ESTIMATED`, `UNKNOWN`).
- [ ] **Task 2.4**: Implement visual `Estimated ✦` badge with amber styling and explanatory tooltip.
- [ ] **Task 2.5**: Implement anti-confusion filter stripping billing, delivery, and payment dates from expiry candidates.
- [ ] **Task 2.6**: Connect estimated dates safely into Alerts and Recipe safety engines without false blocking.

---

## 🟡 P2: UX & Workflow Improvements (QUEUED)

### Milestone P2-A: Mobile Inventory Default List View
- [ ] **Task 3.1**: Build dedicated `MobileInventoryRow.tsx` component (68px height, 48px thumbnail, title, tabular qty, countdown status pill, 44px touch target).
- [ ] **Task 3.2**: Implement viewport-aware default in `InventoryView.tsx` (<768px defaults to List; ≥768px defaults to Grid).
- [ ] **Task 3.3**: Persist user's explicit Grid ↔ List toggle choice in `localStorage`.
- [ ] **Task 3.4**: Optimize mobile list rendering performance (avoid nested heavy filters during rapid scroll).

### Milestone P2-B: Contextual Product Dossier Quick Actions
- [ ] **Task 4.1**: Build "Add More Stock" slide-up sheet with live `Current + Added = New Total` arithmetic.
- [ ] **Task 4.2**: Build "Move to Another Category" sheet with existing category list and inline `+ Add New Category` input.
- [ ] **Task 4.3**: Build "Set Expiry Reminder" popover with 1d, 2d, 3d, 1w, and custom schedule options tied to item ID.
- [ ] **Task 4.4**: Build "Safe Delete" confirmation modal with consumption vs. spoilage reason selector.

---

## 🟡 P3: Imagery & Polish (QUEUED)

### Milestone P3-A: Real Product Thumbnails & Fallbacks
- [ ] **Task 5.1**: Preserve Scan Label photos and bind directly to `imageUrl` upon extraction confirmation.
- [ ] **Task 5.2**: Build `fetchOpenFoodFactsImage` server action with 2.5s timeout and local caching.
- [ ] **Task 5.3**: Build resilient `ProductThumbnail.tsx` enforcing the 6-tier fallback cascade.
- [ ] **Task 5.4**: Add Open Food Facts ODbL license attribution link in the full Product Dossier.
- [ ] **Task 5.5**: Include product thumbnails in PDF export layouts on `/dashboard/inventory/export`.

---

## 🟡 Cross-Cutting QA & Verification
- [ ] **Task 6.1**: Validate 8 real-world usage scenarios against automated tests.
- [ ] **Task 6.2**: Run full TypeScript compilation (`npx tsc --noEmit`).
- [ ] **Task 6.3**: Verify clean Next.js production build (`npm run build`).
- [ ] **Task 6.4**: Verify zero schema drift between development and production databases.
