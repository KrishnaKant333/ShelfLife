# ShelfLife Architecture (Post-1.0 Roadmap)

## 🏗️ Technology Stack

- **Framework**: Next.js 16.3.2 App Router, React 19, TypeScript, Tailwind CSS 4
- **Authentication**: Auth.js credentials with JWT sessions
- **Database & ORM**: PostgreSQL with Prisma-next migration graph
- **Object Storage**: Vercel Blob (`@vercel/blob`) persistent storage in production with automatic fallback to local filesystem (`public/uploads/products/`) during local development
- **AI Intelligence**: Groq SDK (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `qwen/qwen3.6-27b`) with JSON schema enforcement
- **Styling Architecture**: Theme-aware CSS custom properties (`globals.css`) + Tailwind CSS utility classes

---

## 🎨 Dual Visual Architecture

ShelfLife enforces a deliberate architectural separation between public marketing and authenticated workspaces:

```
┌────────────────────────────────────────────────────────┐
│                   ShelfLife Platform                   │
├───────────────────────────┬────────────────────────────┤
│   Public Marketing Layer  │    Authenticated Workspace  │
│   "(marketing)" routes    │    "(dashboard)" & business│
├───────────────────────────┼────────────────────────────┤
│ • "Cinematic / Editorial" │ • "Editorial Productivity" │
│ • Scroll-Scrubbed Video   │ • Clear, Fast, Intelligent │
│ • Dark-Default Direction  │ • Light & Dark Themes      │
│ • Floating Capsule Nav    │ • Bento Command Center     │
│ • No Theme Toggle         │ • Digital Product Dossier  │
│ • Narrative Conversion    │ • Tactile Micro-Interactions│
└───────────────────────────┴────────────────────────────┘
```

1. **Marketing Landing Page (`src/app/(marketing)`)**:
   - Visual Metaphor: *"Cinematic / Editorial / Immersive"*.
   - Features: Top-level scroll-scrubbed background sequence (`CinematicBackground.tsx`), floating suspended capsule navbar, transparent marketing cards, dark-default art direction (theme toggle intentionally omitted to preserve art direction), and solid decoupled dark footer (`#0c120e`).
2. **Authenticated Application (`src/app/(dashboard)` & `src/app/(business)`)**:
   - Visual Metaphor: *"Editorial Productivity / Intelligent Workspace"*.
   - Features: Warm ivory/off-white light surfaces and rich charcoal dark surfaces, editorial serif display typography, tabular monospace numerals, bento-box command center, product dossier, food editorial recipes, and quiet activity feeds.
   - Strictly NO video backgrounds or cinematic scroll storytelling in authenticated views.

---

## 🛡️ Boundaries & Ownership

- **Server Components**: Load authenticated data directly from database helpers (`getInventory()`, `getBusinessInventory()`).
- **Server Actions**: Authenticate session, validate parameters with Zod, verify ownership, mutate database, and revalidate tag/path caches.
- **Client Components**: Handle user interactions, state bindings, local date evaluations, filters, modals, dynamic calculations, and micro-animations.

---

## 📊 Core Data Flows

1. **Manual & Multi-View Entry**: Form / Camera input (up to 4 packaging angles) -> multi-image Groq vision synthesis -> Zod validation -> interactive review table -> server action -> ownership check -> persistent image storage (Vercel Blob / local fallback) -> Prisma mutation.
2. **Dynamic Expiry Derivation**: 5-tier freshness cascade (Manufacturer -> Best Before -> Mfg+ShelfLife -> AI Category Estimate [labeled] -> Unknown).
3. **Deterministic Portion Consumption**: User delta input -> unit classification (`isIntegerUnit`) -> 4-decimal precision calculation -> inventory balance deduction -> immutable `InventoryConsumption` & `InventoryActivity` ledger logging.
4. **Invoice / Label AI Extraction**: Image upload/capture -> Groq AI extraction (`max_tokens: 4096`, `finish_reason` truncation guard) -> client preview review table -> dynamic intelligence stats calculation -> bulk insert.
5. **Dedicated Export Flow**: Dedicated export page (`/dashboard/inventory/export`) -> client status/category filter state -> live preview table with image thumbnails -> CSV trigger or print-window PDF rendering.
6. **Recipe AI Flow (Consumer Only)**: Fetch owned inventory -> filter out expired items -> format prompt -> Groq AI call -> Zod validation -> render recipe cards. (Strictly omitted from Business).
7. **Dynamic Greetings**: Client component (`GreetingHeader`) -> evaluates `new Date().getHours()` on user's browser clock -> renders local greeting.

---

## 🖼️ Product Image Ownership & Storage Lifecycle

