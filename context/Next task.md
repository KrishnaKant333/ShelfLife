# ShelfLife: Next Implementation Task

**Current Phase**: Real-World Usage Improvements (Post-v1.0 Cycle)  
**Active Milestone Status**: **P0 (Fractional Quantities & DB Parity)** and **P1-A (Multi-View Product Understanding)** are 100% Completed & Verified.  
**Next Ready Task**: **P1-B — Intelligent Missing Expiry Hierarchy (Spec 03)**

---

## 🎯 Recommended Next Immediate Step: P1-B (Intelligent Missing Expiry)

### Why Prioritize P1-B Next:
The missing expiry bottleneck directly impacts everyday receipt, invoice, and grocery delivery cart imports. Enabling Tier 4 category-based estimates and Tier 5 unknown dates immediately unblocks bulk cataloging without waiting for camera hardware changes.

### Objectives for P1-B:
1. Update `InvoiceImport.tsx` and `BusinessInvoiceUpload.tsx` to remove the hard blocking error requiring an expiry date for every product.
2. Introduce the 5-tier freshness hierarchy in `src/lib/inventory.ts` / `normalization.ts`.
3. Auto-populate category-based default shelf life for items lacking printed dates (e.g. Bread: +4 days, Bananas: +5 days, Milk: +7 days).
4. Display the visual `Estimated ✦` badge with full manual override capability in review tables and product dossiers.
5. Filter out invoice billing, order, and delivery timestamps from being mistaken for expiration dates.

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
