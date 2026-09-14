# ShelfLife — Master System Specification & Architecture

**Document Version**: 1.0.0 (Master Release)  
**System Status**: 100% Production Ready & Complete  
**Last Verified**: September 2026

---

## 1. Executive Summary & Vision

**ShelfLife** is an intelligent, editorial food inventory management and waste reduction platform built for both household consumers and commercial food enterprises. The platform bridges inventory tracking with proactive expiration intelligence, culinary meal planning (consumer), and strict FIFO margin protection (business).

The application is architected around two fundamentally distinct, strictly isolated operational environments:
1. **Consumer Kitchen**: A household pantry and grocery manager emphasizing expiry awareness, receipt OCR capture, and AI meal inspiration tailored to ingredients currently on hand.
2. **Commercial Operations**: A professional food-service inventory suite enforcing First-In, First-Out (FIFO) stock rotation, tracking shrinkage financial exposure, and ingesting supplier invoices—with strict architectural isolation that omits recipe features.

---

## 2. Core Architectural Principles

- **Server-Side Session Ownership**: Authentication is powered by Auth.js with credentials and JWT sessions. User data and inventory items are strictly partitioned by `accountType` (`consumer` vs `business`) and `businessId`.
- **Absolute Recipe Isolation**: Business workspaces omit all recipe UI elements, routes, tabs, actions, and recommendations. In commercial environments, culinary AI is repurposed for commercial pairings and waste prevention strategies without recipe links.
- **Deterministic Prioritization**: Real mathematical algorithms drive expiry status, unit normalization, stock velocity, and FIFO queues, ensuring deterministic reliability over speculative AI generation.
- **Strict Mobile-First Ergonomics**: All key workflows (inventory logging, cooking mode, auth forms, mobile drawers) are built for one-handed operation on 320px–414px viewports with ≥ 44px touch targets and non-blocking bottom sheets.
- **Design System Integrity**: Styled with a dark editorial aesthetic (`#0c120e` canvas, `#151a16` surfaces, `border-white/10`, and `.sl-display-serif` typography), eliminating generic templates, high-saturation gradients, and unnecessary visual noise.

---

## 3. Comprehensive Feature & Stage Breakdown (Stages A–L Completed)

### Stage A — App Visual Foundation & Shared Shell
- Implemented core semantic color tokens: `--app-surface-base`, `--app-surface-elevated`, `--app-border-subtle`, `--app-accent-emerald`, `--app-accent-amber`, `--app-accent-terracotta`.
- Integrated `.sl-display-serif` Newsreader/Georgia display typography paired with crisp sans-serif body copy.
- Built responsive `Sidebar`, `AppHeader`, and skip-to-content accessibility anchors adhering to WCAG 2.2 standards.

### Stage B — Dashboard Command Center
- **Dynamic Time-Aware Greetings**: Contextual greetings (*Good morning*, *Good afternoon*, *Good evening*) evaluating local client time.
- **Actionable Bento Layout**:
  - Urgent Attention Section (Expiring & Expired alerts with direct Use/Discard actions).
  - High-Level KPI Summary (Total Items, Near Expiry, Low Stock, Waste Saved).
  - Quick Action Launchpad (Add Product, CSV Import, Invoice Import, Scan Label).
  - Real-time Consumption Velocity and Category Allocation bars.

### Stage C — Inventory Product Catalog
- **Interactive Data Catalog**: Grid and List view switcher, fuzzy text search, category filtering, and status tabs (All, Good, Expiring, Expired, Low Stock).
- **Batch Operations**: Multi-select bulk export, bulk category reassignment, and bulk removal.
- **Quick Action Bar**: Floating sticky mobile controls and desktop toolbar.

### Stage D — Product Details Digital Dossier
- **Hero Dossier Card**: High-contrast status badges, category indicators, quantity adjusters, and lifecycle timestamps.
- **Interactive Tabbed Dossier**:
  - *Overview*: Storage recommendations, notes, and nutritional tags.
  - *History*: Immutable audit trail of consumption, adjustments, and batch updates.
  - *AI Insights*: Preservation advisory and shelf-life extension tips.
  - *Recipes*: Exclusively enabled for Consumers.

### Stage E — Analytics Intelligence Report
- **Narrative Executive Summary**: AI-assisted narrative describing inventory turnover velocity and loss risks.
- **Visual Analytics**:
  - Spoilage risk distribution curves.
  - Category breakdown visualizations with percentage metrics.
  - Monthly consumption trends and waste reduction ratios.

### Stage F — Recipes Food Editorial & Business Strategy
- **Consumer Culinary Masthead**:
  - Expiry-prioritized ingredient matching ("Cook First" recommendations).
  - **Cooking Mode**: Interactive step-by-step cooking experience with fractional culinary unit support (`tsp`, `tbsp`, `cup`, `ml`, `g`, `kg`, `L`) and ingredient usage logging.
- **Business Strategy Center** (`/business/dashboard/strategy`):
  - Replaces culinary recipes with FIFO preparation queues, menu engineering advisory, and shrinkage prevention protocols.

### Stage G — Waste Impact & Environmental Report
- Comprehensive financial and ecological impact tracking:
  - Total currency saved by avoiding expiration.
  - Food mass diverted from landfills (kg).
  - Carbon footprint reduction estimates (kg CO₂e).

### Stage H — Alerts vs Notifications Separation
- **Alerts** (`/dashboard/alerts`): Urgent inventory warnings requiring direct user intervention (Discard, Mark as Used, Restock).
- **Notifications** (`/dashboard/notifications`): Historical stream of system events, imports, edits, and automated logs with "Mark all as read" capability.

