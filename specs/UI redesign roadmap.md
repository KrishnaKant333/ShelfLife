# ShelfLife UI Redesign Roadmap

Status: Planning only. No implementation is authorized by this specification set.

## Product boundary

This redesign changes presentation, interaction, information hierarchy, responsive structure, and visual system only. It must preserve authentication rules, Consumer/Business isolation, ownership checks, expiry and quantity logic, unit normalization, FIFO, waste calculations, recipe safety, AI safety, pricing rules, and server action contracts.

Barcode scanning and external barcode lookup remain deferred and hidden. The Add New Product flow remains limited to Manual Form, Scan Label (AI), and Bulk Import.

## Current architecture anchors

- Public experience: `src/app/(marketing)/page.tsx`, `Navbar.tsx`, marketing section components, pricing, footer.
- Auth/onboarding: consumer/business login and signup pages, verification pages, `get-started`.
- Shared authenticated shell: `DashboardShell.tsx`, `Sidebar.tsx`, `Toast.tsx`, `ConfirmDialog.tsx`.
- Consumer-only feature: Recipes.
- Business-only feature: Inventory Strategy.
- Shared feature surfaces: overview, inventory, product detail/edit, alerts, analytics, waste, notifications, settings, CSV and invoice entry.
- Global theme/tokens: `src/app/globals.css`, `ThemeProvider.tsx`, `ThemeToggle.tsx`.

## Stage order

| Stage | Name | Depends on |
|---|---|---|
| 0 | UI Audit and Design Foundation | Existing product baseline |
| 1 | Design System, Typography, and Theme | 0 |
| 2 | Core Layout, Navigation, and Responsive Foundation | 1 |
| 3 | Landing Page and Marketing Experience | 1, 2 |
| 4 | Authentication and Onboarding | 1, 2 |
| 5 | Consumer Application | 1, 2, 4 |
| 6 | Business Application | 1, 2, 4, 5 |
| 7 | Product Entry, Forms, and Mobile UX | 1, 2, 4, 5, 6 |
| 8 | Analytics, Charts, and Data Visualization | 1, 2, 5, 6 |
| 9 | AI, Recipes, Insights, and Waste Experiences | 1, 2, 5, 6, 7 |
| 10 | Advanced Motion, Scroll Storytelling, and Selective 3D | 1, 2, 3, 5, 6, 8, 9 |
| 11 | Mobile Polish and Accessibility | 1-10 |
| 12 | Performance and Final Visual QA | 1-11 |

## Execution rules

1. Implement one stage at a time and do not pull work forward from later stages.
2. Each stage must preserve the existing route, action, ownership, and data contracts unless a non-breaking presentation adapter is required.
3. Run focused checks after each stage and `npm run build` at stage checkpoints.
4. Validate light, dark, and system themes at every visual stage.
5. Validate 320, 375, 390, 414, tablet, desktop, and large desktop layouts before closing a stage.
6. Respect `prefers-reduced-motion`; every nonessential animation needs a reduced-motion alternative.
7. Prefer existing dependencies and CSS primitives. Add a dependency only under the stage specification's stated justification.
8. Do not reintroduce barcode scanning or a barcode provider as part of this redesign.

## Obsolete or superseded specifications

- The original ordered P0-P2 implementation specifications remain the historical product roadmap and are not replaced.
- The previous P2 polish completion is a baseline, not a redesign plan.
- These UI redesign specifications supersede any future request to make ad hoc page-level visual changes without first identifying the relevant stage.

## Current status

Stages 0 through 12 are complete. Stage 0 findings are recorded in `specs/UI redesign stage 0 audit report.md`; Stage 1 implementation and the token contract are recorded in `specs/UI redesign stage 1 report.md`; Stage 2 shell work is recorded in `specs/UI redesign stage 2 report.md`; Stage 3 marketing completion is recorded in `specs/UI redesign stage 3 report.md`; Stage 4 auth and onboarding details are recorded in `specs/UI redesign stage 4 - auth onboarding.md` and the completion report in `specs/UI redesign stage 4 report.md`; Stage 5 consumer application completion is recorded in `specs/UI redesign stage 5 report.md`; Stage 6 business application completion is recorded in `specs/UI redesign stage 6 report.md`; Stage 7 product entry completion is recorded in `specs/UI redesign stage 7 report.md`; Stage 8 analytics completion is recorded in `specs/UI redesign stage 8 report.md`; Stage 9 AI, recipes, insights, and waste completion is recorded in `specs/UI redesign stage 9 report.md`; Stage 10 motion completion is recorded in `specs/UI redesign stage 10 report.md`; Stage 11 mobile/accessibility completion is recorded in `specs/UI redesign stage 11 report.md`; Stage 12 final QA is recorded in `specs/UI redesign stage 12 report.md`.

## Recommended starting point

The redesign roadmap is complete. Remaining work is operational deployment QA: configure SMTP, run external device/browser and screen-reader matrices, and address the documented legacy lint backlog separately from the shipped visual redesign.
