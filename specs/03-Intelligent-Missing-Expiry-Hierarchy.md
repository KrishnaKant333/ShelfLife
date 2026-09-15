# ShelfLife Specification: Intelligent Missing Expiry & Estimated Shelf Life Hierarchy

**Cycle**: P1 / Product Understanding Improvements  
**Status**: 🟢 100% Completed & Verified  
**Applies To**: Consumer Kitchen (`/dashboard`) and Commercial Operations (`/business/dashboard`)

---

## 1. Objective

Establish a robust, transparent **5-Tier Expiry Intelligence Hierarchy** that eliminates user friction when grocery receipts, cart screenshots, or unbranded bulk produce lack explicit printed expiration dates. Provide smart category-based shelf-life estimates while strictly protecting user safety, maintaining provenance transparency, and upholding deterministic mathematical rules.

---

## 2. Problem & Observed Friction

In real-world pantry management:
1. **The "Missing Expiry" Bottleneck**:
   - Invoices, grocery delivery screenshots (e.g. BigBasket, Instacart, Blinkit), and farmer's market receipts list items like *"Bananas"*, *"Whole Wheat Bread"*, or *"Chicken Thighs"*, but **never print expiration dates**.
   - Previously, ShelfLife blocked the import or forced the user to manually guess and type a date for every single item before allowing the import to complete.
   - This defeated the convenience of fast AI-assisted bulk import.
2. **Ambiguity & Hallucination Risks**:
   - Uncalibrated vision AI can confuse the invoice date, delivery date, billing timestamp, or barcode SKU digits with product expiration dates.
   - Presenting an AI guess as if it were a manufacturer-certified expiration date creates safety risks.

---

## 3. Product Principle

**A date is either manufacturer fact, a deterministic derivation, an intelligent category estimate, or unknown. The user must always know which one they are looking at.**

ShelfLife must never silently fabricate an expiration date, nor may it block a user from cataloging their food simply because a receipt did not include a stamp.

---

## 4. The 5-Tier Expiry Intelligence Hierarchy

Every product in ShelfLife resolves its freshness date through this strict priority cascade:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   5-TIER EXPIRY INTELLIGENCE HIERARCHY                 │
├─────────┬───────────────────────────┬──────────────┬───────────────────┤
│ Tier 1  │ Explicit Manufacturer Exp │ Absolute Fact│ Printed/Stamped   │
├─────────┼───────────────────────────┼──────────────┼───────────────────┤
│ Tier 2  │ Explicit Best-Before/Use-By│ Certified Date│ Printed Warning   │
├─────────┼───────────────────────────┼──────────────┼───────────────────┤
│ Tier 3  │ Mfg Date + Stated Shelf Life│ Deterministic│ Date + Duration   │
├─────────┼───────────────────────────┼──────────────┼───────────────────┤
│ Tier 4  │ AI-Estimated Freshness    │ Heuristic    │ Labeled "Estimated"│
├─────────┼───────────────────────────┼──────────────┼───────────────────┤
│ Tier 5  │ Unknown Freshness         │ Untracked    │ "Date Not Available"│
└─────────┴───────────────────────────┴──────────────┴───────────────────┘
```

### Detailed Tier Definitions

| Tier | Source / Provenance | Description | Example | UI Presentation Badge |
| :---: | :--- | :--- | :--- | :--- |
| **Tier 1** | `manufacturer_expiry` | Directly scanned or entered explicit expiry date printed on package. | `EXP: 28-OCT-2026` | Standard Crisp Date |
| **Tier 2** | `best_before` | Explicit "Best Before" or "Use By" date specified on packaging. | `BEST BEFORE 14-DEC-2026` | `Best Before [Date]` |
| **Tier 3** | `mfg_plus_shelf_life` | Stated Manufacturing date combined with packaging shelf-life claim. | `PKD: 01/2026` + `Best within 9 months` → `2026-10-01` | `Stated: [Date]` |
| **Tier 4** | `ai_estimated` | Category/commodity shelf life heuristic calculated from entry date. | Fresh bread entered today + standard 4-day shelf life. | `Estimated: [Date] ✦` *(Amber/Dotted)* |
| **Tier 5** | `unknown` | Non-perishable, ambiguous, or user-declined estimated date. | Vinegar, dry spices, or user clears the estimated date. | `Expiry Not Tracked` |

---

## 5. Functional & Business Logic Requirements

### 5.1 Date Field Discrimination (Anti-Confusion Filter)

During invoice, receipt, or label extraction, the AI and regex parser must strictly segregate administrative metadata from product shelf life:
- **Never Treated as Expiry**:
  - Invoice Issue Date
  - Order / Delivery Timestamp
  - Payment Authorization Date
  - Store / Terminal ID
  - SKU numbers, Barcode digits, or Batch IDs (e.g. `20260914` as batch number)
- If only an invoice date is present (e.g. `Delivered on: 14 Sep 2026`), that date acts as the **starting reference point** for Tier 4 estimations, never as the expiration date itself.

### 5.2 Category-Based Estimated Shelf-Life Heuristics (Tier 4)

When Tier 1–3 dates are absent on imported items, ShelfLife provides an initial intelligent estimate using culinary freshness standards:

| Food Category / Item | Default Estimated Freshness | Basis / Reference |
| :--- | :--- | :--- |
| **Fresh Milk / Dairy (Opened/Local)** | +5 to +7 days | USDA FoodKeeper / Standard Cold Chain |
| **Fresh Bread / Bakery** | +4 to +6 days | Commercial shelf-stability |
| **Fresh Berries / Leafy Greens** | +3 to +5 days | Fast-respiring produce |
| **Hard Vegetables (Potatoes, Onions)** | +21 to +30 days | Ambient cool storage |
| **Fresh Poultry / Raw Fish** | +2 days | High-risk cold storage |
| **Pantry Dry Goods (Rice, Pasta)** | +180 to +365 days | Dry storage |
| **Eggs** | +21 days | Standard refrigerated shelf life |

### 5.3 Provenance Storage & Schema Implications

```prisma
enum ExpiryType {
  MANUFACTURER_EXPIRY
  BEST_BEFORE
  MFG_PLUS_SHELF_LIFE
  AI_ESTIMATED
  UNKNOWN
}

