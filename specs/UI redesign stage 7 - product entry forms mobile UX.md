# Stage 7 - Product Entry, Forms, and Mobile UX

## 1. Objective
Make product entry fast, low-friction, and reliable on handheld devices without reintroducing barcode scanning.

## 2. Scope
Manual Form, Scan Label (AI), Bulk Import, CSV review, invoice upload/review, edit forms, shared field primitives, validation, and save/cancel actions.

## 3. Pages/components affected
`AddProductFlow`; consumer/business add/edit forms; `CsvImport`; `InvoiceImport`; business import variants; shared form controls and review states.

## 4. UX requirements
Keep the three current options only: Manual Form, Scan Label (AI), Bulk Import. Manual entry should group name/category, quantity/unit, and optional expiry logically. Label extraction must show editable results and never invent expiry. Imports must show preview, validation, partial failure, retry, and success states.

## 5. Visual requirements
Use compact, high-clarity fields, clear required/optional treatment, inline errors, progress/review framing, and a sticky primary action where appropriate. Avoid long decorative introductions before fields.

## 6. Desktop behavior
Use efficient two-column grouping when fields fit, with review content and actions aligned. Preserve clear distinction between extraction preview and committed data.

## 7. Mobile behavior
At 320-414px restructure into compact sections rather than merely stacking desktop columns. Use keyboard-friendly input types, sensible numeric/unit grouping, quick expiry entry, sticky save actions, bottom sheets for option lists where useful, and minimize vertical scrolling.

## 8. Animation/motion requirements
Use upload progress, extraction pending, field validation, review reveal, and save success feedback. Avoid moving fields when errors appear; reserve space for status where practical.

## 9. Accessibility requirements
Labels and descriptions must be programmatically associated; errors use `aria-describedby`/live regions; file controls expose accepted formats; focus moves to review errors and returns after sheets/dialogs close.

## 10. Performance requirements
Compress/limit client previews, preserve upload limits, avoid duplicating server validation in ways that drift, and keep AI/import work asynchronous with cancellation or clear pending states.

## 11. Dependencies/libraries
Prefer existing `useActionState`, Zod-backed server validation, native inputs, and current upload flow. Add a date-picker or form library only with evidence from Stage 0 and explicit bundle justification.

## 12. Things explicitly NOT to change
No barcode tab, scanner package, lookup API, barcode provider, expiry derivation rules, import schemas, ownership checks, or server action contracts.

## 13. Acceptance criteria
A new item can be entered with minimal taps on 320px; label extraction remains editable and safe; CSV/invoice flows expose every validation state; forms work in all themes and with keyboard/screen readers.

## 14. Definition of Done
Manual, label, CSV, invoice, and edit workflows pass mobile-first task testing and retain all current safety/validation behavior.

## 15. Dependencies on previous stages
Requires Stages 1-6. Must coordinate with Stage 11 for final mobile/accessibility polish.
