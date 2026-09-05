# Stage 2 - Core Layout, Navigation, and Responsive Foundation

Status: Complete. See `specs/UI redesign stage 2 report.md`.

## 1. Objective
Establish a stable responsive shell for public, auth, consumer, and business experiences.

## 2. Scope
Marketing navbar structure, authenticated sidebar/top bar, collapsed sidebar, mobile drawer or bottom navigation decision, content containers, page headers, route transitions, and shared layout primitives.

## 3. Pages/components affected
Marketing layout and `Navbar`; `DashboardShell`; `Sidebar`; dashboard layouts; shared loading/error/not-found shells; notification entry point; `Toast` and `ConfirmDialog` placement.

## 4. UX requirements
Navigation must make current location, account context, alerts, settings, and sign-out obvious. Keep consumer and business navigation related but contextually distinct. Avoid duplicate providers and inconsistent page chrome.

## 5. Visual requirements
Use a restrained productivity shell: clear content canvas, quiet chrome, measured density, consistent page headers, purposeful active states, and no decorative dashboard hero treatment. Public navigation may be more expressive.

## 6. Desktop behavior
At desktop widths use a stable sidebar with readable expanded mode and useful icon-only collapsed mode. Main content has a predictable max-width and notification affordance. Nested routes preserve context.

## 7. Mobile behavior
At 320-414px use a compact top bar and thumb-reachable drawer or bottom navigation. Drawer closes on navigation, Escape, and backdrop; focus is managed. Do not preserve the desktop sidebar footprint. Keep primary page action reachable without long scrolling.

## 8. Animation/motion requirements
Use short drawer, collapse, route-content, and overlay transitions. Avoid animating the entire dashboard on every navigation. Respect reduced motion.

## 9. Accessibility requirements
Use landmarks, `aria-current`, labelled icon buttons, logical tab order, focus restoration for drawers, Escape handling, and a visible focus ring. Ensure collapsed navigation has tooltips or accessible names.

## 10. Performance requirements
Keep shell interaction client-side only where necessary. Avoid making all page content client components. Ensure logos have stable dimensions and drawer content does not cause layout shift.

## 11. Dependencies/libraries
Use existing Next App Router, Lucide, and CSS transitions. Do not add a router, layout, or component framework.

## 12. Things explicitly NOT to change
No navigation destinations, route protection, alert-count calculation, account rules, feature logic, barcode entry, or server data fetching contracts.

## 13. Acceptance criteria
Every public/auth/dashboard route has a coherent shell; consumer/business differences are explicit; mobile navigation works at all required widths; keyboard and screen-reader flows work; content does not hide beneath fixed chrome.

## 14. Definition of Done
Both account types can navigate every existing route from desktop and mobile shells with no dead links, layout shifts, or focus traps.

## 15. Dependencies on previous stages
Requires Stage 1 tokens/primitives and Stage 0 route audit.
