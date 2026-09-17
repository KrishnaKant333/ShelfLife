# ShelfLife Project Overview (Master Release)

## 📌 Product Summary

ShelfLife is a Next.js 16 application for consumers and commercial food businesses to manage inventory, track food freshness, reduce waste, and extract invoice/label data using AI. Deterministic application logic serves as the single source of truth, while AI assists with image extraction, recipe inspiration, and operational insights.

---

## 👥 Account Types & Isolation

- **Consumer**: Account data scoped to authenticated `userId` via `/dashboard` routes. Includes culinary meal planning, expiry-prioritized recipe generation, and interactive cooking mode.
- **Business**: Account data scoped to `userId` and `businessId` via `/business/dashboard` routes. Strictly enforces recipe isolation, FIFO stock rotation, supplier invoice parsing, and shrinkage financial reporting.
- Server-side session checks guarantee strict data and route isolation between consumer and business accounts.

---

## 🎨 Design Philosophy & Architecture

- **Public Landing Page**: *"Cinematic / Editorial / Immersive"*
  A scroll-scrubbed hero pantry background sequence (`shelflife-cinematic-sequence.mp4`), floating capsule navigation, and dark-default artistic direction.
- **Authenticated Application**: *"Editorial Productivity / Intelligent Workspace"*
  An intelligence-driven workspace that feels mature, calm, and tactile:
  - **Dashboard**: *"Inventory Intelligence Command Center"*
  - **Inventory**: *"Premium Product Catalog"* (with viewport-aware high-density mobile list view)
  - **Product Details**: *"Digital Product Dossier"* (with contextual in-place quick action sheets)
  - **Analytics**: *"Inventory Intelligence Report"*
  - **Recipes**: *"Food Editorial Experience"* (Consumer only)
  - **Business Strategy**: *"FIFO & Operations Intelligence"* (Commercial only)
  - **Waste**: *"Impact & Environmental Report"*
  - **Alerts vs Notifications**: Urgent actionable safeguards vs quiet informational activity feed.
  - **Settings**: Mature, calm, production-grade workspace controls.

---

## 🛠️ Complete Feature Suite

1. **Cinematic Landing Page**: Scroll-controlled sequence video, floating capsule navbar, transparent cards, decoupled solid dark footer.
2. **Inventory Management**: CRUD operations, search, status filtering (*Fresh*, *Expiring*, *Expired*, *Low Stock*), and multi-field sorting.
3. **Continuous Fractional Units**: Full support for decimal quantities (`0.25 L`, `1.5 kg`) on continuous units with 4-decimal precision and PostgreSQL `float8` parity.
4. **Multi-View Product Understanding**: 1–4 packaging angle intake (Front, Back, Expiry) synthesized into 1 unified record via Groq vision, backed by Vercel Blob persistent object storage and complete orphan cleanup.
5. **Intelligent 5-Tier Freshness Cascade**: Automatically infers USDA category shelf-life estimates for items lacking printed dates, badged with transparent `Estimated ✦` badges.
6. **Mobile High-Density List View**: Defaults to 68px touch rows on viewports <768px with persistent `localStorage` Grid/List toggle.
7. **Contextual Product Dossier Quick Actions**: In-place slide sheets for Restock ($Current + Added = Total$), Category migration, Expiry Reminders, and Safe Deletion with 5-second undo toast.
8. **Real Product Thumbnails (6-Tier Hierarchy)**: Real product imagery with Open Food Facts global database lookup (2.5s strict timeout), ODbL attribution, shimmer loading states, and SVG category glyph fallbacks.
9. **Dedicated Export Hub**: `/dashboard/inventory/export` & `/business/dashboard/inventory/export` with live preview, CSV, and printable PDF including product thumbnails.
10. **Dynamic Invoice Intelligence Analysis**: AI-assisted invoice parsing with real-time stat recalculation and sensory check warnings for commercial kitchens.
11. **Scan Label AI & Camera Capture**: Live camera capture or multi-image upload with Groq AI extraction (`llama-3.3-70b-versatile` & `qwen/qwen3.6-27b`).
12. **Alerts vs Notifications**: Urgent risks on `/dashboard/alerts` vs informational activity stream on `/dashboard/notifications`.
13. **Recipe Safety Engine**: Strictly filters out expired items before passing ingredients to Groq AI for recipe generation (Consumer only).

---

## 🧭 Milestone & Roadmap History

- **Cinematic Marketing Landing Page**: 100% Completed & Verified.
- **Stages A–L Authenticated Workspace Redesign**: 100% Completed, Verified & Built.
- **Business Recipe Isolation**: 100% Completed; commercial workspaces strictly omit recipes.
- **Get Started & Auth Modernization**: 100% Completed across `/get-started`, login, signup, verify email.
- **Cycle P0 (Fractional Quantities & DB Parity)**: 100% Completed. `float8` parity verified.
- **Cycle P1 (Multi-View Synthesis & 5-Tier Freshness)**: 100% Completed & Verified.
- **Cycle P2 (Mobile List View & Contextual Quick Actions)**: 100% Completed & Verified.
- **Cycle P3 (Real Product Thumbnails & Open Food Facts)**: 100% Completed & Verified.
- **Spec 07 Cross-Cutting QA & Regression Matrix**: 100% Completed & Verified (8/8 scenarios passed).
- **Master Specification Consolidation**: Superseded Specs 00–07 into authoritative master document.

---

## 🔒 Safety & Architectural Invariants

- Session-based ownership validation on every server action.
- Expiry status is deterministic; AI estimates are visibly labeled `Estimated` and editable.
- Expired products are strictly excluded from AI recipe generation (Consumer only).
- Business workspaces strictly omit all recipe routes, buttons, drawers, and tabs.
- Barcode scanning remains deferred and hidden from active workflows.
- No production database changes via `db push` or `reset`; migrations must be versioned.
- The cinematic landing video background remains strictly isolated from authenticated workspaces.
