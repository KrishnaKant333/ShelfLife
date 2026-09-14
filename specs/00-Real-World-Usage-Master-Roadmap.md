# ShelfLife — Master Roadmap: Real-World Usage Improvements

**Cycle**: 2026-Q3 / Post-v1.0 Real-World Usage Evolution  
**Status**: Specification & Planning Phase (Documentation Only)  
**Applies To**: Consumer Kitchen (`/dashboard`) and Commercial Operations (`/business/dashboard`)

---

## 1. Executive Summary & Context

ShelfLife has successfully launched its v1.0 foundational platform, completed the visual overhaul of both the cinematic marketing experience and authenticated workspaces (Stages A–L), established strict Consumer/Business session and feature isolation (including total removal of recipes from Business workspaces), and resolved the critical P0 database contract mismatch between development and production.

With the platform active in real day-to-day culinary and commercial inventory tracking, this specification establishes the **Real-World Usage Improvement Cycle**. The cycle elevates ShelfLife from an inventory logger into an intuitive, tactile, and intelligent operational partner by addressing real physical pantry friction points: decimal portioning, multi-sided product packaging, grocery items lacking explicit expiry dates, thumb-first mobile scanning, immediate contextual dossier actions, and trustworthy product imagery.

---

## 2. Priority Phasing Architecture

To ensure orderly, regression-free implementation, the roadmap is organized into four distinct priority tiers and one cross-cutting quality layer:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MASTER IMPROVEMENT ROADMAP                             │
├──────────────────────┬──────────────────────────────────────────────────────┤
│ P0: FOUNDATION       │ • Fractional Quantities & Mathematical Precision     │
│ (Completed & Locked) │ • Strict Development-Production Schema Parity        │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ P1: PRODUCT          │ • Multi-View Product Understanding (Front/Back/Side) │
│ UNDERSTANDING        │ • Intelligent Expiry Hierarchy & Estimated Shelf Life│
├──────────────────────┼──────────────────────────────────────────────────────┤
│ P2: WORKFLOW & UX    │ • Mobile Inventory Default List View                 │
│                      │ • Contextual Product Dossier Quick Actions           │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ P3: IMAGERY & POLISH │ • Real Product Thumbnails & 6-Tier Image Hierarchy   │
│                      │ • Open Food Facts Integration & Attribution          │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ CROSS-CUTTING QA     │ • Real-World Usage QA & 8-Part Regression Test Suite │
│                      │ • Consumer vs. Business Parity Enforcement           │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

### Phase Breakdown

| Priority | Feature / Module | Focus Area | Status | Spec Document |
| :--- | :--- | :--- | :---: | :--- |
| **P0** | **Fractional Quantities & DB Parity** | Database integrity, decimal subtraction, unit categorisation | 🟢 Completed | [`01-Fractional-Quantities-And-Database-Parity.md`](./01-Fractional-Quantities-And-Database-Parity.md) |
| **P1** | **Multi-View Product Understanding** | Multi-image aggregation, progressive camera capture, angle roles | 🟡 Queued | [`02-Multi-View-Product-Understanding.md`](./02-Multi-View-Product-Understanding.md) |
| **P1** | **Intelligent Missing Expiry Hierarchy** | 5-tier freshness hierarchy, AI-estimated shelf life with explicit labels | 🟡 Queued | [`03-Intelligent-Missing-Expiry-Hierarchy.md`](./03-Intelligent-Missing-Expiry-Hierarchy.md) |
| **P2** | **Mobile Inventory Default List View** | One-handed ergonomics, compact vertical scanning, grid toggle | 🟡 Queued | [`04-Mobile-Inventory-Default-List-View.md`](./04-Mobile-Inventory-Default-List-View.md) |
| **P2** | **Contextual Product Dossier Actions** | Contextual sheets for Add Stock, Move Category, Expiry Reminder | 🟡 Queued | [`05-Contextual-Product-Dossier-Actions.md`](./05-Contextual-Product-Dossier-Actions.md) |
| **P3** | **Real Product Thumbnails & Fallbacks** | 6-tier image priority, multi-angle thumbnails, OFF attribution | 🟡 Queued | [`06-Product-Thumbnails-And-Image-Hierarchy.md`](./06-Product-Thumbnails-And-Image-Hierarchy.md) |
| **QA** | **Real-World Usage QA & Regression** | Observed → Expected → Root Cause → Fix → Regression Tests | 🟡 Queued | [`07-Real-World-Usage-QA-And-Regression.md`](./07-Real-World-Usage-QA-And-Regression.md) |

