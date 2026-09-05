# Stage 4 - Authentication and Onboarding

## 1. Objective
Make login, signup, verification, and account selection feel trustworthy, fast, and premium on small screens first.

## 2. Scope
Consumer/business auth page shells, login/signup forms, password controls, validation/error states, verification pending/success/error pages, and `get-started` account choice.

## 3. Pages/components affected
Consumer and business login/signup pages and forms; `AuthInput`; verification routes; `get-started`; shared auth layout/primitives.

## 4. UX requirements
Make the form the primary task immediately on mobile. Keep account type and business context explicit. Show pending, invalid credentials, duplicate email, SMTP-unavailable, verification-expired, and success states without losing entered values unnecessarily.

## 5. Visual requirements
Use a restrained auth composition with compact branding, strong form hierarchy, readable labels, premium focus/error states, and limited decorative media. Consumer and business should share structure but use contextual copy, not arbitrary color changes.

## 6. Desktop behavior
Use a balanced split or framed composition only when it supports trust and orientation. Keep form width controlled and error text near the relevant action.

## 7. Mobile behavior
At 320-414px remove or move decorative content below the form. Keep submit and alternate-account links reachable. Avoid excessive vertical content before the first input.

## 8. Animation/motion requirements
Use short page entrance and submit pending feedback. Verification transitions may use a single success reveal. Never delay form availability for animation.

## 9. Accessibility requirements
Use real labels, autocomplete, semantic form headings, field-level errors where possible, `aria-live` status, password visibility labels, keyboard order, and 44px touch targets.

## 10. Performance requirements
Avoid large auth hero media and unnecessary client wrappers. Keep Auth.js/server-action behavior unchanged and avoid hydration-dependent layout shifts.

## 11. Dependencies/libraries
Reuse existing `useActionState`, Auth.js, Lucide, and shared primitives. Do not add a form library unless Stage 0 proves repeated validation cannot be handled by primitives.

## 12. Things explicitly NOT to change
No credentials schema, verification token rules, session behavior, redirects, account isolation, SMTP requirements, database writes, or barcode scanning.

## 13. Acceptance criteria
A user can identify the account type, complete auth quickly on mobile, recover from every documented failure, navigate by keyboard, and understand verification state without ambiguity.

## 14. Definition of Done
Consumer and business auth flows pass visual, keyboard, reduced-motion, contrast, and responsive QA with unchanged Auth.js behavior.

## 15. Dependencies on previous stages
Requires Stages 1-2 and the existing auth/verification implementation.
