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

`InventoryItem` contains name, category, decimal quantity, unit, nullable expiry date, optional image URL, user/business ownership, and timestamps. `InventoryConsumption` and `InventoryActivity` record owned consumption/discard history, quantities, units, and timestamps. Unknown expiry is explicit and is never treated as safe for recipe generation.

## Current flows

Manual entry -> server validation -> ownership check -> database.

Label/invoice -> extraction -> preview/review -> validation -> save. Barcode scanning and external barcode lookup are deferred; no barcode provider is active in the current entry flow.

CSV -> parse -> validate -> preview -> import.

Recipe generation -> fetch owned inventory -> deterministic expiry filtering -> AI -> response validation -> display.

## Current architectural state

1. Expired items can be discarded through an ownership-safe confirmed action; the discard is recorded in activity history.
2. Unit parsing and normalization return explicit compatible/incompatible results for supported weight, volume, and count units.
3. Expiry is nullable and reliable date derivation is used by AI, import, label, and inventory flows.
4. Signup requires email verification through a delivered token; there is no local bypass.
5. Shared dashboards provide activity history, computed notifications, responsive navigation, and list/grid inventory views.

Further changes should remain focused on maintenance, testing, and deployment configuration rather than new architecture.

## UI redesign planning state

The next product phase is a documentation-only visual and UX redesign planned in `specs/UI redesign roadmap.md` and Stages 0-12. The redesign may change presentation, interaction, responsive structure, visual tokens, and component composition, but must preserve server actions, route protection, account isolation, ownership, deterministic inventory/expiry/quantity/FIFO/waste logic, recipe safety, AI safety, and pricing rules.

The intended split is expressive marketing and restrained, information-dense authenticated productivity screens. Consumer and Business remain visually related but contextually distinct. Barcode scanning and external barcode lookup remain deferred and hidden.
