# ShelfLife Progress Tracker

**Current Version**: Post-1.0 Roadmap Planning Phase
**Status**:
- v1.0 Production Release: **100% Completed & Verified**
- Cinematic Marketing Landing Page: **100% Completed & Verified**
- Post-1.0 Authenticated UI/UX Redesign Roadmap: **Queued (Stage A Ready for Implementation)**

---

## 🚀 Completed Milestones

### 1. Cinematic Marketing Landing Page Milestone
- [x] Combined dual-clip cinematic sequence video (`public/videos/shelflife-cinematic-sequence.mp4`) with tight 0.5s keyframe GOP and audio strip.
- [x] Smooth scroll-controlled scrubbing (`CinematicBackground.tsx`) via lerp loop (`requestAnimationFrame`) with static poster fallbacks (`hero_poster.webp` / `hero_poster.jpg`) for reduced motion and mobile.
- [x] Floating suspended capsule navbar (`top-3 sm:top-4`) with scroll-aware glassmorphism.
- [x] Landing page art direction permanently locked to dark mode; landing theme toggle intentionally removed.
- [x] High-contrast pure white/emerald typography, transparent marketing cards, and decoupled solid dark footer (`#0c120e`).

### 2. ShelfLife v1.0 Production Release
- [x] **Production Build Checkpoint**: 100% clean Next.js build compilation & TypeScript validation (`npm run build`).
- [x] **Consumer & Business Workspace Isolation**: Auth.js credential sessions with strict server-side ownership checks.
- [x] **Dedicated Export Hub**: `/dashboard/inventory/export` & `/business/dashboard/inventory/export` with interactive status/category filters, live data preview table, instant CSV spreadsheet downloads, and printable PDF report formatting.
- [x] **Dynamic Invoice Intelligence Analysis**: Dynamic client-side calculation for *Detected*, *New Items*, *Existing*, and *Near Expiry / Expired* products that re-evaluates in real-time as users edit extracted invoice items.
- [x] **Invoice AI Token Scaling & Truncation Guard**: Increased Groq invoice extraction `max_tokens` from 1,000 to 4,096 (verified extracting all 22 products from high-res demo invoice), and introduced defensive `finish_reason === "length"` truncation detection to eliminate silent truncation.
- [x] **Scan Label AI & Camera Flow**: Camera stream attachment and label image upload powered by Groq AI with JSON validation safeguards (`reasoning_effort: "none"` tuning).
- [x] **Alerts vs Notifications Purpose Separation**:
  - *Alerts* (`/dashboard/alerts`): Actionable urgent inventory risks (Expiring, Expired, Low Stock with Discard & Use actions).
  - *Notifications* (`/dashboard/notifications`): Informational activity stream for imports, usage logs, and system events.
- [x] **Streamlined Action Toolbar**: Concise header toolbar featuring `Export`, `Import`, `+ Add Product`, and a tooltip-enabled icon-only `Delete Expired` bin button.
- [x] **Time-Accurate Dynamic Greetings**: Local browser time evaluation for *Good morning*, *Good afternoon*, *Good evening*, and *Good night*.
- [x] **Theme System & Atmospheric Visuals**: Dynamic mesh ambient background gradients, persistent Light/Dark/System themes for the app.
- [x] **Recipe AI Safety**: Deterministic filtering excluding expired inventory prior to AI recipe generation.
- [x] **Email Verification & Onboarding**: Strict email verification via SMTP token link with pending standby screen.

---

## 🧭 Queued Post-1.0 Authenticated UI/UX Redesign ("Editorial Productivity / Intelligent Workspace")

