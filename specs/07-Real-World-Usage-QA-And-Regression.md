# ShelfLife Specification: Real-World Usage QA & Regression Layer

**Cycle**: Cross-Cutting Quality Assurance & Verification  
**Status**: 🟡 Queued for Verification Pass (Specification Ready)  
**Applies To**: Consumer Kitchen (`/dashboard`) and Commercial Operations (`/business/dashboard`)

---

## 1. Objective

Provide an immutable, scenario-based verification framework ensuring that every physical-world usage improvement is rigorously validated before deployment. Guard against regressions in arithmetic precision, database serialization, multi-view parsing, mobile responsiveness, and Consumer/Business workspace boundaries.

---

## 2. Standard Quality Assertion Pattern

Every scenario in this QA specification follows the formal 5-stage failure-analysis and verification protocol:

$$\text{Observed Friction} \longrightarrow \text{Expected Behavior} \longrightarrow \text{Root Cause} \longrightarrow \text{Engineering Fix} \longrightarrow \text{Regression Test}$$

---

## 3. Core Real-World Usage Regression Scenarios

### Scenario 1: Decimal Inventory Consumption
- **Observed**: Consuming `0.2 L` from a `4 L` milk bottle or `15.5 g` of chutney produced `invalid input syntax for type integer: "15.5"` or was truncated to `0` / `1`.
- **Expected**: `4 L - 0.2 L = 3.8 L`. Consuming `15.5 g` deducts `15.5` cleanly and records an exact consumption ledger row without database errors.
- **Root Cause**: `inventoryConsumption.quantityUsed` was PostgreSQL `int4` in production, accompanied by `parseInt(...)` and `min="1"` in form components.
- **Fix**: Alter column `quantityUsed` to `float8` (`double precision`), sanitize arithmetic with 4-decimal precision rounding (`Math.round(val * 10000) / 10000`), and use unit-aware inputs (`isIntegerUnit`).
- **Regression Test**:
  1. Add continuous item: `Organic Milk (4 L)`.
  2. Quick consume: `0.2 L`.
  3. Assert database: `quantity` = `3.8`, `quantityUsed` = `0.2`.
  4. Assert discrete item: `Eggs (12 pieces)` rejects `1.5 pieces` with a whole-number validation error.

---

### Scenario 2: Recipe Consumption with Unit Conversion
- **Observed**: A recipe calls for `200 ml` of milk. User owns `4 L` of milk. Clicking "I Cooked This" either failed with incompatible unit errors or subtracted `200` directly from `4`, producing a negative stock error (`4 - 200 = -196`).
- **Expected**: System recognizes culinary volume compatibility (`ml` to `L`), converts `200 ml` to `0.2 L`, deducts `0.2 L` from `4 L`, leaving `3.8 L`, and records `normalizedQuantityUsed: 200` (ml).
- **Root Cause**: Incomplete volumetric normalization and cross-unit delta subtraction in cooking action handlers.
- **Fix**: Wire `convertQuantity` into `KitchenCookingDrawer.tsx` before building the deduction payload, passing the converted pantry-unit delta to `consumeIngredientsAction`.
- **Regression Test**:
  1. Seed inventory with `4 L` milk.
  2. Cook a recipe requiring `250 ml` milk.
  3. Assert pantry stock updates to `3.75 L`.
  4. Assert activity ledger logs `action: "consumed"`, `quantity: 0.25`, `unit: "L"`.

---

### Scenario 3: Multiple Product Image Views
- **Observed**: User took photos of both the front packaging (brand) and back panel (ingredients/expiry). The scanner created two separate incomplete draft items in inventory.
- **Expected**: Both photos are aggregated into one single inventory draft: Front provides brand/title, Back provides net weight, ingredients, and expiration date.
- **Root Cause**: Vision extraction treated every image as an independent document payload.
- **Fix**: Multi-image array prompt sent to Groq vision model with explicit single-product aggregation instructions and confidence-weighted field merging.
- **Regression Test**:
  1. Upload Image A (Cereal box front) and Image B (Cereal box nutrition & expiry panel).
  2. Assert exactly 1 item appears in review table.
  3. Assert title is from Image A, expiry date is from Image B, and `additionalImageUrls` contains Image B.

---

