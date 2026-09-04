# Implementation Plan: ShelfLife UI Overhaul + Theme System

## Overview

Full visual polish pass across the entire ShelfLife application. The work is organised into three tiers: **P0** fixes critical broken infrastructure (undefined CSS variable, non-functional dark mode), **P1** addresses high-priority UI correctness issues, and **P2–P4** cover the polish and consistency pass across all pages. Each task is self-contained and implementable by a single agent.

---

## Tasks

### P0 — Critical Infrastructure (must complete before any visual work)

- [x] 1. Fix undefined `--background` CSS variable
  - In `src/app/globals.css`, add `--background: var(--shelf-surface)` to `:root` and `.dark` blocks
  - This unblocks `Navbar.tsx`, `Footer.tsx`, and all 4 auth pages (`/consumer/login`, `/consumer/signup`, `/business/login`, `/business/signup`) which reference `bg-[var(--background)]`
  - Do not change any of those files — only fix the variable definition
  - _Requirements: P19 (design tokens), P0 (theme system)_

- [x] 2. Install `next-themes` and create `ThemeProvider`
  - [x] 2.1 Install `next-themes` as a production dependency
    - Run: `npm install next-themes`
    - _Requirements: P0 (theme system)_
  - [x] 2.2 Create `src/components/ThemeProvider.tsx`
    - Wrap `next-themes`' `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`
    - Export as a named `"use client"` component
    - _Requirements: P0_
  - [x] 2.3 Update `src/app/layout.tsx`
    - Wrap `{children}` with `<ThemeProvider>`
    - Fix metadata: set `title` to `"ShelfLife"` and `description` to `"Smart inventory management for households and businesses"`
    - Remove the unused `Navbar` import that was left in but not rendered
    - _Requirements: P0, P8 (root layout metadata)_

- [x] 3. Add theme toggle to the public Navbar
  - [x] 3.1 Create `src/components/ThemeToggle.tsx`
    - Client component using `useTheme` from `next-themes`
    - Renders a compact icon button cycling Light → Dark → System (or use a three-state dropdown)
    - Use `Sun`, `Moon`, `Monitor` icons from `lucide-react`
    - Style using existing CSS variables; avoid hard-coded colours
    - On initial mount use `mounted` guard to avoid hydration mismatch
    - _Requirements: P2 (navbar theme control), P0_
  - [x] 3.2 Add `<ThemeToggle />` to `src/components/Navbar.tsx`
    - Place it in the desktop nav between the sign-in link and the "Get Started" button
    - Also add it to the mobile drawer menu
    - _Requirements: P2_

---

### P1 — High-Priority UI Fixes

- [x] 4. Replace hardcoded `bg-white` with `bg-[var(--shelf-surface)]`
  - Apply to every occurrence listed below. Change only `bg-white`; do not alter logic, layout, or other classes.
  - [x] 4.1 `src/components/dashboard/InventoryView.tsx`
    - Export CSV button, Export PDF button, import link button, active filter pill (`bg-white` → `bg-[var(--shelf-surface)]`), consume modal container and cancel button
    - _Requirements: P7, P19_
  - [x] 4.2 `src/components/dashboard/WasteView.tsx`
    - At-risk item row, "Use in Recipes" button, modal container, cancel button
    - _Requirements: P11, P19_
  - [x] 4.3 `src/components/dashboard/RecipesView.tsx`
    - Inactive recipe mode selector button, recipe detail modal container, Close button
    - _Requirements: P12, P19_
  - [x] 4.4 `src/components/dashboard/StrategyView.tsx`
    - Recommendation detail box, FIFO table container, pending item card
    - _Requirements: P6, P19_
  - [x] 4.5 `src/components/dashboard/InvoiceImport.tsx`
    - Invoice analysis stats box
    - _Requirements: P8, P19_
  - [x] 4.6 `src/components/dashboard/AddProductForm.tsx` and `src/components/dashboard/EditProductForm.tsx`
    - Form wrapper `rounded-2xl bg-white`
    - _Requirements: P8, P19_
  - [x] 4.7 `src/components/dashboard/DashboardUseFirst.tsx`
    - Item row container
    - _Requirements: P5, P19_
  - [x] 4.8 `src/components/Navbar.tsx`
    - Mobile menu toggle button `bg-white`
    - _Requirements: P2, P19_
  - [x] 4.9 `src/components/Hero.tsx`, `src/components/FinalCTA.tsx`, `src/components/ConsumerValue.tsx`
    - Tag/badge `bg-white` and secondary CTA button `bg-white`; replace with `bg-[var(--shelf-surface)]`
    - _Requirements: P3, P19_
  - [x] 4.10 `src/components/InventoryHeroVisual.tsx`
    - Floating card backgrounds (`bg-white`)
    - _Requirements: P3, P19_

