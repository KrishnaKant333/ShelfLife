# ShelfLife Specification: Fractional Quantities & Database Parity

**Cycle**: P0 / Completed Foundation & Continuous Invariants  
**Status**: 🟢 Database Migration Applied & Verified | Active Architecture Invariant  
**Applies To**: Consumer Kitchen (`/dashboard`) and Commercial Operations (`/business/dashboard`)

---

## 1. Objective

Guarantee end-to-end support for fractional (decimal) inventory quantities across all data entry, editing, portion consumption, invoice imports, and recipe execution workflows. Ensure absolute mathematical determinism, prevent precision loss, and enforce permanent structural parity between development and production database schemas.

---

## 2. Problem & Historical Context

Historically, the development PostgreSQL database permitted floating-point values for inventory records, but the production PostgreSQL database retained `inventoryConsumption.quantityUsed` as an `INTEGER` (`int4`), while `inventoryItem.quantity` was `double precision` (`float8`).

This discrepancy caused runtime failures in production whenever users attempted to consume fractional portions:
- Consuming `0.2 L` of milk from a `4 L` bottle or `15.5 g` of sauce threw PostgreSQL exceptions:
  ```text
  ERROR: invalid input syntax for type integer: "15.5"
  ```
- Application user interfaces contained legacy `parseInt(...)` parsers and hardcoded `min="1"` / `step="1"` HTML attributes that either rounded decimal inputs down to integers, truncated fractions, or blocked decimal inputs entirely.
- In-memory client codecs in long-running Node.js processes previously cached old schema definitions, causing parameter serialization failures even after DDL adjustments.

---

## 3. Product Principle

**Real food does not exist exclusively in whole numbers.** Milk is measured in litres and millilitres; cheese, spices, meat, and vegetables are measured in kilograms and grams. Any digital inventory system that forces discrete integers onto continuous physical goods creates friction, distorts stock levels, and forces inaccurate manual workarounds. 

Continuous goods must support high-precision decimals; discrete packaged goods must strictly enforce whole integers.

---

## 4. Scope

- **Database Layer**: `inventoryItem.quantity` (`float8`), `inventoryConsumption.quantityUsed` (`float8`), `inventoryConsumption.normalizedQuantityUsed` (`float8`), `inventoryActivity.quantity` (`float8`).
- **Domain Normalization (`src/lib/normalization.ts`)**: Distinct categorization of continuous vs. discrete units.
- **Consumption Workflows**:
  - Quick Consume Modal (`QuickConsumeModal.tsx`)
  - Product Detail Slide-Over Dossier (`ProductDetailDrawer.tsx`)
  - Inventory Inline Consume Dialog (`InventoryView.tsx`)
  - Kitchen Cooking Mode ingredient usage deduction (`KitchenCookingDrawer.tsx` & `recipes.ts`)
  - Waste & Discard logging (`waste.ts` & `AlertActionCard.tsx`)
- **Creation & Editing Workflows**:
  - Consumer Add/Edit Product forms (`AddProductForm.tsx`, `EditProductForm.tsx`, `AddProductFlow.tsx`)
  - Business Add/Edit Product forms (`BusinessAddProductForm.tsx`, `BusinessEditProductForm.tsx`)
  - Invoice Import Tables for Consumer and Business (`InvoiceImport.tsx`, `BusinessInvoiceUpload.tsx`)

---

## 5. Functional & Business Logic Requirements

### 5.1 Unit Classification: Continuous vs. Discrete

All units in the ShelfLife system are dynamically evaluated through `isIntegerUnit(unit: string)`:

1. **Continuous Units (Fractional Supported)**:
   - **Weight**: `mg`, `g`, `gm`, `gram`, `grams`, `kg`, `kilogram`, `kilograms`, `oz`, `ounce`, `lb`, `pound`.
   - **Volume**: `ml`, `millilitre`, `l`, `litre`, `liters`, `cl`, `fl oz`, `tsp`, `tbsp`, `cup`, `pint`, `quart`, `gallon`.
   - **Behavior**:
     - HTML inputs must specify `min="0.0001"`, `step="any"`, `inputMode="decimal"`.
     - Validated via `Number.isFinite(val) && val > 0`.
     - Floats are rounded to 4 decimal places (`Math.round(val * 10000) / 10000`) before database persistence to eliminate IEEE 754 binary floating-point artifacts (e.g. `0.20000000000000007`).

