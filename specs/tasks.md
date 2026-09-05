# ShelfLife Ordered Task Register

The previous UI-overhaul checklist is superseded by `Next task.md`. This register records the implementation status after the repository audit.

## Existing and protected

- [x] Auth.js credentials authentication and Consumer/Business routing
- [x] Ownership checks in consumer/business inventory actions
- [x] Inventory CRUD, imports, exports, barcode and label scanning
- [x] Deterministic status classification and recipe expired-item exclusion
- [x] Consumption, analytics, waste, FIFO, Business Inventory Strategy
- [x] Light/Dark/System theme support and shared dashboard UI

## Ordered work

| Priority | Task | Status |
| --- | --- | --- |
| P0.1 | Discard all expired items | Complete; build passed |
| P0.2 | Robust quantity/unit normalization | Complete; build passed |
| P0.3 | Safe missing/ambiguous expiry handling | Complete; build passed |
| P0.4 | Email verification | Complete; real email required, standby pending page, automatic dashboard redirect |
| P1.5 | Collapsible sidebar and mobile navigation | Complete; build passed |
| P1.6 | Inventory List/Grid toggle | Complete; build passed |
| P1.7 | Product detail pages | Complete; ownership-scoped consumer/business routes |
| P1.8 | Product images/default icons | Complete; optional image field and category-aware defaults |
| P1.9 | Inventory activity tracking | Complete for consumption and expired discard |
| P1.10 | Consumption/discard history and summaries | Complete in activity records |
| P1.11 | Inventory sorting | Complete; expiry, quantity, name, recently added |
| P1.12 | Notification center | Complete; top-right computed expiry/low-stock attention view |
| P2.13 | Remaining UI/UX polish | Complete for this ordered pass |

## Checkpoint policy

Run `npm run build` after P0 and P1. Never mark a task complete while the build or ownership/safety regression checks fail.

Deployment follow-up: configure SMTP variables before enabling signup verification. No local verification bypass exists.