- [x] 5. Replace `alert()` / `confirm()` with inline UI feedback
  - [x] 5.1 Create a reusable `src/components/ui/Toast.tsx` component
    - Lightweight client component; accepts `message: string` and `type: "success" | "error"`
    - Renders as a fixed overlay notification (bottom-right) that auto-dismisses after 4 s
    - Uses CSS variable colours: success → `--shelf-forest`, error → `--shelf-terracotta`
    - Export a `useToast()` hook (or context) for triggering toasts from any component
    - _Requirements: P15, P16_
  - [x] 5.2 Create a reusable `src/components/ui/ConfirmDialog.tsx` component
    - Renders an inline modal with title, body text, confirm and cancel buttons
    - Accepts `onConfirm`, `onCancel`, `title`, `message` props
    - Style using `--shelf-surface`, `--shelf-border`, `--shelf-dark` variables
    - _Requirements: P16_
  - [x] 5.3 Replace `alert()` / `confirm()` in `src/components/dashboard/InventoryView.tsx`
    - Replace error/success `alert()` calls with `useToast()`
    - Replace both `confirm()` calls (bulk delete, bulk consume) with `ConfirmDialog`
    - _Requirements: P7, P16_
  - [x] 5.4 Replace `alert()` calls in `src/components/dashboard/WasteView.tsx`
    - Replace success and error `alert()` calls with `useToast()`
    - _Requirements: P11, P16_
  - [x] 5.5 Replace `alert()` calls in `src/components/dashboard/RecipesView.tsx`
    - Replace all `alert()` calls (no-ingredients, success, error) with `useToast()`
    - _Requirements: P12, P16_
  - [x] 5.6 Replace `window.confirm()` in `src/components/dashboard/DeleteProductButton.tsx` and `src/components/business/DeleteBusinessProductButton.tsx`
    - Replace with `ConfirmDialog`; retain the same delete action on confirmation
    - _Requirements: P16_

- [x] 6. Add route-level loading skeletons
  - [x] 6.1 Create `src/app/dashboard/loading.tsx`
    - Skeleton layout matching the consumer dashboard overview (page header area + 4 stat card placeholders + two widget placeholders)
    - Use `animate-pulse` and `bg-[var(--shelf-border)]` for skeleton shapes
    - _Requirements: P15_
  - [x] 6.2 Create `src/app/dashboard/inventory/loading.tsx`
    - Skeleton matching the inventory table (header row + 5–6 row placeholders)
    - _Requirements: P15_
  - [x] 6.3 Create `src/app/dashboard/analytics/loading.tsx`
    - Skeleton matching the analytics layout (metric cards row + chart placeholder)
    - _Requirements: P15_
  - [x] 6.4 Create `src/app/dashboard/alerts/loading.tsx`
    - Skeleton matching the alerts list (3–4 alert row placeholders)
    - _Requirements: P15_
  - [x] 6.5 Create `src/app/dashboard/waste/loading.tsx`
    - Skeleton matching the waste view sections
    - _Requirements: P15_
  - [x] 6.6 Create `src/app/dashboard/recipes/loading.tsx`
    - Skeleton matching the recipes prompt/card area
    - _Requirements: P15_
  - [x] 6.7 Create `src/app/business/dashboard/loading.tsx`
    - Mirror of consumer overview skeleton (same structure)
    - _Requirements: P15_
  - [x] 6.8 Create `src/app/business/dashboard/inventory/loading.tsx`
    - Mirror of consumer inventory skeleton
    - _Requirements: P15_
  - [x] 6.9 Create `src/app/business/dashboard/analytics/loading.tsx`
    - Mirror of consumer analytics skeleton
    - _Requirements: P15_
  - [x] 6.10 Create `src/app/business/dashboard/alerts/loading.tsx`
    - Mirror of consumer alerts skeleton
    - _Requirements: P15_
  - [x] 6.11 Create `src/app/business/dashboard/waste/loading.tsx`
    - Mirror of consumer waste skeleton
    - _Requirements: P15_

