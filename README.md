# ShelfLife (v1.0 Production Release)

ShelfLife is an AI-powered food inventory intelligence application built with Next.js 16 for consumers and commercial food businesses. It combines deterministic inventory, expiry, ownership, stock quantity, FIFO, waste analytics, and recipe-safety logic with AI-assisted extraction and recommendations.

---

## 🌟 Key Features in v1.0 Production Release

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
- **Ambient UI Design System**: Persistent Light, Dark, and System theme support with dynamic mesh gradients, smooth micro-animations (`.hover-lift`, `.pulse-glow`), and marketing-isolated atmospheric fog effects.

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

## ⚙️ Environment Variables & Deployment Runbook

Configure the following variables in `.env.local` or hosting platform settings:

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

### Prisma Production Migrations

Run from the root directory with `DATABASE_URL` configured:

```bash
npx prisma migration check
npx prisma migration status
npx prisma db migrate
```

---

## 🔒 Security & Engineering Rules

1. **Authoritative Server Sessions**: Server-side session validation is mandatory. Never trust client-side user or business IDs.
2. **Deterministic Source of Truth**: Expiry dates, stock status, and FIFO calculations are strictly deterministic and override AI responses.
3. **Recipe Expiry Exclusion**: Expired items are strictly omitted from AI recipe prompts and recommendations.
4. **No Guessed Expiry Dates**: Missing or ambiguous expiry dates remain explicitly `Expiry not available` / `Not trackable`.
5. **Account Type Isolation**: Consumer (`/dashboard`) and Business (`/business/dashboard`) routes, databases, and states must remain completely isolated.
