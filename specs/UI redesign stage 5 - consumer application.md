# Stage 5 - Consumer Application

## 1. Objective
Redesign the consumer dashboard as a calm, information-dense personal inventory workspace.

## 2. Scope
Overview, inventory list/grid, product detail/edit, alerts, notifications, settings, and consumer-specific recipes entry point and navigation context.

## 3. Pages/components affected
Consumer dashboard routes; `DashboardAiInsights`; `DashboardUseFirst`; `InventoryOverview`; `ExpiryOverview`; `StatCard`; `InventoryView`; product detail/edit; `AlertsView`; `NotificationCenter`; `SettingsView`; `Sidebar`; shared empty/loading/error primitives.

## 4. UX requirements
Surface what needs attention first: expired/expiring/low stock, use-first actions, inventory health, and recent activity. Make search, filter, sort, view mode, selection, consume, discard, edit, and delete understandable without visual noise.

## 5. Visual requirements
Use measured density, strong page headers, compact status badges, purposeful KPI grouping, restrained cards, clear hierarchy, and a premium empty state that points to Manual Form, Scan Label, or Bulk Import. Avoid dashboard card pyramids.

## 6. Desktop behavior
Support fast scanning of inventory through table and grid modes. Keep filters and bulk actions near the dataset. Product details should provide a clear read/edit boundary and activity context.

## 7. Mobile behavior
Transform tables into focused rows/cards with essential status, quantity, and expiry first. Move filters to a sheet, keep search prominent, make consume/use-first actions thumb reachable, and avoid horizontal scrolling for core tasks.

## 8. Animation/motion requirements
Use subtle list/filter transitions, KPI count reveals, status/progress animations, and drawer/sheet transitions. Avoid animating every row on refresh.

## 9. Accessibility requirements
Preserve table semantics where tables remain, provide list alternatives where structure changes, label selection controls, expose status text, support keyboard bulk actions, and ensure dialogs restore focus.

## 10. Performance requirements
Keep inventory calculations server-authoritative, virtualize only if evidence demands it, avoid client-loading the entire dashboard unnecessarily, and use stable image dimensions.

## 11. Dependencies/libraries
Existing CSS/Lucide/Next Image first. Charting is deferred to Stage 8; no new data library here.

## 12. Things explicitly NOT to change
No inventory queries, ownership filters, status logic, quantity/unit normalization, activity writes, recipe safety, discard behavior, auth, or barcode reintroduction.

## 13. Acceptance criteria
Consumer overview and inventory support rapid attention triage on desktop and one-handed use on mobile, with complete loading, empty, error, and success states in both themes.

## 14. Definition of Done
All consumer routes have a coherent application shell and pass responsive/accessibility regression checks without business logic changes.

## 15. Dependencies on previous stages
Requires Stages 1-4. Coordinate with Stage 7 for entry surfaces and Stage 8 for analytics visuals.
