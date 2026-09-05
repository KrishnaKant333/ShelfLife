# ShelfLife

ShelfLife is a Next.js food-inventory intelligence application for consumers and food businesses. It combines deterministic inventory, expiry, ownership, quantity, FIFO, waste, and recipe-safety logic with AI-assisted extraction and recommendations.

## Current implementation

- Consumer and Business authentication with isolated dashboard routes.
- Auth.js credentials sessions and server-side ownership checks.
- Inventory CRUD, search, filtering, sorting, bulk delete, consumption recording, CSV/PDF export.
- Manual, label, CSV, and invoice inventory entry flows.
- Deterministic Expired, Expiring, Fresh, and Low Stock status logic.
- Weight, volume, and count normalization for supported units.
- Alerts, analytics, waste insights, FIFO and Business Inventory Strategy.
- Groq-powered invoice/label extraction, ShelfLife Brief, and consumer recipe modes.
- Barcode scanning is currently deferred and hidden from the Add New Product flow; existing inventory data structures remain unchanged for future reintroduction.
- Expired inventory is filtered before recipe generation and returned recipes are validated.
- Light, Dark, and System themes with persisted theme selection.
- Responsive shared dashboard shell and loading/feedback UI in the existing implemented areas.
- Final P2 audit polish: accessible confirmation dialogs, pending/error feedback for destructive actions, activity-load error states, theme-safe consumer forms, server-side consumption quantity validation, and baseline Open Graph/Twitter metadata.

## Known gaps at the start of the current roadmap

- Expired items can now be discarded through an ownership-safe confirmed action in both inventory dashboards; historical discard records are still part of P1.
- Inventory expiry is nullable and missing dates are displayed as `Expiry not available` / `Not trackable`.
- Unit normalization supports broader aliases, decimal quantities, compatible conversions, and explicit incompatible-unit handling.
- AI/import/label flows derive expiry only from reliable evidence and never invent a date.
- Email verification now sends a real email after signup, shows a standby pending page, and only signs the user in after the emailed token is clicked. Signup is blocked when SMTP is unavailable; there is no local verification bypass.
- The ordered P1 workflow is implemented: collapsible sidebar, mutually exclusive List/Grid view, ownership-scoped detail routes, product image field with default icons, activity records, consumption/discard quantities, sorting, and a top-right notification bell.
- The new nullable-expiry, image, verification, and activity fields require the corresponding Prisma-next migrations to be applied to the deployment database.

## Routes

Consumer: `/consumer/login`, `/consumer/signup`, `/dashboard`

Business: `/business/login`, `/business/signup`, `/business/dashboard`

## Technology

- Next.js 16.3.2 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Auth.js credentials authentication
- PostgreSQL with Prisma-next
- Groq SDK
- Zod validation

## Development

```bash
npm install
npm run dev
npm run lint
npm run build
```

The production build is the required checkpoint after each major phase.

The current contract migration is applied to the configured Neon database. Production hosting must configure the variables listed in `.env.example`: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `GROQ_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM`. For Gmail, use a Google App Password rather than the normal account password. `AUTH_TRUST_HOST=true` is only needed when the hosting platform is behind a reverse proxy and Auth.js reports `UntrustedHost`.

### Production migration runbook

From the repository root, with the production Neon connection supplied through `DATABASE_URL`:

```bash
npx prisma migration check
npx prisma migration status
npx prisma db migrate --show
npx prisma db migrate
```

`migration check` validates the committed migration graph offline. `migration status` verifies the database marker and pending path. `db migrate --show` previews the route, and `db migrate` applies pending migrations only. The verified current Neon database reports `Up to date` with `20260904T2310_roadmap_p0_p1_from_applied` applied.

## Safety and engineering rules

- Server-side session ownership is authoritative. Never trust user or business IDs from the browser.
- Deterministic expiry, quantity, stock, and FIFO logic is authoritative over AI output.
- Expired products must never be sent to recipe generation or presented as usable ingredients.
- Missing or ambiguous expiry data must never be invented.
- Consumer and Business data and routes must remain isolated.
- Reuse shared components and existing actions before adding new abstractions.

## Ordered roadmap

### P0

1. [x] Discard all expired items.
2. [x] Complete quantity/unit normalization and robust incompatible-unit handling.
3. [x] Handle ambiguous or missing expiry information in AI, import, and label flows.
4. [x] Add email verification.

### P1

5. [x] Add a collapsible dashboard sidebar with hamburger/mobile navigation and icons-only collapsed mode.
6. [x] Add Inventory List/Grid view toggle.
7. [x] Make inventory items clickable with dedicated product detail pages.
8. [x] Add product image field with sensible default icons.
9. [x] Add inventory history/activity tracking.
10. [x] Add product consumption/discard history and quantity summaries.
11. [x] Add inventory sorting for expiry, quantity, name, and recently added alongside existing search/filter.
12. [x] Add a top-right notification center for expiry, low-stock, and waste alerts.

### P2

13. [x] Continue remaining UI/UX polish and consistency work identified by the existing specs.
14. [x] Final production-readiness audit across Consumer, Business, auth, inventory, analytics, recipes, waste, settings, import/export, and landing routes.

Features not listed as implemented must remain labelled as incomplete or Coming Soon.

## UI redesign plan

The next phase is a staged visual and UX redesign from functional MVP polish toward a premium SaaS product. Stages 0 through 9 are complete, and Stage 10 advanced motion, scroll storytelling, and selective 3D is next. Stage 9 completed transparent AI advisory labeling, live generation/error status, recipe mode semantics, safe recipe consumption dialogs, and mobile waste actions without changing safety or authority boundaries. Completion reports are available for [Stage 4](specs/UI%20redesign%20stage%204%20report.md), [Stage 5](specs/UI%20redesign%20stage%205%20report.md), [Stage 6](specs/UI%20redesign%20stage%206%20report.md), [Stage 7](specs/UI%20redesign%20stage%207%20report.md), [Stage 8](specs/UI%20redesign%20stage%208%20report.md), and [Stage 9](specs/UI%20redesign%20stage%209%20report.md). See [specs/UI redesign roadmap.md](specs/UI%20redesign%20roadmap.md) and the Stage 0-12 specifications for the dependency order.

The redesign prioritizes a reusable design system, intentional light/dark themes, expressive marketing, restrained productivity dashboards, mobile-first task flows, accessible motion, and performance. It does not change business logic or architecture, and barcode scanning remains deferred/hidden.

## Final audit status (2026-09-05)

Audited route protection, account-type isolation, ownership checks, responsive layouts, Light/Dark/System theme tokens, async actions, empty/error states, form validation, keyboard semantics, feedback patterns, metadata, links, and placeholder functionality. No native browser `alert`, `confirm`, or `prompt` calls remain in `src`.

Remaining deployment work is configuring SMTP variables and applying the current Prisma-next migration graph. Stage 4 completed the auth/onboarding visual pass and accessibility polish, including mobile-first form order, live feedback, and touch-sized password controls. Its mobile density extension also prevents long narrow-screen stacks across pricing, process, value, and account-choice cards by using touch-friendly horizontal rails while preserving desktop grids. Broader end-to-end/browser coverage remains a useful follow-up. No new product feature is pending from this ordered roadmap.
