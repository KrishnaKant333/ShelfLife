# ShelfLife (v1.0 Production Release & Post-1.0 Roadmap)

ShelfLife is an AI-powered food inventory intelligence platform built with Next.js 16 for consumers and commercial food businesses. It combines deterministic inventory, expiry, ownership, stock quantity, FIFO, waste analytics, and recipe-safety logic with AI-assisted extraction and recommendations.

---

## 🌟 Visual Architecture & Brand Doctrine

ShelfLife features a deliberate dual visual identity:

- **Public Marketing Layer**: *"Cinematic / Editorial / Immersive"*
  A scroll-controlled video narrative sequence (`shelflife-cinematic-sequence.mp4`), floating suspended capsule navbar, and dark-default artistic direction.
- **Authenticated Application**: *"Editorial Productivity / Intelligent Workspace"*
  A mature, tactile, high-density intelligence workspace featuring warm editorial typography, bento-box command centers, digital product dossiers, and clear activity streams. (The cinematic video background is strictly excluded from authenticated views).

---

## 🚀 Key Implemented Features

- **Consumer & Business Workspaces**: Auth.js credentials sessions with isolated dashboard routes (`/dashboard` and `/business/dashboard`) and server-side ownership enforcement.
- **Dynamic Inventory Intelligence**: Real-time tracking for *Fresh*, *Expiring Soon*, *Expired*, and *Low Stock* items with unit normalization across weight, volume, and count.
- **Dedicated Export Hub**: Dedicated page (`/dashboard/inventory/export` & `/business/dashboard/inventory/export`) with interactive status & category filters, live data preview, instant CSV spreadsheet downloads, and printable PDF report generation.
- **Dynamic Invoice Intelligence Analysis**: AI-powered invoice extraction with real-time dynamic calculation for *Detected*, *New Items*, *Existing*, and *Near Expiry / Expired* products.
- **Scan Label AI & Camera Capture**: Live camera capture or image file upload with Groq AI extraction for instant ingredient and date entry.
- **Alerts vs. Notifications Separation**:
  - **Alerts** (`/dashboard/alerts`): Actionable urgent inventory risks (Expiring, Expired, Low Stock with quick Discard & Use actions).
  - **Notifications** (`/dashboard/notifications`): Informational activity log feed for imports, updates, and system events.
- **Streamlined Action Toolbar**: Clean top header toolbar featuring `Export`, `Import`, `+ Add Product`, and a tooltip-enabled icon-only `Delete Expired` bin button.
- **Time-Accurate Dynamic Greetings**: Automatically displays local browser time-based greetings (*Good morning*, *Good afternoon*, *Good evening*, *Good night*).
- **Safety-First Recipe AI Generator**: Strictly filters out expired items before passing ingredients to Groq AI for recipe generation.

---

## 🧭 Specifications & Active Roadmap

ShelfLife is engineered using a structured **Context & Specification** architecture (`Context/` and `Specs/`):

- **Master System Specification**: [`Specs/ShelfLife-Final-Master-Specification.md`](specs/ShelfLife-Final-Master-Specification.md)
- **Active Improvement Roadmap**: [`Specs/00-Real-World-Usage-Master-Roadmap.md`](specs/00-Real-World-Usage-Master-Roadmap.md)

### Improvement Cycle Status (P0–P3):
1. **P0: Fractional Quantities & Database Parity (🟢 Completed)**:
   - Synchronized `inventoryConsumption.quantityUsed` to `float8` (`double precision`) across development and production databases.
   - Enforced continuous decimal units (`L`, `kg`, `ml`, `g`) vs. discrete integer units (`pcs`, `pack`).
2. **P1: Multi-View Product Understanding (🟡 Queued / Spec Ready)**:
   - Captures and merges Front, Back, and Expiry packaging panels into a single consolidated record.
3. **P1: Intelligent Missing Expiry Hierarchy (🟡 Queued / Spec Ready)**:
   - 5-tier freshness cascade providing transparent, editable category-based shelf-life estimates for items lacking printed dates.
4. **P2: Mobile Inventory Default List View (🟡 Queued / Spec Ready)**:
   - Purpose-built high-density touch-row layout defaulting on mobile (<768px) with persistent Grid toggle.
5. **P2: Contextual Product Dossier Quick Actions (🟡 Queued / Spec Ready)**:
   - Immediate contextual sub-sheets for Add Stock, Move Category, Expiry Reminders, and Safe Deletion.
6. **P3: Real Product Thumbnails & Image Priority (🟡 Queued / Spec Ready)**:
   - 6-tier image priority cascade with Open Food Facts open-data imagery and clean SVG fallbacks.
7. **Cross-Cutting QA & Regression Matrix (🟡 Queued / Spec Ready)**:
   - Immutable 8-scenario QA matrix verifying real-world pantry and commercial kitchen flows.


---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.3.2 App Router (React 19 & TypeScript)
- **Styling**: Vanilla CSS & Tailwind CSS 4 with custom CSS variables design system
- **Authentication**: Auth.js (JWT credentials sessions with server-side ownership)
- **Database & ORM**: PostgreSQL with Prisma-next migration graph
- **AI Intelligence**: Groq SDK (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`) with JSON schema enforcement
- **Icons & UI Primitives**: Lucide React icons, accessible modals, and toast notifications

---

## 🚀 Quick Start & Development

### 1. Installation

```bash
npm install
```

### 2. Run Local Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Build for Production

```bash
npm run build
```

---

## ⚙️ Environment Variables

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="gsk_..."
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="ShelfLife <no-reply@shelflife.app>"
AUTH_TRUST_HOST=true
```

---

## 🔒 Security & Engineering Rules

1. **Authoritative Server Sessions**: Server-side session validation is mandatory on every server action. Never trust client-side user or business IDs.
2. **Permanent Schema Parity**: Development and production databases must remain in 100% lockstep (`float8` for `quantityUsed` and `quantity`). Never use `prisma db push` or `prisma db reset` against production; all migrations must be versioned.
3. **Continuous vs. Discrete Units**: Continuous units (`L`, `kg`, `ml`, `g`) accept decimals (`min="0.0001"`, `step="any"`). Discrete units (`pcs`, `pack`, `bottle`) enforce integers (`min="1"`, `step="1"`). Never use `parseInt` on continuous goods.
4. **Deterministic Source of Truth**: Real dates, stock quantities, and FIFO queues are strictly deterministic and override AI responses.
5. **5-Tier Expiry Discipline**: AI-estimated freshness dates must be explicitly labeled `Estimated ✦`, editable, and never passed off as manufacturer truth.
6. **Strict Business Recipe Isolation**: Business workspaces (`/business/dashboard`) strictly omit all recipe UI, endpoints, tabs, and buttons; recipes are exclusive to consumer households.
7. **Authentic Product Imagery**: Adhere to the 6-tier image priority cascade. Never scrape or inject random stock photos.
8. **Deferred Features**: Barcode scanning remains deferred and hidden until a dedicated commercial EAN/UPC database integration is scheduled.
9. **Isolated Video Background**: The cinematic video background is strictly for the landing page; never inject it into authenticated workspace routes.
10. **Landing Theme Toggle**: Intentionally removed to preserve marketing art direction; authenticated workspaces support dynamic Light and Dark modes.

