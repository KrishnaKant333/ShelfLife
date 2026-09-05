# Stage 8 - Analytics, Charts, and Data Visualization

Status: In progress.

## Current checkpoint

Stage 8 has started after the Stage 7 camera preview fix and production build verification. The existing deterministic analytics, strategy, and waste surfaces are the implementation anchors. The first analytics slice now labels the view as a current snapshot, exposes progress values through ARIA, adds plain-language expiry summaries, tightens mobile chart panels, and links to account-correct alert routes without changing formulas or adding historical claims.

## 1. Objective
Turn current deterministic analytics into legible, trustworthy visual explanations without fabricating historical data.

## 2. Scope
Consumer and business analytics, expiry distribution, category/quantity distribution, health score, strategy metrics, waste-risk visuals, legends, responsive chart layouts, and chart empty states.

## 3. Pages/components affected
`AnalyticsView`; business/consumer analytics pages; `StrategyView`; `WasteView`; reusable chart, legend, tooltip, and metric primitives.

## 4. UX requirements
Every visualization must answer a concrete operational question and state its time/data scope. Distinguish current snapshot metrics from historical trends. Provide text summaries and useful links to inventory actions.

## 5. Visual requirements
Use a restrained multi-hue palette with semantic meaning, strong labeling, readable axes/legends, generous whitespace, and compact responsive compositions. Avoid decorative charts or misleading precision.

## 6. Desktop behavior
Use a clear hierarchy of headline metrics, primary risk visualization, category/quantity comparison, and supporting detail. Tooltips must not obscure nearby data.

## 7. Mobile behavior
Transform multi-column chart grids into prioritized single views, simplify axes, provide horizontal scrolling only for genuinely dense data, and offer a text/table summary beneath each chart.

## 8. Animation/motion requirements
Animate initial bar/line/progress reveals only when they aid comprehension. Respect reduced motion and avoid reanimating unchanged data on every navigation.

## 9. Accessibility requirements
Charts require accessible summaries, data tables or equivalent text, keyboard-readable tooltips where used, contrast-safe series, and non-color distinctions.

## 10. Performance requirements
Prefer a small chart library only if it materially reduces custom accessibility/interaction work. Lazy-load chart code where route-level cost warrants it and never move authoritative calculations to the client without review.

## 11. Dependencies/libraries
Evaluate Recharts, Visx, or a similarly focused library in this stage; choose at most one and document bundle/accessibility tradeoffs. Do not add a chart library in earlier stages.

## 12. Things explicitly NOT to change
No analytics formulas, database model, historical claims, waste ledger, FIFO, strategy rules, or AI output authority.

## 13. Acceptance criteria
Users can understand expiry risk, inventory health, category distribution, and strategy/waste signals without hover-only knowledge, on both themes and all target widths.

## 14. Definition of Done
Charts are accurate, accessible, responsive, performant, and connected to existing deterministic actions and empty/error states.

## 15. Dependencies on previous stages
Requires Stages 1, 2, 5, and 6; should precede advanced motion so visualizations have stable structure.