- [x] 7. Remove unused three.js dependencies
  - In `package.json`, remove `three`, `@react-three/fiber`, `@react-three/drei`
  - Run `npm install` to update `package-lock.json`
  - Verify no source file imports from these packages (confirmed: zero imports in `src/`)
  - _Requirements: P20 (do not break build)_

- [x] 8. Checkpoint — build must pass after P0 + P1
  - Run `npm run build` and fix any TypeScript or module errors before proceeding
  - Ensure all tasks 1–7 are complete first

---

### P2 — Sidebar and Dashboard Shell Dark Mode

- [x] 9. Fix Sidebar dark mode issues (`src/components/dashboard/Sidebar.tsx`)
  - Replace `hover:bg-red-50` on the sign-out button with `hover:bg-[var(--shelf-terracotta)]/10`
  - Confirm all other sidebar colours use CSS variables (they do — just patch the sign-out button)
  - _Requirements: P14_

- [x] 10. Make dashboard greeting time-aware
  - In `src/app/dashboard/page.tsx`, replace the hardcoded `"Good morning"` with a server-side time-of-day greeting: "Good morning" (5–11), "Good afternoon" (12–17), "Good evening" (18–4)
  - Use `new Date()` on the server; no client-side state needed
  - Apply the same fix to `src/app/business/dashboard/page.tsx` (currently says "Welcome back" — also make it time-aware for consistency)
  - _Requirements: P5, P6_

---

### P3 — Theme Toggle in Settings

- [x] 11. Add theme selector section to Settings page (`src/components/dashboard/SettingsView.tsx`)
  - Add a "Appearance" section to the settings view
  - Render three selectable options: Light, Dark, System
  - Use `useTheme` from `next-themes` to read and set the theme
  - Highlight the active option using `--shelf-forest` border/background
  - Include icons (`Sun`, `Moon`, `Monitor`) from `lucide-react`
  - _Requirements: P13_

---

### P4 — Polish: Dark Mode Token Audit for Public Pages

- [x] 12. Audit and fix dark mode on marketing/public pages
  - [x] 12.1 `src/components/Navbar.tsx` — verify backdrop, mobile drawer, and all text use CSS variables (fix any remaining raw colour values)
    - _Requirements: P2_
  - [x] 12.2 `src/components/Footer.tsx` — verify all colours use CSS variables
    - _Requirements: P3_
  - [x] 12.3 `src/app/(marketing)/page.tsx` — spot-check the landing page for raw `bg-white`, `text-black`, `border-gray-*`; replace with semantic tokens
    - _Requirements: P3_
  - [x] 12.4 `src/components/Hero.tsx`, `src/components/ConsumerValue.tsx`, `src/components/BusinessValue.tsx`, `src/components/HowItWorks.tsx`, `src/components/Pricing.tsx`, `src/components/WasteReduction.tsx`, `src/components/AIApproach.tsx`, `src/components/FinalCTA.tsx`
    - Scan each file for raw colour classes that would break dark mode; replace with CSS variable equivalents
    - _Requirements: P3_

- [x] 13. Audit and fix dark mode on auth pages
  - [x] 13.1 `src/app/consumer/login/page.tsx` and `src/app/consumer/signup/page.tsx`
    - Verify form panel and card backgrounds use `--shelf-surface`; fix any `bg-white` or `text-black` found
    - _Requirements: P4_
  - [x] 13.2 `src/app/business/login/page.tsx` and `src/app/business/signup/page.tsx`
    - Same audit as 13.1
    - _Requirements: P4_
  - [x] 13.3 `src/components/auth/ConsumerLoginForm.tsx`, `ConsumerSignupForm.tsx`, `BusinessLoginForm.tsx`, `BusinessSignupForm.tsx`, `AuthInput.tsx`
    - Confirm all form inputs, labels, and error states use CSS variable colours
    - _Requirements: P4_

---

### P5 — Polish: Dashboard Views Dark Mode Audit

