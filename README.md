# ShelfLife

ShelfLife is a Next.js food-inventory intelligence application for consumers and food businesses. It combines deterministic inventory, expiry, ownership, quantity, FIFO, waste, and recipe-safety logic with AI-assisted extraction and recommendations.

## Current implementation

- Consumer and Business authentication with isolated dashboard routes.
- Auth.js credentials sessions and server-side ownership checks.
- Inventory CRUD, search, filtering, sorting, bulk delete, consumption recording, CSV/PDF export.
- Manual, barcode, label, CSV, and invoice inventory entry flows.
- Deterministic Expired, Expiring, Fresh, and Low Stock status logic.
- Weight, volume, and count normalization for supported units.
- Alerts, analytics, waste insights, FIFO and Business Inventory Strategy.
- Groq-powered invoice/label extraction, ShelfLife Brief, and consumer recipe modes.
- Expired inventory is filtered before recipe generation and returned recipes are validated.
- Light, Dark, and System themes with persisted theme selection.
- Responsive shared dashboard shell and loading/feedback UI in the existing implemented areas.

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

The current contract migration has been applied to the configured database. Email verification requires `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM` in `.env.local` before signup is enabled. For Gmail, use a Google App Password rather than the normal account password, then restart the dev server.

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

Features not listed as implemented must remain labelled as incomplete or Coming Soon.