- [x] **Stage A — App Visual Foundation & Shared Shell** (🟢 **100% Completed & Verified**)
- [x] **Stage B — Dashboard Command Center** (🟢 **100% Completed & Verified**)
- [x] **Stage C — Inventory Product Catalog** (🟢 **100% Completed & Verified**)
- [x] **Stage D — Product Details Digital Dossier** (🟢 **100% Completed & Verified**)
- [x] **Stage E — Analytics Intelligence Report** (🟢 **100% Completed & Verified**)
- [x] **Stage F — Recipes Food Editorial & Business Strategy Overhaul** (🟢 **100% Completed & Verified**)
- [x] **Stage G — Waste Impact & Environmental Report** (🟢 **100% Completed & Verified**)
- [x] **Stage H — Alerts vs Notifications Separation** (🟢 **100% Completed & Verified**)
- [x] **Stage I — Settings Polished Workspace** (🟢 **100% Completed & Verified**)
- [x] **Stage J — App Motion & Micro-Interactions** (🟢 **100% Completed & Verified**)
- [x] **Stage K — Mobile-First Ergonomics & Accessibility** (🟢 **100% Completed & Verified**)
- [x] **Stage L — Performance & Final Visual QA** (🟢 **100% Completed & Verified**)
- [x] **Bug Fix — Business Recipe Isolation** (🟢 **100% Completed & Verified**):
  - Completely purged all recipe UI elements, tabs, buttons, links, and text from the Business workspace.
  - Omitted "Cook Recipes" action in `ProductDossierHero` when `isBusiness` is true.
  - Omitted "Recipes" tab and panel in `ProductDetailDrawer` for Business accounts (`availableTabs = ["Overview", "History", "AI Insights"]`).
  - Account-aware `AIFoodIntelligence`: replaces consumer recipe jump with commercial ingredient pairings without recipe links.
  - Account-aware `AIPreventionAdvisory`: redirects Business to `/business/dashboard/strategy` instead of dead recipes route.
  - Account-aware `Notifications`: routes Business system sync to `/business/dashboard/strategy` instead of `/recipes`.
  - Account-aware `Settings`: hides Recipe AI Engine section in `AIPreferencesTab` and tailors nav rail text for Business.
  - Retained full, rich recipe functionality for Consumers.
- [x] **Milestone — Consumer & Business Get Started + Login/Signup Visual & Mobile Modernization** (🟢 **100% Completed & Verified**):
  - Unified Get Started, Consumer Auth, Business Auth, and Email Verification into the signature dark editorial ShelfLife aesthetic (`#0c120e` canvas, `#151a16` surfaces, `border-white/10`, `.sl-display-serif` editorial typography).
  - Created shared responsive `AuthLayout` supporting desktop dual-column showcase panel and strict mobile form-first ergonomics (form above the fold, no unnecessary scrolling, 44px touch targets).
  - Preserved 100% of credentials auth, Auth.js JWT sessions, server action validations, email verification tokens, and account-type redirects (`/dashboard` vs `/business/dashboard`).
  - Purged obsolete CSS classes (`.auth-contrast-panel`) from `globals.css`.
  - Maintained clear separation between Consumer (kitchen, recipes, pantry) and Business (FIFO, cost analytics, supplier ingestion, zero recipes).
  - Upgraded `/get-started` with distinct editorial cards and responsive vertical grid instead of awkward mobile carousels.
  - Upgraded `/verify-email` and `/verify-email/pending` with reassuring dark editorial status cards and guidance.

---

## 🧭 Active Roadmap: Real-World Usage Improvements (P0–P3)

- [x] **P0 — Fractional Quantities & Database Parity** (🟢 **100% Completed & Verified**)
  - [x] Unit categorization (`isIntegerUnit`) enforcing continuous decimals vs discrete integers.
  - [x] Replaced `parseInt` and hardcoded `min="1"` across Quick Consume modal, Product Drawer, inline consume dialog, and manual/invoice add forms.
  - [x] Rounding sanitize to 4 decimal places (`Math.round(val * 10000) / 10000`) preventing floating-point artifacts.
  - [x] Checked-in versioned Prisma Next migration `20260913T1748_alter_quantity_used_to_float8`.
  - [x] Successfully applied migration to production database; verified zero schema drift and 0 row loss.
