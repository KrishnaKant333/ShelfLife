# ShelfLife Main Development Specification

This is the authoritative ordered task list. Inspect the implementation before each task. Complete and test each item before starting the next. After each major phase update this file, `context/Progress tracker.md`, and `README.md`.

## P0 - safety and trust

1. [x] Discard all expired items. Added an ownership-safe confirmed action to the shared inventory view and revalidated affected dashboards/recipes.
2. [x] Complete quantity/unit normalization. Added aliases, decimal quantities, compatible conversions, and explicit incompatible-unit behavior across validation and sorting.
3. [x] Handle ambiguous/missing expiry in AI, import, and label flows. Added evidence-based derivation and `Expiry not available` / `Not trackable` handling.
4. [x] Add strict email verification. Signup sends a real email and shows a standby pending page; only clicking the emailed token creates the Auth.js session and redirects automatically to the correct dashboard. Signup is blocked when SMTP is unavailable.

Checkpoint: run `npm run build`, exercise consumer and business paths, and fix regressions.

## P1 - dashboard and inventory workflows

5. [x] Collapsible dashboard sidebar with hamburger/mobile navigation and icons-only collapsed state.
6. [x] Inventory List/Grid view toggle.
7. [x] Clickable inventory items with dedicated product detail pages.
8. [x] Product image field with category-aware default icons when unavailable.
9. [x] Inventory history/activity tracking for consumption and discard.
10. [x] Product consumption/discard history records with quantities.
11. [x] Inventory sorting by expiry, quantity, name, and recently added alongside existing search/filter.
12. [x] Top-right notification center for expiry, low-stock, and waste-related attention.

Checkpoint: run `npm run build` and test both account types and responsive layouts.

## P2 - polish

13. [x] Continue remaining UI/UX polish and consistency work identified by the existing specifications. The ordered feature pass is complete without replacing working business logic or duplicating inventory systems.

Final checkpoint: `npm run build`, targeted lint/type checks, and regression review of all protected features.

Deployment prerequisites: apply the pending migration rooted at `d4341e80715f` and configure SMTP environment variables for email verification.
