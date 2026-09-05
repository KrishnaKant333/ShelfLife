# Stage 0 Audit Report - UI Redesign Foundation

Status: Complete as an audit artifact. No application or UI implementation changes were made.
Audit date: 2026-09-05
Source baseline: completed P0-P2 product roadmap; barcode scanning deferred/hidden.

## 1. Audit boundary

Audited the App Router route tree, public/authenticated layouts, shared navigation, themes, global CSS, marketing components, auth forms, consumer/business dashboards, inventory/product entry, imports, analytics, recipes, waste, strategy, settings, notifications, loading states, empty/error feedback, and current dependencies.

Preserved boundaries:

- Auth.js credentials sessions, email verification, redirects, and account-type isolation.
- Consumer `userId` ownership and Business `userId` plus `businessId` ownership.
- Deterministic expiry, quantity/unit normalization, FIFO, waste, strategy, and recipe safety.
- AI as an untrusted assistance layer.
- Barcode scanning and external barcode lookup remain deferred and hidden.

## 2. Route and surface matrix

| Surface | Routes | Primary task | Current state coverage | Redesign priority |
|---|---|---|---|---|
| Marketing | `/` | Understand value and start | Static composition; CTA/footer states | P1 |
| Onboarding | `/get-started` | Choose Consumer or Business | Static selection | P2 |
| Consumer auth | `/consumer/login`, `/consumer/signup` | Authenticate or create account | Pending and inline errors | P1 |
| Business auth | `/business/login`, `/business/signup` | Authenticate or create account | Pending and inline errors | P1 |
| Verification | `/verify-email`, `/verify-email/pending` | Verify account and understand status | Success/error/pending copy | P2 |
| Consumer overview | `/dashboard` | Triage inventory and next action | Loading, empty, AI/error states | P1 |
| Business overview | `/business/dashboard` | Triage operations and risk | Loading, empty, AI/error states | P1 |
| Inventory | `/dashboard/inventory`, `/business/dashboard/inventory` | Search, filter, sort, select, act | Loading, empty, filtered-empty, action feedback | P1 |
| Product detail/edit | `/dashboard/inventory/[id]`, `/business/dashboard/inventory/[id]` and edit routes | Inspect, edit, consume, delete | Not-found and form errors | P2 |
| Product entry | `/dashboard/inventory/new`, business equivalent | Add inventory | Manual, label, CSV/invoice links; pending/errors | P1 |
| CSV/invoice import | Consumer and Business import/invoice routes | Review and save extracted/imported items | Preview/errors/pending/success | P1 |
| Alerts | Consumer and Business `/alerts` | Resolve urgent inventory attention | Loading, empty, action states | P2 |
| Analytics | Consumer and Business `/analytics` | Understand current inventory health | Loading and empty; custom bars | P2 |
| Waste | Consumer and Business `/waste` | Prioritize use-first and risk | Loading, empty, action feedback | P2 |
| Recipes | `/dashboard/recipes` | Generate safe recipes and consume ingredients | Loading, errors, empty, modal | P2 |
| Strategy | `/business/dashboard/strategy` | Review business inventory strategy | Loading, empty, advisory output | P2 |
| Notifications | Consumer and Business `/notifications` | Review computed attention items | Empty and list states | P2 |
| Settings | Consumer and Business `/settings` | Profile, preferences, appearance | Saved feedback; theme controls | P3 |

## 3. Current architecture findings

### Strengths

- Server components and server actions already define clear data/ownership boundaries.
- Consumer and Business routes are isolated at layout/proxy boundaries while sharing feature presentation where behavior matches.
- Existing `DashboardShell` and `Sidebar` provide a useful shell foundation with desktop collapse and mobile drawer behavior.
- Product entry already has the required three options: Manual Form, Scan Label (AI), and Bulk Import.
- AI, imports, destructive actions, recipes, and exports have meaningful pending/error paths.
- Light, Dark, and System themes are already wired through `next-themes`.

### Structural gaps