- [x] **P1-A — Multi-View Product Understanding** (🟢 **100% Completed & Verified**)
  - [x] Multi-image intake: file dropzone (1–4 images) and progressive camera viewfinder with continuous snapping and bottom thumbnail tray.
  - [x] Groq AI vision synthesis (`qwen/qwen3.6-27b`) merging front (brand/category), back (quantity/nutrition), and rim/cap (stamped expiry date) into **one single inventory item**.
  - [x] Conflict resolution & confidence weighting: stamped expiry and net content declarations outrank ambiguous marketing claims.
  - [x] Image persistence: migrated to Vercel Blob (`@vercel/blob`) persistent object storage in production returning permanent global CDN HTTPS URLs, with transparent local filesystem fallback (`public/uploads/products/`) for offline development.
  - [x] Removed corrupt base64 fallbacks upon storage failure; verified image preservation during product text edits.
  - [x] Database schema: added `additionalImageUrls text NULL` to `InventoryItem` with checked-in versioned migration `20260914T0719_add_additional_image_urls` applied to dev database.
  - [x] Confirmation UX: interactive Review & Edit screen with Product Imagery summary banner (shows primary thumbnail, auxiliary angles, swap/remove controls).
  - [x] Product Detail Digital Dossier: interactive multi-view thumbnail carousel enabling inspection of packaging panels, nutrition, and expiry stamps.
  - [x] Consumer & Business parity: both `/dashboard/inventory/new` and `/business/dashboard/inventory/new` support multi-view photo intake and persistence.
  - [x] Automated test suite: 23/23 assertions passed (`scratch/test-multi-view.ts`). Typecheck, lint, and production build 100% clean.
- [x] **P1-A.1 — Product Image Storage Lifecycle & Orphan Cleanup** (🟢 **100% Completed & Verified**)
  - [x] Storage deletion abstraction in `src/lib/storage.ts`: `deleteProductImage`, `deleteProductImages`, and `isShelfLifeOwnedImage`.
  - [x] Dual-backend deletion dispatch: `@vercel/blob` `del()` when token configured; path-traversal-guarded `fs.unlink()` for local development.
  - [x] External image protection: Open Food Facts and external CDN assets strictly shielded from storage deletion operations.
  - [x] Reference-aware shared asset protection (`src/lib/storage-lifecycle.ts`): queries existing products to prevent deleting images shared across multiple records.
  - [x] Product deletion cleanup: `deleteInventoryItem`, `deleteBusinessInventoryItem`, `bulkDeleteAction`, and `discardExpiredItemsAction` authoritatively delete DB records first, then clean up unreferenced owned images.
  - [x] Pre-confirmation & Review cleanup: `discardUploadedImagesAction()` cleans up unconfirmed assets on "Remove imagery", single auxiliary removal, "Cancel", or re-scanning.
  - [x] AI inference & storage failure cleanup: `extractMultiViewLabelAction()` cleans up saved assets in try/catch upon Groq/JSON parsing failure.
  - [x] Product creation failure cleanup: `createInventoryItem` and `createBusinessInventoryItem` prune unreferenced uploaded images if validation or DB transaction fails.
  - [x] Auxiliary image removal: `removeAuxiliaryImageAction()` safely updates database references and deletes unreferenced storage objects.
  - [x] Deliberate zero-quantity decision: images deliberately preserved when quantity reaches zero for consumption history, activity audit trails, and restocking.
  - [x] Automated test suite: 29/29 assertions passed across local filesystem and live Vercel Blob object storage.
- [x] **P1-B — Intelligent Missing Expiry Hierarchy (Spec 03)** (🟢 **100% Completed & Verified**)
  - [x] 5-tier freshness cascade implemented in `src/lib/expiry.ts`: `MANUFACTURER_EXPIRY` -> `BEST_BEFORE` -> `MFG_PLUS_SHELF_LIFE` -> `AI_ESTIMATED` -> `UNKNOWN`.
  - [x] Comprehensive commodity & category heuristic rules table aligned with USDA FoodKeeper guidelines and cold chain preservation standards.
  - [x] Invoice date baseline fallback: relative shelf-life estimation anchors against document-level `invoiceDate` (receipt purchase date) rather than processing time.
  - [x] Anti-confusion safeguards: invoice billing, delivery, receipt issue, and tax timestamps are strictly prevented from misidentifying as product expiry dates.
  - [x] Database schema & contract: added `expiryType` nullable text column to `InventoryItem`, generated contract types, and applied additive migration `20260914T1409_add_expiry_type` to Neon PostgreSQL.
  - [x] Deterministic merge resolution: `resolveMergedExpiry` preserves existing dates, adopts incoming dates, and applies FIFO food-safety earlier date selection.
  - [x] Unblocked invoice import: eliminated mandatory manual expiry roadblock; items with missing expiry default to USDA category estimate (`AI_ESTIMATED`) or `UNKNOWN`.
  - [x] Amber `Estimated ✦` visual badge with informative tooltip ("Estimated from item category & purchase date. Click to edit or verify on packaging.").
  - [x] Date Not Available rendering: non-perishables and unknown dates display clean `Date Not Available` state without triggering false "Expired" alerts.
  - [x] Full manual override capability: editing date inline or in form automatically promotes provenance to `MANUFACTURER_EXPIRY`.
  - [x] Commercial sensory prep advisory: Business invoice review includes clear sensory check guidance ("Verify sensory freshness prior to commercial food preparation").
  - [x] Recipe safety alignment: pantry staples without expiry (`expiryDate === null`) are safely included in recipe generation; estimated items expiring in >48h safely suggested.
  - [x] Consumer & Business workspace parity maintained across manual entry, editing, invoice upload, inventory catalogs, and drawers.
  - [x] Automated test suites verified: 5-tier hierarchy verification (`scratch/test-expiry-hierarchy.ts`), merge planning verification (`scratch/test-merge-expiry.ts`), 100% clean typecheck (`npx tsc --noEmit`), and 35-route production build (`npm run build`).
