# ShelfLife Project Overview

## Product

ShelfLife helps households and food businesses know what inventory they have, what needs attention, and what should be used first. Deterministic application logic is the source of truth; AI assists with extraction and recommendations.

## Account types

Consumer data is owned by the authenticated user and uses `/dashboard`. Business data is owned by the authenticated user and authenticated business and uses `/business/dashboard`. Shared UI is preferred where behavior is identical.

Implemented capabilities include inventory CRUD, expiry/status tracking, imports and exports, barcode/label scanning, alerts, analytics, waste management, consumption tracking, recipes, FIFO, Business Inventory Strategy, and theme support.

## Current gaps

The data model currently requires `expiryDate`, there is no expired-item discard/archive workflow, and email verification is absent. Normalization exists for common weight, volume, and count units but requires expansion and stronger handling of unknown/incompatible units. Product detail, image, activity, notification, and collapsed-sidebar features are also pending.

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
