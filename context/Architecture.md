# ShelfLife — Architecture

## Technology Stack

Frontend:
- Next.js 16.3.2
- React
- TypeScript
- Tailwind CSS

Backend:
- Next.js server actions/routes
- Auth.js
- PostgreSQL / Neon

Database:
- Prisma-next

AI:
- Groq
- qwen/qwen3.6-27b

---

# High-Level Architecture

Browser
    ↓
Next.js App Router
    ↓
Authentication / Session
    ↓
Server Components / Server Actions
    ↓
Database / AI services
    ↓
PostgreSQL / Groq

---

# Application Structure

Conceptually:

src/
├── app/
│   ├── page.tsx
│   ├── get-started/
│   ├── login/
│   ├── signup/
│   ├── business/
│   ├── dashboard/
│   └── business/dashboard/
│
├── components/
│   ├── auth/
│   └── dashboard/
│
├── lib/
│   ├── actions/
│   ├── inventory.ts
│   ├── business-inventory.ts
│   ├── inventory-status.ts
│   ├── format-expiry.ts
│   └── plans.ts
│
├── prisma/
│   └── db.ts
│
└── auth configuration

The exact repository structure must always be inspected before modifying files.

---

# Routing

## Public

`/`

Landing page.

`/get-started`

Account type selection.

The user chooses:

- Consumer
- Business

before entering the appropriate authentication flow.

---

# Consumer

`/login`

Consumer login.

`/signup`

Consumer signup.

`/dashboard`

Consumer overview.

`/dashboard/inventory`

Consumer inventory.

`/dashboard/alerts`

Consumer alerts.

`/dashboard/analytics`

Consumer analytics.

`/dashboard/waste`

Consumer waste insights.

`/dashboard/recipes`

Consumer recipes.

`/dashboard/settings`

Consumer settings.

---

# Business

`/business/login`

Business login.

`/business/signup`

Business signup.

`/business/dashboard`

Business overview.

`/business/dashboard/inventory`

Business inventory.

`/business/dashboard/alerts`

Business alerts.

`/business/dashboard/analytics`

Business analytics.

`/business/dashboard/waste`

Business waste insights.

`/business/dashboard/recipes`

Business recipe-related/shared functionality where implemented.

`/business/dashboard/settings`

Business settings.

---

# Authentication

Authentication uses Auth.js credentials authentication.

The authenticated session determines:

- user identity
- account type
- business association

Authorization must always happen server-side.

Never trust:

- userId from the browser
- businessId from the browser
- URL ownership identifiers
- localStorage as authorization
- query parameters for ownership

---

# Data Ownership

## Consumer

Inventory belongs to:

`userId = authenticated user`

`businessId = null`

## Business

Inventory belongs to:

`userId = authenticated user`

`businessId = authenticated business`

This separation is mandatory.

---

# Database

Core models:

User

- id
- email
- name
- accountType
- businessId
- passwordHash
- createdAt
- updatedAt

Business

- id
- name
- industry
- createdAt
- updatedAt

InventoryItem

- id
- userId
- businessId
- name
- category
- quantity
- unit
- expiryDate
- createdAt
- updatedAt

InventoryConsumption

- id
- userId
- businessId
- inventoryItemId
- productName
- quantityUsed
- unit
- normalizedQuantityUsed
- consumedAt

---

# Inventory Flow

Manual:

Form
→ Server action
→ authenticated ownership
→ validation
→ database

Barcode:

Camera
→ barcode
→ product lookup
→ prefill
→ user review
→ save

Label:

Image
→ Groq/OCR
→ structured extraction
→ user review
→ save

CSV:

CSV
→ parse
→ validate
→ preview
→ import

Invoice:

Invoice image/file
→ Groq extraction
→ review/edit
→ save

---

# Expiry Logic

Expiry classification is deterministic.

Possible states:

- Expired
- Expiring
- Fresh
- Low Stock

Expired must be distinct from Expiring.

AI must never override expiry classification.

---

# Quantity Architecture

The application supports quantities with units.

Examples:

500 g
1 kg
500 ml
1 litre
10 pack

Raw numbers must NOT be compared blindly.

Compatible units should be normalized where required.

Original display values should be preserved.

---

# AI Architecture

AI should be treated as an untrusted generation layer.

Correct pattern:

Application determines facts
        ↓
AI receives validated context
        ↓
AI generates suggestion
        ↓
Application validates result
        ↓
User sees result

Never:

Database
→ AI decides everything
→ directly display

---

# UI Architecture

Prefer reusable components.

Shared dashboard components should be used wherever Consumer and Business behavior is identical.

Examples:

- Sidebar
- AlertsView
- AnalyticsView
- WasteView
- AddProductFlow
- Import components
- Settings components

Consumer/business pages should generally be thin route wrappers around reusable components.

---

# Theme Architecture

The application should support:

- Light
- Dark
- System

Theme state should be managed globally rather than individually per page.

Theme switching must not require rewriting every component.

Use semantic design tokens/CSS variables wherever possible.

Avoid hardcoding large numbers of light-only colors directly into components.

---

# Build

Always verify changes with:

`npm run build`

Do not ignore TypeScript errors or broken routes.

---

# Development Philosophy

Prefer:

Inspect
→ targeted change
→ build
→ test

Avoid:

Large rewrite
→ break working features
→ attempt repair afterward