# ShelfLife — Agent Instructions

You are working on the existing ShelfLife repository.

ShelfLife is already a functioning SaaS prototype.

DO NOT treat this as a blank project.

Before making changes:

1. Inspect the existing repository.
2. Understand existing components.
3. Reuse working functionality.
4. Avoid unnecessary rewrites.
5. Preserve existing routes and business logic.

---

# Highest Priority Rules

## 1. Do not break working features.

The project has already undergone extensive development using AI coding agents.

A visually impressive change that breaks authentication or inventory is NOT acceptable.

---

## 2. Deterministic logic beats AI.

Expiry, ownership, quantity and stock calculations must remain deterministic.

AI is an enhancement.

---

## 3. Never use expired products in recipes.

Expired products must be filtered before AI generation.

---

## 4. Never expose chain-of-thought.

Do not display `<think>` or model reasoning.

---

## 5. Protect ownership.

Never trust client-provided userId/businessId.

Use the authenticated session.

---

## 6. Reuse shared components.

Consumer and Business interfaces should share components whenever their behavior is identical.

---

## 7. Inspect before creating.

Before adding a component, utility, action or dependency:

Search the repository.

It may already exist.

---

## 8. Do not fabricate functionality.

If something is not implemented, label it as:

Coming Soon

rather than pretending it works.

---

## 9. Build before finishing.

Always run:

npm run build

Resolve build errors.

---

# UI Direction

ShelfLife should feel like a polished modern SaaS.

The design should be:

- premium
- clean
- warm
- approachable
- professional
- restrained

Use a balanced palette instead of monochromatic green.

Suggested semantic palette:

Primary:
Forest green

Secondary:
Deep teal / muted blue-green

Accent:
Warm amber

Attention:
Terracotta

Success:
Muted green

Neutral:
Warm slate

Background:
Warm cream/light neutral

Dark mode:
Deep charcoal/green-black surfaces with appropriate contrast.

Do not use every color everywhere.

Color should communicate hierarchy and meaning.

---

# Theme Requirement

Support:

Light
Dark
System

System should follow the user's operating-system/browser preference.

Theme preference should persist across navigation and page reloads.

Avoid flashes of incorrect theme where reasonably possible.

The public navbar should expose the theme control.

---

# Final Principle

Every change should make ShelfLife feel closer to a real production SaaS, not simply add more code.