- [x] **P2-A — Mobile Inventory Default List View** (🟢 **100% Completed & Verified**)
  - [x] Viewport-aware layout defaulting to high-density 68px touch rows on mobile screens (<768px).
  - [x] Persistent Grid ↔ List switcher with `localStorage` preference memory (`shelflife_pref_inventory_view`).
  - [x] Displays thumbnail, title, remaining quantity, and countdown status chip above the fold for 7–8 items.
  - [x] Dedicated `MobileInventoryRow.tsx` component with 44x44px touch ergonomics and sub-bar batch selection.
  - [x] Consumer and Commercial parity verified. Typecheck and production build clean.
- [x] **P2-B — Contextual Product Dossier Quick Actions** (🟢 **100% Completed & Verified**)
  - [x] Replaced disorienting full-page redirects with focused slide-over sheets (`BottomSheet.tsx`) inside Partial Product Dossier (`ProductDetailDrawer.tsx`).
  - [x] "Add More Stock" (`ProductRestockModal.tsx`) with real-time balance calculation ($2.5 + 1.25 = 3.75$), quick increment pills, discrete vs continuous unit handling, `InventoryActivity` audit logging, and commercial metadata fields (`invoiceNumber`, `batchLot`, `unitCost`).
  - [x] "Move to Another Category" (`ProductCategoryModal.tsx`) with searchable category grid, active category check, and inline "+ Add New Category" instant creation without page reload.
  - [x] "Set Expiry Reminder" (`ProductReminderModal.tsx`) with 1d/2d/3d/1w/custom presets, target date calculation, `shelflife_item_reminders` local storage sync, `notification_feed` activity tracking, and dynamic `🔔 Reminder: [date]` badge in header.
  - [x] "Delete Product" (`ProductDeleteModal.tsx`) with reason prompts (*Consumed*, *Spoiled/Waste*, *Entry Error/Duplicate*) safeguarding pure waste analytics, combined with 5-second interactive `[Undo]` toast restoring deleted items via `restoreInventoryItemAction`.
  - [x] Consumer and Commercial parity verified. Typecheck and Next.js 35-route production build passed with zero errors.
- [ ] **P3 — Real Product Thumbnails & Image Priority Hierarchy** (🟡 **Queued / Spec Ready**)
  - Authoritative 6-tier image priority cascade.
  - Scan label image retention as persistent product thumbnail.
  - Open Food Facts ODbL integration and resilient category SVG glyph fallback component.
- [ ] **Cross-Cutting QA & Regression Suite** (🟡 **Queued / Spec Ready**)
  - 8-part real-world usage validation matrix covering decimal math, volumetric cooking deductions, and Consumer/Business boundaries.

---

## 🛡️ Core Architectural Principles

- Server-side session ownership is authoritative.
- Business workspaces strictly omit recipe functionality; recipes are exclusive to consumer households.
- Deterministic expiry, quantity normalization, and stock status override AI recommendations.
- Missing expiry remains explicitly unknown (`Expiry not available`) or visually badged as `Estimated`.
- Barcode scanning is deferred and hidden from active entry flows.
- Marketing cinematic video background remains strictly isolated to marketing (`(marketing)/layout.tsx`).
- Landing page theme toggle remains removed.
- Authenticated app preserves dynamic Light and Dark mode options.