### Scenario 4: Missing Expiry with AI Estimate
- **Observed**: Uploading a grocery cart receipt with unbranded bananas and fresh bread blocked import submission with: *"Please add an expiry date to every product before importing"*.
- **Expected**: Items without printed dates receive a Tier 4 intelligent estimate based on food category (e.g. Bread: +4 days, Bananas: +5 days), labeled with an accessible `Estimated` badge, allowing instant one-tap confirmation.
- **Root Cause**: Hardcoded mandatory validation requiring `expiryDate !== null` on invoice ingestion.
- **Fix**: Integrated 5-tier freshness hierarchy, permitting Tier 4 category heuristics and Tier 5 `UNKNOWN` without blocking form submission.
- **Regression Test**:
  1. Ingest receipt with items lacking dates.
  2. Verify review table auto-populates category shelf-life estimates with `Estimated` badge.
  3. Click "Import". Assert items save successfully to database with `expiryType: "AI_ESTIMATED"`.

---

### Scenario 5: Mobile Inventory Default List View
- **Observed**: On a smartphone, inventory rendered as massive cards stacked vertically, requiring hundreds of thumb scrolls to review a standard 30-item kitchen pantry.
- **Expected**: Smartphone viewports (<768px) default to a high-density 68px list row showing thumbnail, title, remaining quantity, and color-coded expiration badge. At least 7 items visible above the fold.
- **Root Cause**: Grid layout was hardcoded as the initial desktop and mobile default state.
- **Fix**: Viewport-aware layout initialization with persistent `localStorage` preference and dedicated mobile row component (`MobileInventoryRow.tsx`).
- **Regression Test**:
  1. Load `/dashboard/inventory` on a 375px viewport (mobile emulation).
  2. Verify List view renders automatically without vertical card stacking.
  3. Toggle to Grid; refresh page; assert Grid preference persists.

---

### Scenario 6: Contextual Product Dossier Quick Actions
- **Observed**: Tapping "Add More Stock" or "Move to Another Category" inside the slide-over dossier redirected the user to the full-page edit form, losing their place in inventory. Tapping "Set Reminder" dumped the user on the generic alerts page.
- **Expected**: Tapping "Add More Stock" opens an immediate slide-up sheet showing current stock, an add input, and live total balance. Tapping "Set Reminder" opens an item-specific schedule picker (1d, 2d, 3d, 1w).
- **Root Cause**: Actions were implemented as standard `next/link` anchors to other routes.
- **Fix**: Built contextual sub-sheets and focused server actions (`updateQuantityAction`, `updateCategoryAction`, `scheduleItemReminderAction`).
- **Regression Test**:
  1. Open Product Drawer for `Basmati Rice (2 kg)`.
  2. Tap "Add More Stock" → enter `3` → verify new total displays `5 kg` → tap Confirm.
  3. Assert URL does not change, drawer updates stock to `5 kg`, and toast confirms restock.

---

### Scenario 7: Product Thumbnail Fallback Hierarchy
- **Observed**: Invoices without photos rendered broken image icons or jarring gray blocks across the inventory catalog and PDF export.
- **Expected**: When no user photo exists, system queries Open Food Facts open-data imagery; if unmatched, falls back gracefully to a polished, high-contrast category SVG glyph.
- **Root Cause**: Direct unhandled `img` tags without fallback cascades or error listeners.
- **Fix**: Built `ProductThumbnail.tsx` enforcing the 6-Tier Image Priority Cascade with graceful `onError` fallback handling.
- **Regression Test**:
  1. Ingest product with no photo.
  2. Assert OFF image loads if product matches a known barcode/title.
  3. Emulate network failure or bogus image URL; assert component instantly renders honest category icon without broken browser icon.

---

### Scenario 8: Consumer and Business Feature Parity & Isolation
- **Observed**: Past bug accidentally leaked recipe recommendations and `/dashboard/recipes` links into the commercial business dashboard.
- **Expected**: Fractional quantities, multi-view parsing, mobile list view, contextual dossier actions, and image hierarchies operate with 100% parity across Consumer and Business. However, Business **strictly omits all recipe routes, buttons, and drawers**.
- **Root Cause**: Shared components did not rigorously branch on `accountType === "business"`.
- **Fix**: Comprehensive audit of `ProductDetailDrawer`, `Sidebar`, `AppHeader`, and server actions ensuring complete recipe exclusion for Business.
- **Regression Test**:
  1. Log in as Business (`/business/dashboard`).
  2. Verify:
     - Fractional restock works identically.
     - Mobile list works identically.
     - **ZERO** recipe buttons, recipe tabs, or recipe links exist anywhere in the UI.
     - Direct URL navigation to `/business/dashboard/recipes` returns 404.

---

## 4. Acceptance Criteria & Quality Sign-Off

- [ ] All 8 regression scenarios validated with passing automated and manual assertions.
- [ ] Production build (`npm run build`) compiles cleanly with 0 errors across all 35 routes.
- [ ] TypeScript check (`npx tsc --noEmit`) passes with 0 warnings.
- [ ] No database schema drift between development and production.
