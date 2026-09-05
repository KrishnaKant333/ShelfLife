# Stage 1 Report - Design System, Typography, and Theme

Status: Complete
Date: 2026-09-05

## Delivered

- Added semantic `--sl-*` tokens in `src/app/globals.css` for:
  - Canvas, surface, raised surface, inset surface.
  - Text, muted text, subtle text, borders.
  - Action, action hover, action-soft, focus, success, warning, danger, info.
  - Spacing, radius, elevation, duration, and easing.
- Preserved the existing `--shelf-*` aliases so current feature pages remain behaviorally and visually compatible while later stages migrate surfaces incrementally.
- Added explicit typography roles:
  - `DM Sans` for UI/body content.
  - `Newsreader` for headings/display content.
- Added global focus-visible styling, selection styling, stable body typography, and reduced-motion behavior.
- Added shared CSS primitives:
  - `.sl-surface`
  - `.sl-surface-raised`
  - `.sl-eyebrow`
  - `.sl-focus-ring`
  - `.sl-status-success`
  - `.sl-status-warning`
  - `.sl-status-danger`
  - `.sl-status-info`
  - `.sl-enter`
- Added reusable React primitives in `src/components/ui/Primitives.tsx`:
  - `Button`
  - `Surface`
  - `Field`
  - `StatusBadge`
  - `Skeleton`
  - `EmptyState`
- Updated `ThemeProvider` to expose `color-scheme` and suppress broad theme-transition flashes.
- Updated `ThemeToggle` placeholder/control sizing to preserve layout and meet touch-target expectations.
- Migrated Toast and ConfirmDialog to semantic tokens, shared focus treatment, responsive width, elevation, and minimum touch targets.
- Added a dark-theme compatibility layer for legacy filled-action utilities so existing white button labels remain readable while legacy accent text/icons retain their light contrast.

## Token contract

| Role | Light | Dark | Consumer |
|---|---|---|---|
| Canvas | Warm neutral | Deep green-black | Body/page backgrounds |
| Surface | Warm white | Raised green-black | Panels and fields |
| Action | Forest | Soft sage | Primary actions and active states |
| Text | Deep ink | Warm pale text | Headings/body |
| Muted | Cool olive-gray | Desaturated green-gray | Supporting copy |
| Danger | Terracotta red | Coral red | Destructive/error |
| Warning | Amber | Warm amber | Expiry/attention |
| Info | Slate blue | Light blue | Informational context |

## Explicit non-goals

- No page-by-page redesign was performed.
- No route, server action, schema, ownership, auth, pricing, analytics formula, recipe safety, expiry, quantity, FIFO, waste, or AI behavior changed.
- No Motion, GSAP, Three.js, charting, form, or component-library dependency was added.
- Barcode scanning remains deferred and hidden.

## Stage 2 handoff

Stage 2 may use these tokens/primitives to redesign the public/authenticated shells and responsive navigation. It should not invent a second token layer or bypass the primitives with new arbitrary visual constants.