ShelfLife implements an explicit, deterministic storage lifecycle architecture across both production object storage (Vercel Blob) and development fallback (local filesystem):

1. **Storage Abstraction (`src/lib/storage.ts`)**:
   - Single point of provider responsibility. Server-only execution. Client components never receive storage tokens or invoke `@vercel/blob` directly.
   - Dual-backend dispatch:
     - IF `BLOB_READ_WRITE_TOKEN` is configured: Uploads to Vercel Blob object storage (`put()`), deletes via `@vercel/blob` `del()`.
     - ELSE: Writes to `public/uploads/products/`, removes via `fs.unlink()` with path-traversal guards.
   - Safe API surface: `saveProductImage()`, `deleteProductImage()`, `deleteProductImages()`, and `isShelfLifeOwnedImage()`.

2. **Provider Awareness & External Image Protection**:
   - ShelfLife assets: `/uploads/products/...` or `https://*.public.blob.vercel-storage.com/...`.
   - External assets: `https://images.openfoodfacts.org/...` or external CDN images.
   - External images MUST NEVER be sent to storage delete APIs. `isShelfLifeOwnedImage()` strictly screens all deletion candidates and skips external assets.

3. **Shared Asset Protection (`src/lib/storage-lifecycle.ts`)**:
   - Before any storage object is deleted, `filterUnreferencedOwnedImages()` checks whether any remaining `InventoryItem` record in the database references that asset.
   - If another item references the asset, storage deletion is skipped. Only truly unreferenced assets are deleted.

4. **Deterministic Lifecycle Cleanup**:
   - **Scan Review Discard & Cancel**: When a user clicks "Remove imagery", removes an auxiliary angle in the review UI, clicks "Cancel", or starts a fresh scan after uploading, `discardUploadedImagesAction()` cleans up the unconfirmed storage assets immediately.
   - **AI Extraction & Storage Failure**: In `extractMultiViewLabelAction()`, if image saving fails partway, or if the Groq vision call or JSON schema parsing throws, uploaded assets are deleted in the catch block before re-throwing the error.
   - **Product Creation Failure**: In `createInventoryItem` / `createBusinessInventoryItem`, if validation fails or database persistence errors occur, uploaded assets are pruned.
   - **Product Deletion & Purge**: When single products, bulk selections, or expired items are deleted, the database records are deleted authoritatively first, followed by unreferenced storage asset cleanup.
   - **Product Edit Image Changes**: If an existing product is updated with new imagery, removed unreferenced assets are cleaned up while preserving unchanged images.

5. **Deliberate Zero-Quantity Decision**:
   - When an item's quantity reaches zero through recipe or portion consumption, the inventory record is consumed or cleared, but its image assets are **deliberately preserved**.
   - Images are retained for consumption history, activity audit trails, nutrition analytics, and future restocking product recognition. Zero-quantity consumption does NOT destroy image assets.

6. **Garbage Collection Deferral**:
   - Deterministic lifecycle cleanup handles known user operations and failures synchronously.
   - Scheduled orphan garbage collector crons / background scanners are intentionally deferred.

---

## 🧭 Active Roadmap: Real-World Usage Improvements (P0–P3)

- **P0: Fractional Quantities & Database Parity** (🟢 **100% Completed & Verified**)
  - PostgreSQL schema synchronized across dev and prod (`float8` for `inventoryConsumption.quantityUsed` and `inventoryItem.quantity`).
  - Unit-aware continuous vs. discrete input handling.
- **P1: Multi-View Product Understanding** (🟢 **100% Completed & Verified**)
  - Upload (up to 4 images) and progressive viewfinder capture with field accumulation.
  - Persistent product image storage migrated to Vercel Blob with local filesystem fallback.
  - Image preservation on edit verified; corrupt base64 fallbacks completely removed.
- **P1: Intelligent Missing Expiry Hierarchy** (🟡 **Queued / Next Task**)
  - 5-tier freshness hierarchy resolving missing receipt/cart dates without blocking submission.
- **P2: Mobile Inventory Default List View** (🟡 **Queued**)
  - Dedicated 68px touch-row default layout for viewports <768px with persistent Grid toggle.
- **P2: Contextual Product Dossier Quick Actions** (🟡 **Queued**)
  - Immediate sub-sheets for Add Stock, Move Category, Expiry Reminder, and Safe Deletion.
- **P3: Real Product Thumbnails & Image Priority** (🟡 **Queued**)
  - 6-tier image priority cascade from camera capture to Open Food Facts and category glyphs.
- **Cross-Cutting QA & Regression Layer** (🟡 **Queued**)
  - 8-part real-world validation matrix.

