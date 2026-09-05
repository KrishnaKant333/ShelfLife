# Stage 12 - Performance and Final Visual QA

## 1. Objective
Verify that the premium redesign is production-ready, fast, accurate, and consistent without feature regressions.

## 2. Scope
Build, lint, route smoke tests, visual regression, responsive screenshots, theme matrix, interaction checks, performance budgets, dependency review, and documentation handoff.

## 3. Pages/components affected
All public, auth, verification, consumer, and business routes; all shared primitives; analytics/AI/import flows; `README.md` and relevant Context/Specs records.

## 4. UX requirements
Confirm primary tasks, navigation, loading, success, error, empty, retry, auth, sign-out, ownership redirects, import review, label review, recipe safety, and destructive confirmations remain understandable.

## 5. Visual requirements
Compare light/dark/system themes across every route, confirm typography and spacing consistency, inspect long/empty/error content, validate imagery and metadata, and reject visual drift between Consumer and Business.

## 6. Desktop behavior
Test 1280, 1440, and 1920 widths with realistic inventory sizes, dense tables, charts, long names, and open overlays.

## 7. Mobile behavior
Test 320, 375, 390, 414, and tablet with slow network, keyboard, reduced motion, and both account types. Confirm no horizontal overflow except explicitly documented dense data views.

## 8. Animation/motion requirements
Verify motion budgets, reduced-motion snapshots, no stuck transitions, no layout shift from animations, and no scroll-jacking or offscreen animation waste.

## 9. Accessibility requirements
Run keyboard and automated checks, verify semantic landmarks and names, inspect contrast, test screen-reader announcements for async states, and verify dialogs/sheets/focus restoration.

## 10. Performance requirements
Run production build and measure LCP, CLS, INP where tooling permits, JS bundle changes, image weight, font loading, chart/3D cost, and client component count. Remove unused dependencies only when safe and confirmed.

## 11. Dependencies/libraries
Audit every redesign dependency against its stated stage rationale. Remove rejected/unused libraries and ensure lockfiles/build configuration are consistent.

## 12. Things explicitly NOT to change
No late feature additions, architecture replacement, barcode scanning, business-rule changes, schema migrations, or unverified copy claims.

## 13. Acceptance criteria
Production build passes; focused lint/type checks pass for changed surfaces; visual and responsive QA is recorded; no critical functional/accessibility/performance regression remains; documentation reflects the shipped state.

## 14. Definition of Done
The redesign is ready for release review with a route-by-route checklist, known residual risks, rollback notes, and a clean implementation diff.

## 15. Dependencies on previous stages
Requires completion and sign-off of Stages 0-11.