2. **Discrete Units (Integer Enforced)**:
   - **Count / Packaged**: `pcs`, `piece`, `pieces`, `count`, `units`, `pack`, `packs`, `packet`, `bottle`, `bottles`, `box`, `boxes`, `can`, `cans`, `tin`, `tins`, `tub`, `tubs`, `loaf`, `loaves`, `carton`, `cartons`.
   - **Behavior**:
     - HTML inputs must specify `min="1"`, `step="1"`, `inputMode="numeric"`.
     - Validated via `Number.isInteger(val) && val >= 1`.
     - Decimals like `1.5 bottles` are explicitly blocked with a clear user prompt: *"Quantity must be a whole number for unit [unit]"*.

### 5.2 Deterministic Subtraction & Balance Calculation

- When portion consumption occurs, remaining quantity is calculated as:
  $$\text{Remaining} = \operatorname{round}\left((\text{CurrentStock} - \text{QuantityUsed}) \times 10000\right) / 10000$$
- If $\text{Remaining} \le 0.0001$, the item is marked fully consumed (or removed from active inventory), and a full consumption record is archived.
- Standard consumption examples:
  - $4\text{ L} - 0.2\text{ L} = 3.8\text{ L}$
  - $2\text{ kg} - 0.25\text{ kg} = 1.75\text{ kg}$
  - $800\text{ g} - 125\text{ g} = 675\text{ g}$
  - $12\text{ pcs} - 3\text{ pcs} = 9\text{ pcs}$
  - Recipe consumption: $200\text{ ml}$ consumed from $4\text{ L}$ stock:
    - $200\text{ ml} = 0.2\text{ L}$
    - $4\text{ L} - 0.2\text{ L} = 3.8\text{ L}$ remaining stock.
    - Consumption record logs: `quantityUsed: 0.2`, `unit: "L"`, `normalizedQuantityUsed: 200` (ml base).

---

## 6. Database Schema & Migration Invariants

### 6.1 Column Specifications

| Table | Column | Type | Nullable | Description |
| :--- | :--- | :--- | :---: | :--- |
| `inventoryItem` | `quantity` | `double precision` (`float8`) | `NO` | Active current stock balance |
| `inventoryConsumption` | `quantityUsed` | `double precision` (`float8`) | `NO` | Exact portion consumed |
| `inventoryConsumption` | `normalizedQuantityUsed` | `double precision` (`float8`) | `YES` | Normalized base value (g / ml / pcs) |
| `inventoryActivity` | `quantity` | `double precision` (`float8`) | `YES` | Activity ledger quantity |

### 6.2 Permanent Parity Invariant

1. **Checked-in Migration**:
   - The versioned Prisma migration `migrations/app/20260913T1748_alter_quantity_used_to_float8` has been executed on both development and production databases.
   - Post-apply contract hash: `6059162589031ed870d8d501475ad224dde50213d4a1e4d0138c053dd1efbbb8`.
2. **Strict Production Discipline**:
   - `prisma db push` is strictly forbidden in production pipelines.
   - `prisma db reset` is strictly forbidden in production pipelines.
   - Schema modifications must always be authored via versioned migration scripts and emitted contracts (`npm run contract:emit`).
   - Every production deployment must verify zero schema drift via preflight inspection before releasing code changes.

---

## 7. User Experience & Interaction Details

1. **Slider & Stepper Controls**:
   - Sliders in Quick Consume and Product Drawer adapt their `step` property:
     - Discrete: `step=1`, `min=1`.
     - Continuous: `step=0.01` (or `quantity / 100`), `min=0.001`.
2. **Percentage Quick Selectors**:
   - Selecting 25%, 50%, 75%, 100% on a continuous item calculates fractions rounded to 4 decimals (e.g. 25% of 0.5 kg = 0.125 kg).
   - Selecting 25%, 50%, 75%, 100% on a discrete item rounds to the nearest integer with a floor of 1 piece.
3. **Live Remaining Balance Preview**:
   - All consumption modals dynamically render: *"Remaining stock after deduction: [balance] [unit]"*.

---

## 8. Consumer vs. Business Parity

- **Consumer**: Supported across pantry item editing, quick use, and Kitchen Cooking Mode recipe deductions.
- **Business**: Supported across bulk commercial invoice ingestions, warehouse portion logging, and spoilage discard reporting. Recipes are excluded from Business, but inventory arithmetic remains identical.

---

## 9. Acceptance Criteria & Verification

- [x] Production database column `inventoryConsumption.quantityUsed` is `double precision` (`float8`).
- [x] Development database column `inventoryConsumption.quantityUsed` is `double precision` (`float8`).
- [x] Decimal values such as `0.2 L`, `15.5 g`, and `0.001 kg` successfully insert into `inventoryConsumption` and `inventoryActivity` without syntax errors.
- [x] Discrete units (`pieces`, `count`, `bottles`) reject non-integer entries.
- [x] All 35 application routes compile cleanly with zero TypeScript errors (`npx tsc --noEmit`).
- [x] Automated unit and database tests pass without decimal rounding anomalies.