---

## 3. Core Architectural Boundaries & Non-Negotiables

Every improvement in this cycle must strictly adhere to established platform invariants:

1. **Deterministic Authority**:
   Mathematical logic, unit conversion tables, database constraints, ownership boundaries, and FIFO queues always outrank AI predictions. AI never makes autonomous destructive decisions.
2. **Strict Recipe Isolation**:
   Commercial operations (`/business/dashboard`) strictly omit all recipe UI, endpoints, drawers, and tabs. Culinary AI in business environments is strictly restricted to commercial ingredient pairings and shrinkage prevention advisory.
3. **No Hidden Guesses**:
   Actual manufacturer expiry dates must never be presented as AI-generated, and AI-estimated dates must never pretend to be manufacturer truth. Estimated dates must carry explicit visual badges (`Estimated`), remain fully editable, and record their provenance.
4. **Permanent Database Schema Parity**:
   The production database (`@prisma/orm-postgres`) and development database must remain in lockstep. Schema drifts are prevented by version-controlled migration files; `prisma db push` and `prisma db reset` are strictly forbidden on production.
5. **Deferred Features Remain Deferred**:
   Barcode scanning remains deferred until a dedicated commercial UPC/EAN database integration is scheduled. No mock or half-baked barcode scanning UI may be introduced.
6. **Cinematic Landing Page Isolation**:
   The scroll-scrubbed hero video and dark-only marketing theme remain strictly isolated to `(marketing)/layout.tsx`. Authenticated workspace routes use the tactile, theme-switchable editorial workspace design system.

---

## 4. Consumer vs. Business Parity Matrix

| Feature | Consumer Household | Commercial Food Business | Parity Notes |
| :--- | :--- | :--- | :--- |
| **Fractional Quantities** | Supported across manual add, editing, quick consumption modal, and Cooking Mode. | Supported across manual add, editing, invoice upload, and batch waste logging. | Identical arithmetic and unit categorization rules (`isIntegerUnit`). |
| **Multi-View Understanding** | Used for consumer retail packages (front brand, back nutrition, side expiry). | Used for bulk commercial cartons, ingredient sacks, and crates. | Same multi-image extraction engine; business tags commercial SKU/lot if present. |
| **Intelligent Expiry** | Applies category-based shelf life (e.g. opened milk: 5 days, fresh bread: 3 days). | Applies commercial food safety storage guidelines and cold-chain heuristics. | Stricter margin buffers for commercial safety compliance. |
| **Mobile List View** | Default view on mobile viewports (<768px). Grid toggle preserved in user session. | Default view on mobile viewports (<768px). Grid toggle preserved in user session. | 100% structural parity; business displays batch/cost badges where configured. |
| **Contextual Dossier Actions** | Add More Stock, Move Category, Expiry Reminder (1d/2d/3d/1w/custom), Delete. | Add More Stock (with batch/cost), Move Category, Expiry Alert Threshold, Delete. | Contextual sheets replace generic redirects in both workspaces. |
| **Image Hierarchy** | User Photo → Multi-view Front → Cart Import → OFF → Stored → Emoji/Icon. | User Photo → Multi-view Front → Invoice Crop → OFF → Stored → Emoji/Icon. | Both workspaces prioritize high-fidelity primary thumbnails. |
| **Culinary Cooking Mode** | Enabled with step-by-step cooking and recipe deduction. | **DISABLED & PURGED**. No recipe routes, tabs, or buttons exist. | Hard architectural boundary. |

---

## 5. Execution Sequence

The planned sequence of implementation following documentation approval:

1. **Step 1 (P1-A)**: Implement Intelligent Missing Expiry Hierarchy & Provenance Tracking in extraction and manual forms.
2. **Step 2 (P1-B)**: Implement Multi-View Product Understanding (Upload & Progressive Camera capture with additive AI aggregation).
3. **Step 3 (P2-A)**: Implement Mobile Inventory Default List View with persistent layout switcher.
4. **Step 4 (P2-B)**: Implement Contextual Product Dossier Quick Action sheets (Add More Stock, Move Category, Specific Reminder, Safe Delete).
5. **Step 5 (P3)**: Implement Real Product Thumbnails, Multi-View angle association, and Open Food Facts fallback hierarchy.
6. **Step 6 (QA)**: Execute end-to-end regression validation against the 8 core real-world usage scenarios.
