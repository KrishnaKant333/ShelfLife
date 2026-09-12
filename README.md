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

## 🧭 Authenticated UI/UX Redesign & Master Specification

The authenticated application and onboarding experiences have been redesigned and elevated under the design doctrine *"Editorial Productivity / Intelligent Workspace"*:

- **All Stages (Stages A through L)**: 🟢 **100% Completed, Verified & Built**
- **Master Specification**: [`ShelfLife-Final-Master-Specification.md`](specs/ShelfLife-Final-Master-Specification.md)
- **Ergonomics & Design**: Unified dark editorial palette (`#0c120e` canvas, `#151a16` surfaces, `border-white/10`), `.sl-display-serif` typography, 44px mobile touch targets, and full isolation between Consumer Kitchen and Commercial Operations.

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

1. **Authoritative Server Sessions**: Server-side session validation is mandatory. Never trust client-side user or business IDs.
2. **Deterministic Source of Truth**: Expiry dates, stock status, and FIFO calculations are strictly deterministic and override AI responses.
3. **Recipe Expiry Exclusion**: Expired items are strictly omitted from AI recipe prompts and recommendations.
4. **No Guessed Expiry Dates**: Missing or ambiguous expiry dates remain explicitly `Expiry not available` / `Not trackable`.
5. **Account Type Isolation**: Consumer (`/dashboard`) and Business (`/business/dashboard`) routes, databases, and states must remain completely isolated.
6. **Isolated Video Background**: The cinematic video background is strictly for the landing page; never inject it into authenticated workspace routes.
7. **Landing Theme Toggle**: Intentionally removed to preserve art direction.
