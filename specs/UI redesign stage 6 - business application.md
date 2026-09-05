# Stage 6 - Business Application

Status: Complete.

## Current checkpoint

The business dashboard overview now uses the shared mobile-density treatment: tighter small-screen page padding and vertical rhythm, while preserving business account guards, operational inventory data, and shared KPI/widget primitives. FIFO strategy now provides focused mobile priority cards alongside the desktop comparison table. Business route gutters are consistent across inventory, strategy, analytics, waste, settings, and dashboard entry points.

## 1. Objective
Give business users a professional operations console distinct from, but related to, the consumer product.

## 2. Scope
Business overview, inventory, product detail/edit, alerts, notifications, waste, analytics, Inventory Strategy/FIFO, settings, imports, and business navigation.

## 3. Pages/components affected
Business dashboard routes; shared shell/sidebar; `StrategyView`; business forms/imports; business analytics/waste/alerts/notifications/settings views.

## 4. UX requirements
Prioritize operational urgency, stock exposure, expiry risk, FIFO/use-first ordering, low stock, waste risk, and actionable next steps. Clearly label advisory recommendations versus deterministic facts.

## 5. Visual requirements
Use denser tables, comparison-friendly metrics, restrained status colors, clear operational grouping, and a more professional console tone. Consumer warmth may remain in accents but not at the cost of scan speed.

## 6. Desktop behavior
Support wide comparison views, sticky table headers where useful, clear filters, strategy recommendations beside supporting facts, and high-information dashboard summaries.

## 7. Mobile behavior
Convert wide tables to priority rows and drill-down sheets. Keep urgent alerts and FIFO actions above secondary explanation. Allow business users to complete imports and common stock actions without desktop-only controls.

## 8. Animation/motion requirements
Use restrained transition feedback for filters, strategy updates, imports, and risk changes. No decorative parallax in the operational console.

## 9. Accessibility requirements
Expose advisory/deterministic distinctions in text, preserve semantic data tables or accessible mobile replacements, label chart summaries, and support keyboard navigation through strategy actions.

## 10. Performance requirements
Do not add predictive computation or client-side duplication of server facts. Lazy-load heavy visualizations and keep business dashboard data boundaries intact.

## 11. Dependencies/libraries
Reuse shared primitives and existing actions. Coordinate chart dependency decisions with Stage 8; do not add a business-specific UI framework.

## 12. Things explicitly NOT to change
No business ownership checks, account type rules, FIFO calculations, waste calculations, plan limits, imports, strategy logic, or barcode scanning.

## 13. Acceptance criteria
Business users can identify risk, compare stock, follow FIFO/strategy recommendations, and perform inventory actions quickly at desktop and mobile widths.

## 14. Definition of Done
Business routes are visually related to consumer routes but operationally distinct, with complete state and accessibility QA.

## 15. Dependencies on previous stages
Requires Stages 1-5 for shared tokens/shell patterns; Stage 6 must not fork primitives unnecessarily.
