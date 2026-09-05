# Stage 2 Report - Core Layout, Navigation, and Responsive Foundation

Status: Complete
Date: 2026-09-05

## Delivered

- Updated public `Navbar` with semantic Stage 1 tokens, visible focus treatment, stable mobile touch target, `aria-expanded`, `aria-controls`, and Escape-to-close behavior.
- Updated mobile public navigation with stable button sizing and readable theme-aware surfaces.
- Updated `DashboardShell` with:
  - Semantic canvas/surface tokens.
  - Stable mobile top-bar height.
  - 44px notification/menu targets.
  - Labelled modal mobile drawer.
  - Backdrop close behavior.
  - Escape-to-close behavior.
  - Focus restoration to the menu trigger.
- Updated `Sidebar` with:
  - Semantic surface/border/action tokens.
  - `aria-current="page"` for active navigation and settings.
  - Icon-based collapse/expand controls instead of text glyphs.
  - Labelled mobile close control with focus placement.
  - Stable minimum touch targets.
  - Clear consumer/business context labels preserved.
- Preserved all existing destinations, alert-count calculations, route protection, account separation, and server data contracts.

## Responsive decisions

- Desktop continues to use a fixed expanded/collapsed sidebar at `lg`.
- Mobile continues to use a compact top bar and drawer rather than preserving desktop sidebar width.
- The drawer uses a full-screen labelled dialog surface and a dismissible backdrop.
- Feature-page restructuring, bottom sheets, and page-specific content density remain future stage work.

## Explicit non-goals

- No feature pages were redesigned.
- No route, server action, schema, ownership, auth, pricing, analytics formula, recipe safety, expiry, quantity, FIFO, waste, or AI behavior changed.
- Barcode scanning remains deferred and hidden.
- Stage 3 marketing redesign has not started.

## Stage 3 handoff

Stage 3 may redesign the marketing composition using the Stage 1 tokens and updated public navbar. It should not redesign authenticated feature pages or introduce a second navigation system.
