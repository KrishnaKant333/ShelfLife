# ShelfLife Project Overview

## Product

ShelfLife helps households and food businesses know what inventory they have, what needs attention, and what should be used first. Deterministic application logic is the source of truth; AI assists with extraction and recommendations.

## Account types

Consumer data is owned by the authenticated user and uses `/dashboard`. Business data is owned by the authenticated user and authenticated business and uses `/business/dashboard`. Shared UI is preferred where behavior is identical.

Implemented capabilities include inventory CRUD, expiry/status tracking, imports and exports, label scanning, alerts, analytics, waste management, consumption tracking, recipes, FIFO, Business Inventory Strategy, and theme support. Barcode scanning is currently deferred and hidden from product entry; existing inventory structures are preserved for future reintroduction.

## Current status

The ordered P0, P1, and P2 implementation work is complete. Expiry is nullable and trackability-aware; expired discard, unit normalization, email verification, product detail, images, activity history, sorting, notifications, responsive navigation, and theme support are implemented. Remaining work is operational: configure SMTP in each deployment and add broader automated/browser regression coverage.

## Safety principles

- Ownership is established from the server session.
- Expiry status is deterministic.
- Expired inventory is excluded before recipe AI calls and AI responses are validated.
- AI may not invent dates, quantities, IDs, or ownership facts.
- Missing expiry remains explicitly unknown rather than silently becoming a guessed date.

## Roadmap order

P0: expired discard, robust unit normalization, safe missing-expiry handling, email verification.

P1: sidebar collapse/mobile navigation, list/grid inventory, product detail, images/default icons, inventory activity, consumption/discard history, sorting, notifications.

P2: remaining UI/UX consistency work from the existing specifications.

## Next phase: staged visual redesign

ShelfLife is entering a planning-only visual and UX redesign from functional MVP polish toward a premium SaaS experience. The staged plan is in `specs/UI redesign roadmap.md` and `specs/UI redesign stage 0 - audit and foundation.md` through Stage 12. Implementation must begin with the audit and design foundation, then proceed in dependency order.

The redesign is presentation and interaction work only. It must preserve product/business logic, account separation, ownership/security, AI and recipe safety, deterministic expiry/quantity/FIFO/waste behavior, pricing rules, and the deferred/hidden barcode state.
