# ShelfLife Progress Tracker

**Current Version**: Post-1.0 Roadmap Planning Phase
**Status**:
- v1.0 Production Release: **100% Completed & Verified**
- Cinematic Marketing Landing Page: **100% Completed & Verified**
- Post-1.0 Authenticated UI/UX Redesign Roadmap: **Queued (Stage A Ready for Implementation)**

---

## 🚀 Completed Milestones

### 1. Cinematic Marketing Landing Page Milestone
- [x] Combined dual-clip cinematic sequence video (`public/videos/shelflife-cinematic-sequence.mp4`) with tight 0.5s keyframe GOP and audio strip.
- [x] Smooth scroll-controlled scrubbing (`CinematicBackground.tsx`) via lerp loop (`requestAnimationFrame`) with static poster fallbacks (`hero_poster.webp` / `hero_poster.jpg`) for reduced motion and mobile.
- [x] Floating suspended capsule navbar (`top-3 sm:top-4`) with scroll-aware glassmorphism.
- [x] Landing page art direction permanently locked to dark mode; landing theme toggle intentionally removed.
- [x] High-contrast pure white/emerald typography, transparent marketing cards, and decoupled solid dark footer (`#0c120e`).

### 2. ShelfLife v1.0 Production Release
- [x] **Production Build Checkpoint**: 100% clean Next.js build compilation & TypeScript validation (`npm run build`).
- [x] **Consumer & Business Workspace Isolation**: Auth.js credential sessions with strict server-side ownership checks.
- [x] **Dedicated Export Hub**: `/dashboard/inventory/export` & `/business/dashboard/inventory/export` with interactive status/category filters, live data preview table, instant CSV spreadsheet downloads, and printable PDF report formatting.
- [x] **Dynamic Invoice Intelligence Analysis**: Dynamic client-side calculation for *Detected*, *New Items*, *Existing*, and *Near Expiry / Expired* products that re-evaluates in real-time as users edit extracted invoice items.
- [x] **Invoice AI Token Scaling & Truncation Guard**: Increased Groq invoice extraction `max_tokens` from 1,000 to 4,096 (verified extracting all 22 products from high-res demo invoice), and introduced defensive `finish_reason === "length"` truncation detection to eliminate silent truncation.
- [x] **Scan Label AI & Camera Flow**: Camera stream attachment and label image upload powered by Groq AI with JSON validation safeguards (`reasoning_effort: "none"` tuning).
- [x] **Alerts vs Notifications Purpose Separation**:
  - *Alerts* (`/dashboard/alerts`): Actionable urgent inventory risks (Expiring, Expired, Low Stock with Discard & Use actions).
  - *Notifications* (`/dashboard/notifications`): Informational activity stream for imports, usage logs, and system events.
- [x] **Streamlined Action Toolbar**: Concise header toolbar featuring `Export`, `Import`, `+ Add Product`, and a tooltip-enabled icon-only `Delete Expired` bin button.
- [x] **Time-Accurate Dynamic Greetings**: Local browser time evaluation for *Good morning*, *Good afternoon*, *Good evening*, and *Good night*.
- [x] **Theme System & Atmospheric Visuals**: Dynamic mesh ambient background gradients, persistent Light/Dark/System themes for the app.
- [x] **Recipe AI Safety**: Deterministic filtering excluding expired inventory prior to AI recipe generation.
- [x] **Email Verification & Onboarding**: Strict email verification via SMTP token link with pending standby screen.

---

## 🧭 Queued Post-1.0 Authenticated UI/UX Redesign ("Editorial Productivity / Intelligent Workspace")

- [x] **Stage A — App Visual Foundation & Shared Shell** (🟢 **100% Completed & Verified**)
- [x] **Stage B — Dashboard Command Center** (🟢 **100% Completed & Verified**)
- [x] **Stage C — Inventory Product Catalog** (🟢 **100% Completed & Verified**)
- [x] **Stage D — Product Details Digital Dossier** (🟢 **100% Completed & Verified**)
- [x] **Stage E — Analytics Intelligence Report** (🟢 **100% Completed & Verified**)
- [x] **Stage F — Recipes Food Editorial & Business Strategy Overhaul** (🟢 **100% Completed & Verified**)
- [x] **Stage G — Waste Impact & Environmental Report** (🟢 **100% Completed & Verified**)
- [x] **Stage H — Alerts vs Notifications Separation** (🟢 **100% Completed & Verified**)
- [x] **Stage I — Settings Polished Workspace** (🟢 **100% Completed & Verified**)
- [x] **Stage J — App Motion & Micro-Interactions** (🟢 **100% Completed & Verified**)
- [x] **Stage K — Mobile-First Ergonomics & Accessibility** (🟢 **100% Completed & Verified**)
- [x] **Stage L — Performance & Final Visual QA** (🟢 **100% Completed & Verified**)
- [x] **Bug Fix — Business Recipe Isolation** (🟢 **100% Completed & Verified**):
  - Completely purged all recipe UI elements, tabs, buttons, links, and text from the Business workspace.
  - Omitted "Cook Recipes" action in `ProductDossierHero` when `isBusiness` is true.
  - Omitted "Recipes" tab and panel in `ProductDetailDrawer` for Business accounts (`availableTabs = ["Overview", "History", "AI Insights"]`).
  - Account-aware `AIFoodIntelligence`: replaces consumer recipe jump with commercial ingredient pairings without recipe links.
  - Account-aware `AIPreventionAdvisory`: redirects Business to `/business/dashboard/strategy` instead of dead recipes route.
  - Account-aware `Notifications`: routes Business system sync to `/business/dashboard/strategy` instead of `/recipes`.
  - Account-aware `Settings`: hides Recipe AI Engine section in `AIPreferencesTab` and tailors nav rail text for Business.
  - Retained full, rich recipe functionality for Consumers.
- [x] **Milestone — Consumer & Business Get Started + Login/Signup Visual & Mobile Modernization** (🟢 **100% Completed & Verified**):
  - Unified Get Started, Consumer Auth, Business Auth, and Email Verification into the signature dark editorial ShelfLife aesthetic (`#0c120e` canvas, `#151a16` surfaces, `border-white/10`, `.sl-display-serif` editorial typography).
  - Created shared responsive `AuthLayout` supporting desktop dual-column showcase panel and strict mobile form-first ergonomics (form above the fold, no unnecessary scrolling, 44px touch targets).
  - Preserved 100% of credentials auth, Auth.js JWT sessions, server action validations, email verification tokens, and account-type redirects (`/dashboard` vs `/business/dashboard`).
  - Purged obsolete CSS classes (`.auth-contrast-panel`) from `globals.css`.
  - Maintained clear separation between Consumer (kitchen, recipes, pantry) and Business (FIFO, cost analytics, supplier ingestion, zero recipes).
  - Upgraded `/get-started` with distinct editorial cards and responsive vertical grid instead of awkward mobile carousels.
  - Upgraded `/verify-email` and `/verify-email/pending` with reassuring dark editorial status cards and guidance.

---

## 🛡️ Core Architectural Principles

- Server-side session ownership is authoritative.
- Business workspaces strictly omit recipe functionality; recipes are exclusive to consumer households.
- Deterministic expiry, quantity normalization, and stock status override AI recommendations.
- Missing expiry remains explicitly unknown (`Expiry not available`).
- Barcode scanning is deferred and hidden from active entry flows.
- Marketing cinematic video background remains strictly isolated to marketing (`(marketing)/layout.tsx`).
- Landing page theme toggle remains removed.
- Authenticated app preserves dynamic Light and Dark mode options.
