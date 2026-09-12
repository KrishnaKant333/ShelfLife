# ShelfLife Architecture (Post-1.0 Roadmap)

## 🏗️ Technology Stack

- **Framework**: Next.js 16.3.2 App Router, React 19, TypeScript, Tailwind CSS 4
- **Authentication**: Auth.js credentials with JWT sessions
- **Database & ORM**: PostgreSQL with Prisma-next migration graph
- **AI Intelligence**: Groq SDK (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`) with JSON schema enforcement
- **Styling Architecture**: Theme-aware CSS custom properties (`globals.css`) + Tailwind CSS utility classes

---

## 🎨 Dual Visual Architecture

ShelfLife enforces a deliberate architectural separation between public marketing and authenticated workspaces:

```
┌────────────────────────────────────────────────────────┐
│                   ShelfLife Platform                   │
├───────────────────────────┬────────────────────────────┤
│   Public Marketing Layer  │    Authenticated Workspace  │
│   "(marketing)" routes    │    "(dashboard)" & business│
├───────────────────────────┼────────────────────────────┤
│ • "Cinematic / Editorial" │ • "Editorial Productivity" │
│ • Scroll-Scrubbed Video   │ • Clear, Fast, Intelligent │
│ • Dark-Default Direction  │ • Light & Dark Themes      │
│ • Floating Capsule Nav    │ • Bento Command Center     │
│ • No Theme Toggle         │ • Digital Product Dossier  │
│ • Narrative Conversion    │ • Tactile Micro-Interactions│
└───────────────────────────┴────────────────────────────┘
```

1. **Marketing Landing Page (`src/app/(marketing)`)**:
   - Visual Metaphor: *"Cinematic / Editorial / Immersive"*.
   - Features: Top-level scroll-scrubbed background sequence (`CinematicBackground.tsx`), floating suspended capsule navbar, transparent marketing cards, dark-default art direction (theme toggle intentionally omitted to preserve art direction), and solid decoupled dark footer (`#0c120e`).
2. **Authenticated Application (`src/app/(dashboard)` & `src/app/(business)`)**:
   - Visual Metaphor: *"Editorial Productivity / Intelligent Workspace"*.
   - Features: Warm ivory/off-white light surfaces and rich charcoal dark surfaces, editorial serif display typography, tabular monospace numerals, bento-box command center, product dossier, food editorial recipes, and quiet activity feeds.
   - Strictly NO video backgrounds or cinematic scroll storytelling in authenticated views.

---

## 🛡️ Boundaries & Ownership

- **Server Components**: Load authenticated data directly from database helpers (`getInventory()`, `getBusinessInventory()`).
- **Server Actions**: Authenticate session, validate parameters with Zod, verify ownership, mutate database, and revalidate tag/path caches.
- **Client Components**: Handle user interactions, state bindings, local date evaluations, filters, modals, dynamic calculations, and micro-animations.

---

## 📊 Core Data Flows

1. **Manual Entry**: Form input -> Zod validation -> server action -> ownership check -> Prisma mutation.
2. **Invoice / Label AI Extraction**: Image upload/capture -> Groq AI extraction (`max_tokens: 4096`, `finish_reason` defensive guard) -> client preview review table -> dynamic intelligence stats calculation -> bulk insert.
3. **Dedicated Export Flow**: Dedicated export page (`/dashboard/inventory/export`) -> client status/category filter state -> live preview table -> CSV trigger or print-window PDF rendering.
4. **Recipe AI Flow**: Fetch owned inventory -> filter out expired items -> format prompt -> Groq AI call -> Zod validation -> render recipe cards.
5. **Dynamic Greetings**: Client component (`GreetingHeader`) -> evaluates `new Date().getHours()` on user's browser clock -> renders local greeting.

---

## 🧭 Queued Post-1.0 Redesign Roadmap (Stages A–L)

- **Stage A**: App Visual Foundation & Shared Shell (Prerequisite, Ready)
- **Stage B**: Dashboard Command Center
- **Stage C**: Inventory Product Catalog
- **Stage D**: Product Details Digital Dossier
- **Stage E**: Analytics Intelligence Report
- **Stage F**: Recipes Food Editorial Experience
- **Stage G**: Waste Impact & Environmental Report
- **Stage H**: Alerts vs Notifications Separation
- **Stage I**: Settings Polished Workspace
- **Stage J**: App Motion System & Micro-Interactions
- **Stage K**: Mobile-First Ergonomics & Accessibility Refinement
- **Stage L**: Performance & Final Visual QA Sign-off
