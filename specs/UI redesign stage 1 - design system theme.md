# Stage 1 - Design System, Typography, and Theme

Status: Complete. See `specs/UI redesign stage 1 report.md`.

## 1. Objective
Create the reusable visual language that makes ShelfLife distinctive, premium, calm, and consistent.

## 2. Scope
Replace scattered visual decisions with semantic tokens and primitives for typography, color, surfaces, borders, radius, elevation, controls, status, focus, and motion.

## 3. Pages/components affected
`globals.css`; root layout/font loading; `ThemeProvider`; `ThemeToggle`; shared UI primitives; every later stage consumes these tokens.

## 4. UX requirements
Controls must communicate hierarchy and state without relying on color alone. Establish consistent primary, secondary, quiet, destructive, loading, success, and disabled behaviors.

## 5. Visual requirements
Define a distinctive display face and readable UI/body face, with a compact type scale and explicit line heights. Use forest/food identity as an accent, not a monochrome palette. Define a sophisticated warm light theme and a deliberately composed dark theme rather than simple inversion. Define surface levels, restrained gradients, border opacity, shadow recipes, maximum radius, chart colors, and semantic status colors.

## 6. Desktop behavior
Tokens must support dense desktop dashboards and expressive full-width marketing compositions without page sections becoming nested card stacks.

## 7. Mobile behavior
Type, spacing, controls, and sheets must remain readable at 320px. Define minimum touch target dimensions and compact input/control variants.

## 8. Animation/motion requirements
Create motion tokens for entrance, hover, press, drawer, sheet, modal, progress, and chart reveal. Define standard durations/easings and a global reduced-motion policy. No perpetual decorative motion.

## 9. Accessibility requirements
Meet WCAG AA contrast for text and controls, preserve visible focus, provide non-color status cues, support forced colors where practical, and ensure theme changes do not cause unreadable intermediate states.

## 10. Performance requirements
Use `next/font` or a documented equivalent with limited font weights. Avoid runtime style generation and large component libraries. Keep primitives mostly server-compatible.

## 11. Dependencies/libraries
Prefer CSS/Tailwind tokens and existing Lucide icons. Add a font only if its licensing, loading cost, and visual purpose are documented. Do not add Motion, GSAP, or Three.js yet.

## 12. Things explicitly NOT to change
No feature behavior, route structure, auth/account separation, data calculations, recipe safety, pricing rules, barcode scanning, or page-specific redesign.

## 13. Acceptance criteria
A token table covers color, typography, spacing, radius, elevation, focus, status, and motion. Primitives exist or are specified for buttons, inputs, selects, tabs, badges, alerts, dialogs, drawers, sheets, skeletons, empty states, tables, and charts. Light/dark/system behavior is defined.

## 14. Definition of Done
The design system can be consumed by later stages without repeating raw color/radius/shadow decisions in feature components, and visual tokens pass contrast review.

## 15. Dependencies on previous stages
Requires Stage 0 audit and token inventory.
