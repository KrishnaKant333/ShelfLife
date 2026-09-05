# Stage 4 - Authentication and Onboarding

Status: Complete.

## Completion summary

The auth and onboarding experience was refreshed with the semantic token palette without changing any Auth.js behavior, account-type logic, or routing contracts. The split consumer/business layouts now have stronger contrast, improved focus states, clearer CTA hierarchy, and consistent lightweight surfaces. Verification, pending, and invalid-link states were aligned with the same visual language, and the account selection flow was tightened to emphasize the decision without adding friction.

The follow-up accessibility pass now places the form before the decorative context panel on mobile, announces authentication errors and verification progress through live regions, and gives password visibility controls full touch-sized targets. Desktop ordering remains the balanced split composition.

## Mobile density extension

Stage 4 also now covers the narrow-screen composition of the public entry experience. Repeated pricing cards, process steps, consumer/business value cards, and account-choice cards use horizontal snap rails on small screens instead of stacking every item vertically. Pricing features use a compact two-column list on mobile. These rails preserve full card content, expose the next item as a discoverable affordance, support touch scrolling, and return to the existing grid layouts at larger breakpoints.

## Validation

- Production build verified with `npm run build`
- Theme-safe token pass confirmed for standard light/dark usage
- Focus and contrast hygiene checked across auth entry points and verification states
- Mobile repeated-card layouts use horizontal snap scrolling instead of long vertical stacks
- Desktop grid layouts remain active from the existing responsive breakpoints upward

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
