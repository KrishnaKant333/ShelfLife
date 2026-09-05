# Stage 9 - AI, Recipes, Insights, and Waste Experiences

Status: Complete.

## Current checkpoint

Stage 9 is complete after the Stage 8 visualization pass. The deterministic analytics layer now provides the baseline for transparent AI, recipe safety, waste actions, and strategy recommendations. AI output is labeled as advisory based on current inventory, loading/failure/generated states are announced, recipe mode selection is semantic, recipe and waste dialogs are mobile-safe and accessible, and safety/consumption boundaries remain unchanged.

## 1. Objective
Make AI-assisted and waste-reduction workflows feel useful, safe, transparent, and calm rather than gimmicky.

## 2. Scope
Recipes, recipe modes, AI brief/insights, label/invoice extraction feedback, waste insights, use-first actions, expired-item messaging, and business strategy recommendations.

## 3. Pages/components affected
`RecipesView`; `DashboardAiInsights`; `WasteView`; `StrategyView`; `AddProductFlow` label states; `InvoiceImport`; related error/empty/loading primitives.

## 4. UX requirements
Explain what the system knows, what AI suggested, and what the user can do next. Make recipe modes scannable, safe ingredient exclusions understandable, consumption confirmation explicit, and waste advice actionable. Unknown expiry remains unknown.

## 5. Visual requirements
Use editorial food warmth selectively in recipes and waste; keep operational facts visually stronger than AI prose. Give AI output a clear source/status treatment without chat-app clichés, glowing gradients, or fake confidence.

## 6. Desktop behavior
Recipe selection can use a two-pane/list-to-detail pattern; waste and strategy can pair risk summary with prioritized action list. Keep long generated content readable and collapsible.

## 7. Mobile behavior
Use focused recipe cards and full-screen detail sheets; keep “use” and “mark consumed” actions near ingredients. Collapse explanation before actions, not the reverse. Ensure long AI/error content does not bury retry or safe-state messaging.

## 8. Animation/motion requirements
Use generation progress, staged result reveal, ingredient selection feedback, and success/error toasts. Never imply AI is thinking through distracting indefinite animations; provide cancellation/retry affordances where possible.

## 9. Accessibility requirements
AI status is announced, generated content has headings, safety exclusions are textual, modals/sheets manage focus, actions have explicit labels, and status is not conveyed by color alone.

## 10. Performance requirements
Do not call AI during visual-only navigation. Preserve session caching where present, avoid rendering huge generated payloads at once, and keep server-side safety validation authoritative.

## 11. Dependencies/libraries
Reuse Groq actions, existing Toast/Dialog, and Stage 1 primitives. No AI chat framework and no new model/provider.

## 12. Things explicitly NOT to change
No prompts, model authority boundaries, expired filtering, recipe validation, consumption rules, waste formulas, FIFO, strategy calculations, or expiry derivation rules.

## 13. Acceptance criteria
Users can generate, inspect, retry, safely consume, and understand AI/waste outputs across empty, loading, partial, failure, and success states without confusing advice for deterministic facts.

## 14. Definition of Done
Consumer recipes and insights plus consumer/business waste/strategy surfaces pass safety, responsive, accessibility, and reduced-motion review.

## 15. Dependencies on previous stages
Requires Stages 1, 2, 5, 6, 7, and 8 where visualization is used.