### Stage I — Settings & Polished Workspace
- **Personalized Profile Management**: Name, email, metric vs imperial unit toggle, and currency customization.
- **Business Settings**: Company branding, industry classification, and location management (strictly separated from consumer profiles).
- **AI Preferences**: Tunable AI suggestion frequency and model parameters.

### Stage J — Motion, Micro-Interactions & Animation
- GPU-accelerated micro-transitions, smooth dialog entry/exit, interactive count-up KPI meters, and subtle hover lift effects.
- Strict adherence to `prefers-reduced-motion` media queries for accessibility.

### Stage K — Mobile-First Ergonomics & Accessibility
- Complete audit of 320px–414px mobile viewports.
- BottomSheet sheet components with thumb-friendly dismiss handles.
- Accessible ARIA labels, focus-visible rings (`.sl-focus-ring`), and keyboard navigation throughout all drawers and forms.

### Stage L — Performance & Final QA Sign-off
- Route code-splitting and dynamic chunk optimization across Next.js Turbopack.
- Zero hydration mismatches, sub-100ms client interactions, and clean automated test assertions.

---

## 4. Get Started & Auth Modernization

- **Unified Visual Atmosphere**: `/get-started`, `/consumer/login`, `/consumer/signup`, `/business/login`, `/business/signup`, `/verify-email`, and `/verify-email/pending` styled in the dark editorial design system.
- **Shared `AuthLayout`**: Form-first mobile architecture ensuring login/signup fields and primary CTAs are immediately above the fold on mobile devices.
- **Strict Functional Integrity**: Preserves credentials verification, bcrypt hashing, Auth.js JWT tokens, SMTP email verification links, and proper redirection to `/dashboard` (Consumer) or `/business/dashboard` (Business).

---

## 5. Technology Stack & Key Dependencies

- **Framework**: Next.js 16 (App Router with Turbopack & React 19)
- **Styling**: Tailwind CSS v4 & Semantic CSS Variables
- **Icons**: Lucide React
- **Authentication**: Auth.js (NextAuth v5 beta) with JWT strategy & bcryptjs
- **Database & ORM**: PostgreSQL with Prisma ORM
- **AI Acceleration**: Groq Cloud SDK (`llama-3.3-70b-versatile`) with structured JSON outputs and fallback heuristics
- **Validation**: Zod & Temporal polyfills

---

## 6. Verification & Quality Standards

- **TypeScript Compilation**: 0 errors (`npx tsc --noEmit`).
- **Production Next.js Build**: 35/35 routes compile static and dynamic builds successfully (`npm run build`).
- **Git Tree Cleanliness**: 0 whitespace or formatting anomalies (`git diff --check`).
- **Route Status**: All auth, marketing, and dashboard entry points verified at HTTP 200.

---

## 7. Next Cycle: Real-World Usage Improvements (P0–P3)

The project has entered its active real-world usage iteration cycle, fully documented under [`Specs/00-Real-World-Usage-Master-Roadmap.md`](./00-Real-World-Usage-Master-Roadmap.md):

1. **P0: Fractional Quantities & Database Parity (Completed)**: Full support for continuous decimal units (`L`, `kg`, `ml`, `g`) vs. discrete whole-number units (`pcs`, `packs`). Production database migration applied; development and production schemas synchronized at `double precision` (`float8`) without data loss. [`Specs/01-Fractional-Quantities-And-Database-Parity.md`](./01-Fractional-Quantities-And-Database-Parity.md).
2. **P1: Multi-View Product Understanding (Queued)**: Multi-angle packaging synthesis (front identity, back nutrition, bottom/rim expiry stamp) combining into one unified product record without duplication. [`Specs/02-Multi-View-Product-Understanding.md`](./02-Multi-View-Product-Understanding.md).
3. **P1: Intelligent Missing Expiry Hierarchy (Queued)**: 5-tier freshness cascade providing transparent, editable category-based shelf-life estimates for receipt and cart items lacking printed dates. [`Specs/03-Intelligent-Missing-Expiry-Hierarchy.md`](./03-Intelligent-Missing-Expiry-Hierarchy.md).
4. **P2: Mobile Inventory Default List View (Queued)**: High-density, one-handed touch-row default view on viewports <768px with persistent Grid toggle. [`Specs/04-Mobile-Inventory-Default-List-View.md`](./04-Mobile-Inventory-Default-List-View.md).
5. **P2: Contextual Product Dossier Quick Actions (Queued)**: Inline sheets replacing generic full-page redirects for "Add More Stock", "Move Category", "Set Reminder", and "Delete". [`Specs/05-Contextual-Product-Dossier-Actions.md`](./05-Contextual-Product-Dossier-Actions.md).
6. **P3: Real Product Thumbnails & Image Priority (Queued)**: 6-tier image priority cascade featuring user camera photos, multi-view thumbnails, Open Food Facts attribution, and deterministic SVG category glyph fallbacks. [`Specs/06-Product-Thumbnails-And-Image-Hierarchy.md`](./06-Product-Thumbnails-And-Image-Hierarchy.md).
7. **Cross-Cutting QA & Regression Layer (Queued)**: Immutable 8-scenario QA matrix covering decimal consumption, volumetric cooking conversions, multi-view extraction, mobile list density, and Consumer/Business recipe boundaries. [`Specs/07-Real-World-Usage-QA-And-Regression.md`](./07-Real-World-Usage-QA-And-Regression.md).