- There is no dedicated auth layout, route-level `error.tsx`, or route-level `not-found.tsx` system.
- `ToastProvider` is mounted locally in feature components rather than once at a shared application boundary.
- Consumer/business loading components are substantially duplicated.
- Auth forms duplicate layout, input, password, focus, and error markup; `AuthInput.tsx` exists but is empty.
- Most UI styling is repeated inline Tailwind token syntax rather than semantic primitives.
- `shelf-card` is the only meaningful shared visual class; buttons, inputs, badges, sheets, tables, and skeletons are not centralized.
- Analytics uses hand-built bars and a score ring; there is no charting abstraction or historical analytics model.
- Pricing feature lists are partly hard-coded separately from plan definitions and require copy truth review.

## 4. Visual system audit

### Current tokens

Global tokens are in `src/app/globals.css`: forest, sage, cream, surface, amber, terracotta, blue, dark, muted, border, green, background, and warning/success/info semantic colors. Dark mode overrides the same names.

### Current repeated patterns

- `rounded-2xl` dominates panels and cards.
- `bg-[var(--shelf-surface)]`, `border-[var(--shelf-border)]`, and `shadow-sm` are repeated across feature components.
- Typography is primarily Geist with no explicit display/UI/body scale.
- Marketing and dashboard surfaces share many visual primitives despite different density needs.
- Green/forest is used for many primary actions, active states, headings, icons, and success states.
- Surface translucency and backdrop effects exist, but hierarchy is not expressed through a documented elevation system.

### Foundation decisions for Stage 1

- Keep forest/food identity but introduce neutral, warm, and restrained secondary accents so every state is not green.
- Define semantic tokens for canvas, raised surface, inset surface, border, text, muted text, action, focus, success, warning, danger, and info separately for light/dark themes.
- Define display, heading, body, label, data, and code typography roles with explicit line heights.
- Define a small radius scale and elevation scale rather than allowing arbitrary rounded cards everywhere.
- Establish marketing composition tokens separately from application density tokens.
- Keep all status meaning available in text/icon/badge form, never color alone.

## 5. Responsive audit matrix

| Width | Current risk | Required redesign response |
|---|---|---|
| 320px | Auth and entry content can become vertically excessive; dense controls compete for width | Form-first auth, compact field groups, sticky primary action, no decorative dependency |
| 375px | Inventory filters/actions can wrap unpredictably; modal content can feel cramped | Bottom-sheet filters, priority action row, full-screen mobile sheets |
| 390px | Typical phone width needs one-handed reach and stable text | Thumb-reachable primary actions, compact rows, preserved labels/status |
| 414px | Extra width can expose inconsistent max-width and spacing | Use content-driven max widths; do not simply scale type or decoration |
| Tablet | Desktop sidebar/table assumptions may appear too dense or too sparse | Intermediate navigation and two-column rules based on content fit |
| 1280px | Dashboard content/sidebar balance and table density need hierarchy | Stable shell, bounded content canvas, clear primary dataset |
| 1440px | Unused horizontal space can weaken scan rhythm | Constrained reading measure plus intentional secondary panels |
| 1920px | Stretching cards/charts reduces information density | Max-width rules and deliberate multi-column compositions |

Structural mobile rules: desktop tables become focused lists or drill-down sheets; filter groups become sheets; dialogs become bottom sheets/full-screen flows where appropriate; two-column forms become semantic sections, not merely stacked fields; secondary explanatory copy moves below the action.

## 6. State coverage audit

### Covered and reusable

- Route loading skeletons exist for consumer dashboard, inventory, alerts, analytics, recipes, waste and several business equivalents.
- Inventory has empty, filtered-empty, loading-history, history-error, destructive pending, export pending, and toast feedback.
- Recipes, imports, invoice/label extraction, waste actions, and settings expose local pending/error/success states.
- Empty states exist for inventory, alerts, analytics, recipes, waste, strategy, notifications, and activity.

### Standardization targets

- Create shared loading/skeleton patterns rather than consumer/business copies.
- Add route-level error and not-found shells while retaining feature-level details.
- Standardize error blocks, retry actions, inline field errors, toasts, and success confirmation.
- Define skeleton geometry so loading does not shift the final layout.
- Define empty-state anatomy: context, explanation, primary action, optional secondary action.

