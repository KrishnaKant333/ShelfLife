# Stage 0 - UI Audit and Design Foundation

## 1. Objective
Create the factual baseline for the redesign without changing application code.

## 2. Scope
Audit routes, components, tokens, copy, responsive behavior, theme behavior, loading/error/empty states, accessibility, performance, and visual duplication. Establish a shared vocabulary for surfaces, actions, density, and hierarchy.

## 3. Pages/components affected
All `src/app` routes; `globals.css`; layouts; `Navbar`; `DashboardShell`; `Sidebar`; auth forms; inventory, analytics, waste, recipes, strategy, settings, notification, pricing, and marketing components.

## 4. UX requirements
Document the primary task, secondary task, failure state, empty state, and success state for every route. Identify redundant clicks, unclear actions, dead-looking controls, and content that should be hidden or reprioritized on handheld screens.

## 5. Visual requirements
Record repeated class patterns, current color usage, typography hierarchy, card nesting, border/radius/shadow usage, icon treatment, and light/dark contrast failures. Define the intended product split: expressive marketing, calm information-dense application.

## 6. Desktop behavior
Audit 1280px, 1440px, and 1920px layouts for max-width, sidebar/content proportions, table density, chart readability, and unused space.

## 7. Mobile behavior
Audit 320px, 375px, 390px, and 414px plus tablet. Record structural changes needed rather than merely stacked desktop layouts. Give auth and product entry priority over decorative content.

## 8. Animation/motion requirements
Inventory existing motion and classify it as keep, replace, reduce, or remove. No new motion is implemented in this stage.

## 9. Accessibility requirements
Audit landmarks, heading order, labels, focus visibility, keyboard order, dialog semantics, touch targets, contrast, reduced motion, and screen-reader names. Record findings with severity.

## 10. Performance requirements
Record client component boundaries, image dimensions, duplicated loading components, bundle-heavy candidates, and likely layout shift sources. Do not optimize yet.

## 11. Dependencies/libraries
No new dependency. Evaluate existing `lucide-react`, `next-themes`, `@vercel/analytics`, and unused `html5-qrcode` without adding or removing packages.

## 12. Things explicitly NOT to change
No routes, server actions, schemas, business rules, auth rules, database fields, barcode scanning, external provider, or UI implementation.

## 13. Acceptance criteria
A route/component matrix exists; all current screens are classified as marketing, auth, consumer, business, or shared; every breakpoint target is recorded; risks and dependencies are prioritized; barcode remains marked deferred.

## 14. Definition of Done
Audit artifact reviewed against the repository and used to sequence Stages 1-12. No unverified design assumptions remain for the first implementation stage.

## 15. Dependencies on previous stages
Depends only on the existing MVP/P0-P2 baseline.