model InventoryItem {
  // ...
  expiryDate    DateTime?
  expiryType    ExpiryType @default(UNKNOWN)
  // ...
}
```

- When an item is created or edited:
  - If the user manually types or confirms a manufacturer date → `expiryType = MANUFACTURER_EXPIRY`.
  - If calculated via AI category heuristic → `expiryType = AI_ESTIMATED`.
  - If left blank or explicitly toggled off → `expiryType = UNKNOWN`.

---

## 6. UX & Presentation Standards

1. **Visual Transparency**:
   - **Tier 1–3**: Rendered in standard high-contrast typography (`font-mono tabular-nums`).
   - **Tier 4 (Estimated)**:
     - Accompanied by a subtle sparkle icon (`✦`) and an `Estimated` badge.
     - Tooltip reads: *"Estimated based on standard grocery shelf life for [Category]. Tap to adjust."*
     - In edit dialogs, a single tap lets the user convert it into a confirmed manufacturer date or remove it.
2. **Review Screen Ergonomics**:
   - On Invoice Import and Label Scan review tables, items without explicit packaging dates display the suggested estimate in an editable field highlighted with an amber accent.
   - The user is never blocked from saving; one click confirms all items.

---

## 7. Interaction with Downstream Workspaces

| Module | Interaction with Tier 4 (Estimated) | Interaction with Tier 5 (Unknown) |
| :--- | :--- | :--- |
| **Alerts (`/dashboard/alerts`)** | Triggers proactive *Expiring Soon* reminders, but badge indicates `(Est.)`. | Excluded from date-based alerts; only triggers *Low Stock* alerts if depleted. |
| **Recipes (`/dashboard/recipes`)** | Eligible for recipe inclusion; prioritized in "Use First" recommendations before estimated expiry passes. | Eligible for recipes if marked available; never causes false expiration exclusion. |
| **Safety Filter (Recipe Expiry Guard)** | If an item's estimated date has passed by >48 hours, recipe engine flags it for user visual inspection. | Never blocked from recipe consideration. |
| **Waste Analytics (`/dashboard/waste`)** | Avoided waste calculations note estimated shelf-life preservation. | Excluded from spoilage metrics until user explicitly logs a discard. |

---

## 8. Consumer vs. Business Parity

- **Consumer**: Ideal for daily groceries, farmers' markets, and delivery app screenshots.
- **Business**: Commercial operations require stricter traceability. Tier 4 estimates are permissible for raw produce and scratch prep, but are prominently highlighted in the Daily Hazard & Prep Log so kitchen staff perform sensory checks before prep.

---

## 9. Acceptance Criteria

- [ ] Invoice and receipt imports with zero explicit expiry dates no longer block submission.
- [ ] Tier 4 estimated dates display a clear, accessible visual `Estimated` label and tooltip.
- [ ] Editing an estimated date converts its provenance to `MANUFACTURER_EXPIRY`.
- [ ] Invoices never mistake invoice or delivery dates for product expiration dates.
- [ ] Deterministic mathematical calculations (days remaining, expired status) remain authoritative across all tiers.
- [ ] Safe fallback: Items with unknown expiry (`Tier 5`) display `Date Not Available` and do not trigger false expired errors.
