# ShelfLife Architecture

## Stack

- Next.js 16.3.2 App Router, React 19, TypeScript, Tailwind CSS 4
- Auth.js credentials authentication with JWT sessions
- PostgreSQL through Prisma-next
- Groq for extraction and recommendations

## Boundaries

Server components load authenticated data. Server actions authenticate, validate, derive ownership, mutate the database, and revalidate the correct consumer or business routes. Client components are reserved for interaction such as forms, scanners, filters, themes, charts, and modals.

## Ownership

Consumer inventory uses the authenticated `userId` with no business scope. Business inventory requires both the authenticated user and authenticated `businessId`. Client-provided ownership identifiers are never authoritative.

## Current inventory model

`InventoryItem` currently contains name, category, integer quantity, unit, required expiry date, user/business ownership, and timestamps. `InventoryConsumption` records consumed quantity, unit, optional normalized quantity, ownership, and timestamp. The P0 expiry work must evolve this model without weakening ownership checks.

## Current flows

Manual entry -> server validation -> ownership check -> database.

Barcode/label/invoice -> extraction or lookup -> preview/review -> validation -> save.

CSV -> parse -> validate -> preview -> import.

Recipe generation -> fetch owned inventory -> deterministic expiry filtering -> AI -> response validation -> display.

## Required next architectural changes

1. Add a safe discard/archive path for expired items and ensure all affected dashboard/analytics/recipe queries respect it.
2. Centralize unit parsing and normalization with explicit compatible/incompatible results.
3. Make expiry nullable/trackability-aware and centralize reliable date derivation.
4. Add verification state and token delivery/consumption without bypassing existing credentials ownership rules.
5. Add activity/history and notification data only when the P1 feature reaches its ordered phase.
