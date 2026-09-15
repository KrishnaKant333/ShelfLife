# ShelfLife: Next Implementation Task

**Current Phase**: Real-World Usage Improvements (Post-v1.0 Cycle)  
**Active Milestone Status**: **P0 (Fractional Quantities & DB Parity)**, **P1-A (Multi-View Product Understanding)**, and **P1-B (Intelligent Missing Expiry Hierarchy)** are 100% Completed & Verified.  
**Next Ready Task**: **P2-A — Mobile Inventory Default List View (Spec 04)**

---

## 🎯 Recommended Next Immediate Step: P2-A (Mobile Inventory Default List View)

### Why Prioritize P2-A Next:
On mobile devices (<768px), modern pantry management requires rapid one-handed scrolling and visual scanning. The current 2-column card grid forces excessive scrolling and hides status indicators. Implementing a dedicated 68px compact touch-row list view with a persistent Grid ↔ List toggle optimizes ergonomics for on-the-go household and commercial inventory checks.

### Objectives for P2-A:
1. Viewport-aware layout defaulting to high-density 68px touch rows on mobile screens (<768px).
2. Persistent Grid ↔ List switcher with `localStorage` preference memory.
3. Displays thumbnail, title, remaining quantity, and countdown status chip above the fold for 7–8 items.
4. Maintain Consumer and Business inventory catalog parity.

---

## 📋 Completed Preceding Steps:
- [x] **P0**: Fractional quantities & database parity (continuous units support decimals, production DB migrated).
- [x] **P1-A**: Multi-view product understanding (1–4 images synthesized into one product record, progressive camera viewfinder with continuous snapping, digital dossier carousel).
- [x] **P1-A Persistent Storage**: Migrated product image storage to Vercel Blob persistent object storage with local filesystem fallback for development; eliminated corrupt base64 fallbacks; preserved images across product edits.
- [x] **P1-A Image Lifecycle & Orphan Cleanup**: Complete storage deletion abstraction (`deleteProductImage`/`deleteProductImages`), dual Blob/local dispatch, external image protection (Open Food Facts shielded), reference-aware shared asset protection, review/cancel/AI-failure/creation-failure cleanup, and deliberate zero-quantity image preservation. Tested 29/29 assertions passed across local filesystem and live Vercel Blob.

---

## ⚠️ Non-Negotiable Instructions for the Implementing Agent:
- Do NOT modify production database directly via `db push`.
- Do NOT introduce recipes into `/business/dashboard`.
- Keep continuous vs discrete unit discipline (`isIntegerUnit`).
- Run `npx tsc --noEmit` and `npm run build` after completing any phase.
