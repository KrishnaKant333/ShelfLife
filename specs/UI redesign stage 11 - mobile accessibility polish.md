# Stage 11 - Mobile Polish and Accessibility

Status: Complete.

## Current checkpoint

Stage 11 is active after the completed motion and scroll pass. Begin with cross-route mobile QA, focus order, touch targets, reduced-motion behavior, fog-layer interaction checks, and long-content verification across marketing, auth, consumer, and business surfaces.

## Current checkpoint

The shared mobile dashboard drawer now locks background scrolling while open and restores the previous body overflow state on close. The shared confirmation dialog now contains Tab focus, preserves Escape cancellation and initial focus, and keeps pending destructive actions disabled. Both changes preserve route and business behavior.

Stage 11 is complete for the implementation pass. Device-lab, screen-reader, throttled-network, browser-matrix, and final performance measurements are intentionally handed to Stage 12 rather than being represented as completed here.

## 1. Objective
Run a dedicated handheld and inclusive-use pass across the entire redesigned product.

## 2. Scope
320px, 375px, 390px, 414px, tablet, keyboard, screen reader, touch, contrast, reduced motion, zoom, and error-recovery QA for public, auth, consumer, and business surfaces.

## 3. Pages/components affected
All routes and shared primitives, especially auth, DashboardShell/Sidebar, inventory tables, product entry, sheets/dialogs, charts, recipes, waste, settings, pricing, and marketing hero sections.

## 4. UX requirements
Prioritize functionality over decorative persistence: fewer taps, thumb reach, clear primary action, minimal scrolling, focused content, and recoverable failures. Confirm no desktop-only action remains essential.

## 5. Visual requirements
Check text fit, no overlap, stable controls, readable status colors, adequate density, and intentional dark/system theme appearance. Remove or reorder secondary copy when it competes with primary tasks.

## 6. Desktop behavior
Confirm mobile structural changes do not degrade desktop information density, keyboard flows, or wide data comparison.

## 7. Mobile behavior
Test all required widths with real content, long names, long errors, empty states, large quantities, missing expiry, and slow network states. Test one-handed interaction and keyboard-open viewport behavior.

## 8. Animation/motion requirements
Test reduced-motion mode, low-power devices, route transitions, sheets, loading, success, and error feedback. No essential information may depend on animation.

## 9. Accessibility requirements
Target WCAG 2.2 AA: semantics, labels, landmarks, focus order, focus trap/restoration, contrast, touch target size, status announcements, tables, charts, dialogs, and form errors.

## 10. Performance requirements
Test throttled mobile CPU/network, image loading, hydration, long lists, charts, and AI/import pending states. Record regressions rather than hiding them with arbitrary delays.

## 11. Dependencies/libraries
Use automated accessibility tooling if already available; otherwise add only a focused test tool with a documented purpose. No feature dependency should be introduced here.

## 12. Things explicitly NOT to change
No business logic, auth/ownership, calculation formulas, AI safety, barcode scanning, or product architecture.

## 13. Acceptance criteria
All required widths and assistive interaction modes pass a written checklist; no critical overlap, unreachable action, contrast failure, focus trap, or unlabeled control remains.

## 14. Definition of Done
Mobile and accessibility sign-off covers every route category and includes regression evidence for both Consumer and Business.

## 15. Dependencies on previous stages
Requires Stages 1-10; this is a cross-cutting verification/polish stage, not a place to introduce new features.
