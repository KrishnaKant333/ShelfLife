# ShelfLife Project Overview (Post-1.0 Roadmap)

## 📌 Product Summary

ShelfLife is a Next.js 16 application for consumers and commercial food businesses to manage inventory, track food freshness, reduce waste, and extract invoice/label data using AI. Deterministic application logic serves as the single source of truth, while AI assists with image extraction, recipe inspiration, and operational insights.

---

## 👥 Account Types & Isolation

- **Consumer**: Account data scoped to authenticated `userId` via `/dashboard` routes.
- **Business**: Account data scoped to `userId` and `businessId` via `/business/dashboard` routes.
- Server-side session checks guarantee strict data isolation between consumer and business accounts.

---

## 🎨 Design Philosophy & Evolution

- **Public Landing Page**: *"Cinematic / Editorial / Immersive"*
  A scroll-scrubbed hero pantry background sequence (`shelflife-cinematic-sequence.mp4`), floating capsule navigation, and dark-default artistic direction.
- **Authenticated Application**: *"Editorial Productivity / Intelligent Workspace"*
  An intelligence-driven workspace that feels mature, calm, and tactile:
  - **Dashboard**: *"Inventory Intelligence Command Center"*
  - **Inventory**: *"Premium Product Catalog"*
  - **Product Details**: *"Digital Product Dossier"*
  - **Analytics**: *"Inventory Intelligence Report"*
  - **Recipes**: *"Food Editorial Experience"*
  - **Waste**: *"Impact & Environmental Report"*
  - **Alerts vs Notifications**: Urgent actionable safeguards vs quiet informational activity feed.
  - **Settings**: Mature, calm, production-grade workspace controls.

---

## 🛠️ Current Implemented Capabilities

1. **Cinematic Landing Page**: Scroll-controlled sequence video, floating capsule navbar, transparent cards, decoupled solid dark footer.
2. **Inventory Management**: CRUD operations, search, status filtering (*Fresh*, *Expiring*, *Expired*, *Low Stock*), and multi-field sorting.
3. **Dedicated Export Hub**: `/dashboard/inventory/export` & `/business/dashboard/inventory/export` with live preview, CSV, and printable PDF.
4. **Dynamic Invoice Intelligence Analysis**: AI-assisted invoice parsing with real-time stat recalculation.
5. **Scan Label AI & Camera Capture**: Live camera capture or image upload with Groq AI extraction (`llama-3.3-70b-versatile`).
6. **Alerts vs Notifications**: Urgent risks on `/dashboard/alerts` vs informational activity stream on `/dashboard/notifications`.
7. **Dynamic Greetings**: Local browser time-based greetings (*Good morning*, *Good afternoon*, *Good evening*, *Good night*).
8. **Recipe AI Generator**: Strict pre-prompt exclusion of expired ingredients.

---

## 🧭 Roadmap History & Active Real-World Usage Cycle

### Completed Milestones
- **Cinematic Marketing Landing Page**: 100% Completed & Verified.
- **Stages A–L Workspace Redesign**: 100% Completed, Verified & Built.
- **Business Recipe Isolation**: 100% Purged from commercial workspace; recipes exclusive to Consumer.
- **Get Started & Auth Modernization**: 100% Completed across `/get-started`, login, signup, verify email.
- **P0: Fractional Quantities & Database Parity**: 100% Completed. Production and development databases synchronized on `float8` (`double precision`).

### Active Cycle: Real-World Usage Improvements (P0–P3)
1. **P0 Foundation (Completed)**: Continuous decimal vs. discrete integer arithmetic; strict production schema parity.
2. **P1 Product Understanding (Queued)**: Multi-view packaging synthesis (front, back, bottom) and 5-tier intelligent missing expiry hierarchy.
3. **P2 UX & Workflow Improvements (Queued)**: Mobile default list view (<768px) and contextual product dossier quick action sheets.
4. **P3 Imagery & Polish (Queued)**: 6-tier authentic image hierarchy with Open Food Facts integration and deterministic SVG glyph fallbacks.
5. **Cross-Cutting QA (Queued)**: 8-scenario real-world regression matrix.

---

## 🔒 Safety & Architectural Invariants

- Session-based ownership validation on every server action.
- Expiry status is deterministic; AI estimates are visibly labeled `Estimated` and editable.
- Expired products are strictly excluded from AI recipe generation (Consumer only).
- Business workspaces strictly omit all recipe routes, buttons, drawers, and tabs.
- Barcode scanning remains deferred and hidden from active workflows.
- No production database changes via `db push` or `reset`; migrations must be versioned.
- The cinematic landing video background remains strictly isolated from authenticated workspaces.

