# ShelfLife Progress Tracker

Last audited: 2026-09-05

## Baseline

- [x] Production build passes before this roadmap (`npm run build`)
- [x] Consumer and Business authentication and route isolation
- [x] Inventory CRUD, imports, exports, label scanning, alerts, analytics, waste, consumption, recipes, FIFO, pricing definitions
- [x] Recipe safety excludes expired inventory before AI
- [x] Light/Dark/System theme support exists

## P0

- [x] Discard/archive all expired items through an ownership-safe confirmed inventory action
- [x] Expand unit normalization and incompatible-unit handling
- [x] Support missing/ambiguous expiry safely and derive only from reliable evidence
- [x] Strict email verification: signup sends an email, pending page waits, token verification creates the session and redirects to the dashboard
- [x] P0 build checkpoints (`npm run build`)

## P1

- [x] Collapsible sidebar, hamburger/mobile navigation, icons-only collapsed state
- [x] Inventory List/Grid toggle
- [x] Clickable inventory items and product detail pages
- [x] Product image field and category-aware default icons
- [x] Inventory activity/history records for consumption and expired discard
- [x] Consumption/discard history writes and quantity summaries in activity records
- [x] Expiry/quantity/name/recently-added sorting alongside search/filter
- [x] Top-right notification bell for expiry, low-stock, and waste-related inventory attention
- [x] P1 build checkpoint (`npm run build`)

## P2

- [x] Remaining roadmap UI/UX work completed in this pass without replacing working business logic
- [x] Final production build and migration graph review
- [x] Final route audit for Consumer, Business, auth, inventory, analytics, recipes, waste, settings, import/export, and marketing surfaces
- [x] Defer barcode scanning and remove the temporary external barcode lookup integration; manual, label, and bulk entry remain active
- [x] Shared confirmation keyboard behavior, destructive-action feedback, activity error states, theme-safe consumer forms, server-side consumption validation, and baseline social metadata

## Deployment follow-up

- [x] Apply Prisma-next migration with `npx prisma db migrate --to b70d5295c1bd`
- [ ] Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM`

The production build passes. The repository still has pre-existing strict ESLint findings in generated contract types, older `any` casts, and several React lint rules; these do not block the production build and were outside the focused P2 behavior fixes.

Signup is blocked until SMTP is configured. There is no local verification bypass.

## Next planning phase

- [x] Define the planning-only UI redesign roadmap and Stages 0-12 specifications
- [ ] Implement redesign stages in order, beginning with Stage 0 audit and design foundation

## Do not break

Authentication, ownership, Consumer/Business isolation, AI and recipe safety, expiry logic, imports, exports, label scanning, analytics, waste, FIFO, and pricing behavior. Barcode data structures should remain available for future work, but barcode scanning is currently deferred.