## 7. Accessibility audit priorities

1. Preserve and extend dialog focus management, Escape behavior, focus restoration, and labelled descriptions.
2. Replace text glyphs used for sidebar collapse with a proper icon and accessible label.
3. Ensure every icon-only button has a stable accessible name and tooltip where unfamiliar.
4. Audit heading order and landmarks across marketing/auth/dashboard pages.
5. Audit native controls in dark mode, especially date/select inputs and form error contrast.
6. Ensure charts expose text summaries/data tables and do not rely on hover-only information.
7. Test keyboard traversal through mobile drawers, sheets, filters, recipe dialogs, confirmation dialogs, and import review.
8. Test `prefers-reduced-motion`, zoom, long labels, long errors, and screen-reader announcements for async states.

## 8. Motion audit

### Keep or formalize

- Short hover/press transitions.
- Drawer/sidebar open-close transitions.
- Loading spinners for active asynchronous work.
- Progress and status transitions where data changes.

### Replace or constrain

- Global transitions should not make every theme/layout change feel slow.
- Hero floating effects should remain limited to marketing and receive reduced-motion fallbacks.
- Avoid reanimating complete inventory lists, dashboard panels, or charts on every route refresh.
- No scroll-jacking, perpetual dashboard motion, or decorative motion in forms.

Stage 10 decides whether a motion library or selective Three.js experiment is justified. No such dependency is justified by this audit alone.

## 9. Performance and dependency audit

- Existing stack is sufficient for Stages 0-7: Next App Router, Tailwind CSS, Lucide, next-themes, Next Image, and native controls.
- `html5-qrcode` is installed but barcode scanning is deferred/hidden; it must not be activated by redesign work. Its removal is a separate dependency decision, not part of this visual audit.
- No chart library is currently installed. Stage 8 should evaluate one focused option only if accessibility and interaction justify it.
- Motion/GSAP and Three.js are not baseline dependencies. Stage 10 must prototype and measure before adding either.
- `@vercel/analytics` is already part of the root layout; preserve it and verify it does not affect layout or consent requirements during implementation.
- Image dimensions and font loading require explicit review to avoid layout shift. Existing logo usage has generated width/height warnings and should be corrected in a later implementation stage.
- Client components are concentrated in interaction-heavy views, but shared providers and feature components should be reviewed before expanding client boundaries.

## 10. Prioritized findings

### P0 - foundation blockers

- No semantic design-token/primitives layer for the redesign to build on.
- Mobile auth and product entry are not yet structured around the primary task.
- Shared dashboard/auth shell patterns are duplicated and inconsistent.
- No complete route-level error/not-found presentation system.

### P1 - high-value product polish

- Inventory, dashboard, analytics, waste, recipes, and strategy surfaces need a consistent information hierarchy and density model.
- Theme token contrast and semantic status treatment need a deliberate light/dark redesign.
- Forms, sheets, dialogs, tables, charts, skeletons, empty states, and toasts need shared primitives.
- Marketing claims and pricing feature presentation need an implementation-truth pass during Stage 3.

### P2 - refinement and performance

- Advanced motion and selective 3D require measured, purpose-driven prototypes.
- Chart library selection, font refinement, image optimization, and dependency cleanup should follow evidence rather than precede it.
- Visual regression and route-by-route responsive QA need to be formalized in Stage 12.

## 11. Stage 1 handoff

Stage 1 should begin by converting the token inventory into semantic light/dark/system tokens and a small primitive set for typography, buttons, fields, tabs, badges, alerts, surfaces, dialogs/sheets, skeletons, empty states, tables, and chart scaffolding.

Stage 1 must not redesign individual pages, add motion/3D libraries, introduce charts, change business logic, or reintroduce barcode scanning.

## 12. Stage 0 definition of done

- Route/component matrix completed.
- Current token and repeated-pattern inventory recorded.
- Desktop/mobile breakpoint risks recorded.
- State, accessibility, motion, dependency, and performance risks prioritized.
- Stage 1 handoff is explicit.
- No application source files modified during the audit.
