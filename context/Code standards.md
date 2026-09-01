# ShelfLife — Code Standards

## General

Write production-quality TypeScript.

Prefer readable, maintainable code over clever abstractions.

Do not rewrite working functionality without a clear reason.

Do not duplicate existing functionality.

Before creating a new component, check whether an existing reusable component can be extended.

---

# TypeScript

Use strict typing.

Avoid:

- `any`
- unnecessary type assertions
- unsafe casts
- duplicated interfaces

Prefer explicit domain types.

---

# React / Next.js

Follow the existing App Router architecture.

Use Server Components by default.

Use Client Components only when browser interactivity is required.

Examples:
- camera
- barcode scanner
- theme selector
- interactive forms
- charts requiring client state

Do not turn entire pages into Client Components unnecessarily.

---

# Server Actions

Server actions must:

1. Authenticate
2. Determine ownership
3. Validate input
4. Perform operation
5. Return safe results

Never accept userId/businessId from the client as the source of truth.

---

# Database

Use the existing Prisma-next database layer.

Do not introduce another ORM.

Do not create duplicate database models for functionality that already has a model.

Avoid unnecessary schema changes.

Any schema modification must have a concrete requirement.

---

# AI

Never expose AI chain-of-thought.

Never display:

`<think>`

or internal reasoning.

AI responses should be parsed and validated.

Do not blindly trust generated structured data.

---

# Inventory Safety

Expired products must remain excluded from recipe candidates.

Deterministic expiry logic has priority over AI output.

---

# Units

Never compare quantities using raw numbers if their units differ.

Example:

500 g and 1 kg must be normalized before comparison.

Preserve the original unit for display.

---

# Error Handling

Errors should be:

- understandable
- actionable
- visually consistent

Do not expose database stack traces to users.

Developer logs may contain technical information where appropriate.

---

# Loading States

Use contextual loading states.

Examples:

- Login submission
- Signup submission
- AI generation
- Invoice extraction
- Label scanning
- CSV processing
- Navigation where a meaningful delay exists

Do not add pointless loading animations to instant operations.

---

# UI

Use the ShelfLife design system.

Current intended palette:

- Warm cream
- Deep forest green
- Muted green
- Warm amber
- Terracotta/red
- Neutral slate/charcoal

The UI should not become monochromatic.

However, colors must have purpose.

Do not introduce random colors per card.

---

# Theme

All important UI elements must work in:

- Light
- Dark
- System

Avoid hardcoded white/black backgrounds that break dark mode.

Use semantic variables/tokens.

---

# Accessibility

Use:

- proper labels
- semantic buttons
- keyboard-friendly controls
- visible focus states
- sufficient contrast
- meaningful aria labels where needed

Do not use color as the only indicator of status.

---

# Responsive Design

All pages should work on:

- desktop
- laptop
- tablet
- mobile

Do not rely on fixed widths that cause horizontal overflow.

---

# Naming

Use descriptive names.

Components:
`PascalCase`

Functions:
`camelCase`

Types:
`PascalCase`

Constants:
`UPPER_SNAKE_CASE` where appropriate.

---

# Files

Keep route pages thin.

Keep business logic in:

`src/lib/`

Keep reusable UI in:

`src/components/`

Do not place large business logic directly inside page components.

---

# Dependencies

Do not install a dependency unless it solves a real requirement.

Prefer existing libraries already in the project.

---

# Testing

After meaningful changes:

`npm run build`

Fix all build errors.

Never declare a feature complete while the production build is broken.