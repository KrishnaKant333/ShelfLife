# ShelfLife Architecture (v1.0 Production Release)

## 🏗️ Technology Stack

- **Framework**: Next.js 16.3.2 App Router, React 19, TypeScript, Tailwind CSS 4
- **Authentication**: Auth.js credentials with JWT sessions
- **Database & ORM**: PostgreSQL with Prisma-next migration graph
- **AI Intelligence**: Groq SDK (`llama-3.3-70b-versatile` & `llama-3.1-8b-instant`) with JSON schema enforcement

## 🛡️ Boundaries & Ownership

- **Server Components**: Load authenticated data directly from database helpers (`getInventory()`, `getBusinessInventory()`).
- **Server Actions**: Authenticate session, validate parameters with Zod, verify ownership, mutate database, and revalidate tag/path caches.
- **Client Components**: Handle user interactions, state bindings, local date evaluations, filters, modals, and dynamic calculations (e.g. `ExportInventoryView`, `GreetingHeader`, `InvoiceImport`).

## 📊 Core Data Flows

1. **Manual Entry**: Form input -> Zod validation -> server action -> ownership check -> Prisma mutation.
2. **Invoice / Label AI Extraction**: Image upload/capture -> Groq AI extraction (`reasoning_effort: "none"`) -> client preview review table -> dynamic intelligence stats calculation -> bulk insert.
3. **Dedicated Export Flow**: Dedicated export page (`/dashboard/inventory/export`) -> client status/category filter state -> live preview table -> CSV trigger or print-window PDF rendering.
4. **Recipe AI Flow**: Fetch owned inventory -> filter out expired items -> format prompt -> Groq AI call -> Zod validation -> render recipe cards.
5. **Dynamic Greetings**: Client component (`GreetingHeader`) -> evaluates `new Date().getHours()` on user's browser clock -> renders local greeting.

## 🎨 UI Architecture & Aesthetics

- Theme-aware CSS variable design system supporting Light, Dark, and System modes.
- Ambient mesh background gradients (`.sl-ambient-mesh`, `.sl-mesh-subtle`).
- Micro-animations (`.hover-lift`, `.pulse-glow`) for elevated interactivity.
- Atmospheric scroll fog isolated strictly to `src/app/(marketing)/layout.tsx`.
