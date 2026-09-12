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

## 🧭 Queued Post-1.0 Roadmap (Stages A–L)

1. **Stage A**: App Visual Foundation & Shared Shell (Prerequisite, Ready)
2. **Stage B**: Dashboard Command Center
3. **Stage C**: Inventory Product Catalog
4. **Stage D**: Product Details Digital Dossier
5. **Stage E**: Analytics Intelligence Report
6. **Stage F**: Recipes Food Editorial Experience
7. **Stage G**: Waste Impact & Environmental Report
8. **Stage H**: Alerts vs Notifications Separation
9. **Stage I**: Settings Polished Workspace
10. **Stage J**: App Motion System & Micro-Interactions
11. **Stage K**: Mobile-First Ergonomics & Accessibility Refinement
12. **Stage L**: Performance & Final Visual QA Sign-off

---

## 🔒 Safety Principles

- Session-based ownership validation on every server action.
- Expiry status is deterministic.
- Expired products are never sent to AI recipe generation.
- Missing expiry remains explicitly `Expiry not available`.
- Barcode scanning remains deferred/hidden.
- No application code or UI was modified during this planning pass.