- [ ] 14. Audit and fix dark mode in dashboard view components
  - [-] 14.1 `src/components/dashboard/AlertsView.tsx`
    - Replace `bg-green-50 text-green-700` (empty state icon container) and `bg-red-50 text-[var(--shelf-terracotta)]` badge, `bg-amber-50 text-[var(--shelf-amber)]` badge with dark-mode-safe equivalents using `--shelf-terracotta`, `--shelf-amber` at low opacity
    - _Requirements: P10_
  - [~] 14.2 `src/components/dashboard/AnalyticsView.tsx`
    - Ensure chart colour palettes and metric card backgrounds all use CSS variable tokens; no raw colour strings
    - _Requirements: P9_
  - [-] 14.3 `src/components/dashboard/StatCard.tsx`
    - Confirm card uses `--shelf-surface` and `--shelf-border`; no `bg-white`
    - _Requirements: P5, P6_
  - [-] 14.4 `src/components/dashboard/ExpiryOverview.tsx` and `src/components/dashboard/InventoryOverview.tsx`
    - Confirm section cards use `--shelf-surface`; fix any raw colour classes
    - _Requirements: P5, P6_
  - [-] 14.5 `src/components/dashboard/QuickActions.tsx`
    - Fix any raw colour values in action button styles
    - _Requirements: P5, P6_
  - [-] 14.6 `src/components/dashboard/DashboardAiInsights.tsx`
    - Confirm insight card and loading state use CSS variable tokens
    - _Requirements: P5, P6_
  - [~] 14.7 `src/components/dashboard/AddProductFlow.tsx`
    - Fix any `bg-white` in tab indicators, scanner area, upload area
    - _Requirements: P8_
  - [~] 14.8 `src/components/dashboard/CsvImport.tsx` and `src/components/business/BusinessCsvImport.tsx`
    - Fix any hardcoded light-mode colours
    - _Requirements: P8_
  - [~] 14.9 `src/components/business/BusinessAddProductForm.tsx`, `BusinessEditProductForm.tsx`
    - Mirror the fix applied to `AddProductForm.tsx` / `EditProductForm.tsx` in task 4.6
    - _Requirements: P6, P19_
  - [~] 14.10 `src/components/business/BusinessInvoiceUpload.tsx`
    - Verify no `bg-white` in the analysis stats box or upload area
    - _Requirements: P6, P8_

---

### P6 — Cleanup

- [x] 15. Remove `src/lib/db-test.ts`
  - Delete the file; confirm nothing imports it
  - _Requirements: P20 (codebase hygiene)_

---

### Final Checkpoint

- [~] 16. Full build verification and smoke check
  - Run `npm run build` and resolve any TypeScript errors or missing module errors
  - Manually verify theme switching (Light / Dark / System) persists across navigation and reload
  - Confirm all 4 auth pages render correctly in both light and dark themes
  - Confirm consumer and business dashboards both render in dark mode without white flash or raw white cards
  - Confirm sidebar sign-out hover state works in dark mode
  - Confirm `alert()` / `confirm()` are gone from InventoryView, WasteView, RecipesView, DeleteProductButton, DeleteBusinessProductButton

---

## Notes

- Tasks 1–3 are strict prerequisites. Do not start tasks 4–16 until task 3 is complete and the build passes.
- Task 8 (checkpoint build) must pass before the polish tasks begin.
- Tasks in the same parent group (e.g. all 4.x tasks) are independent and can run in parallel.
- Tasks marked with `*` are optional and can be skipped for a faster MVP — there are none in this plan; all tasks are required for the definition of done.
- The `--background` alias intentionally maps to `--shelf-surface` so existing auth page references keep working without touching those pages.
- `next-themes` applies the `dark` class to `<html>`, which activates the `.dark` block already defined in `globals.css` — no additional CSS changes needed for the dark token set.
- Do NOT modify: Auth.js logic, database ownership, Consumer/Business separation, Groq integration, inventory CRUD, expiry logic, quantity normalisation, imports/exports, barcode, label scanning, FIFO, Inventory Strategy, recipe safety logic.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3", "7"] },
    { "id": 4, "tasks": ["3.1"] },
    { "id": 5, "tasks": ["3.2"] },
    { "id": 6, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "4.10"] },
    { "id": 7, "tasks": ["5.1", "5.2"] },
    { "id": 8, "tasks": ["5.3", "5.4", "5.5", "5.6"] },
    { "id": 9, "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7", "6.8", "6.9", "6.10", "6.11"] },
    { "id": 10, "tasks": ["8"] },
    { "id": 11, "tasks": ["9", "10", "11", "15"] },
    { "id": 12, "tasks": ["12.1", "12.2", "12.3", "12.4"] },
    { "id": 13, "tasks": ["13.1", "13.2", "13.3"] },
    { "id": 14, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5", "14.6", "14.7", "14.8", "14.9", "14.10"] },
    { "id": 15, "tasks": ["16"] }
  ]
}
```
