# ShelfLife

> Know what's on your shelf. Before it goes to waste.

ShelfLife is a food inventory intelligence SaaS for consumers and food businesses.

It combines deterministic inventory management with AI-assisted intelligence to help users understand inventory, expiry, consumption and waste.

---

# Product

ShelfLife supports two account types:

## Consumer

For personal food inventory.

Features include:

- Inventory management
- Expiry tracking
- Alerts
- Analytics
- Waste insights
- Barcode scanning
- Label scanning
- CSV import
- Invoice import
- Consumption tracking
- AI recipes
- Recipe modes
- Shopping assistance
- Data export

## Business

For food businesses.

Features include:

- Inventory management
- Expiry tracking
- Alerts
- Analytics
- Waste management
- Barcode scanning
- Label scanning
- CSV import
- Invoice import
- Consumption tracking
- FIFO prioritization
- Inventory Strategy
- AI insights
- Data export

---

# Core Philosophy

ShelfLife uses:

## Deterministic Logic

For:

- expiry
- stock status
- quantity
- units
- ownership
- recipe safety

## AI

For:

- invoice extraction
- label extraction
- insights
- recipes
- recommendations

AI enhances ShelfLife.

It does not replace the application's source of truth.

---

# Important Safety Rule

Expired products must NEVER be presented as usable recipe ingredients.

Expiry is determined by deterministic application logic before AI receives recipe candidates.

---

# Technology

- Next.js 16.3.2
- TypeScript
- React
- Tailwind CSS
- Auth.js
- PostgreSQL / Neon
- Prisma-next
- Groq

---

# Authentication

Consumer:

`/login`

`/signup`

Business:

`/business/login`

`/business/signup`

Users first choose their account type through:

`/get-started`

---

# Dashboard

Consumer:

`/dashboard`

Business:

`/business/dashboard`

Both use a shared navigation philosophy.

Navigation:

- Overview
- Inventory
- Alerts
- Analytics
- Waste Insights
- Recipes
- Settings
- Sign Out

---

# Inventory Input

Products can be added through:

1. Manual entry
2. Barcode scanning
3. Label scanning
4. CSV import
5. Invoice import

AI-extracted information should be reviewed before saving.

---

# Inventory Status

ShelfLife distinguishes:

- Expired
- Expiring
- Fresh
- Low Stock

Expired is NOT the same as Expiring.

---

# Quantity

Supported examples:

- 500 g
- 1 kg
- 500 ml
- 1 litre
- 10 pack
- 5 pieces

Quantities must be normalized when compatible units need comparison.

Example:

500 g = 0.5 kg

1 kg = 1000 g

1000 ml = 1 litre

The original unit should remain visible to the user.

---

# Business Intelligence

Business users have:

## FIFO

First In, First Out prioritization.

## Inventory Strategy

Operational insights around:

- stock
- expiry
- FIFO
- replenishment
- overstock
- waste exposure

---

# Waste Management

Available to both account types.

Includes:

- waste-risk estimation
- at-risk inventory
- expiry exposure
- consumption-aware insights
- recommendations

---

# AI Recipes

Primarily a consumer feature.

Recipe modes may include:

- Use Soon
- Quick Meal
- Use What I Have

Expired inventory is always excluded.

---

# Pricing

## Consumer

Free:

₹0/month

Plus:

₹149/month

## Business

Starter:

₹0/month

Pro:

₹499/month

Growth:

₹999/month

Real payment processing is not currently implemented.

Future functionality should be labelled:

**Coming Soon**

until actually implemented.

---

# Design

ShelfLife uses a warm, premium design language.

Primary visual concepts:

- warm cream
- forest green
- deep teal
- warm amber
- terracotta
- muted green
- warm slate
- subtle borders
- rounded surfaces
- restrained shadows

The UI supports:

- Light
- Dark
- System

The application should remain professional and restrained rather than becoming overly colourful.

---

# Development

Install:

```bash
npm install
```
Run:

```bash
npm run dev
```
Build:

```bash
npm run build
```
A feature is not complete if the production build fails.

---
# Development Rules

Before modifying the application:

1. Inspect existing code.
2. Reuse existing components.
3. Avoid unnecessary rewrites.
4. Preserve working functionality.
5. Protect Consumer/Business ownership.
6. Keep deterministic safety logic authoritative.
7. Validate AI output.
8. Run npm run build.

---

# Future Roadmap

Potential future capabilities:

1. Advanced historical analytics
2. XLSX export
3. Weekly meal planning
4. Advanced shopping automation
5. Team management
6. Roles and permissions
7. Multiple locations
8. Cross-location inventory
9. Forecasting
10. Integrations
11. Advanced automation
12. Real subscription/payment infrastructure

Do not claim these features are implemented until they actually are.

---

# Current Priority

The next major phase is:

## Complete Application-Wide UI Overhaul

Including:

1. Light/Dark/System theme
2. Navbar theme selector
3. Multi-color but restrained design system
4. Consumer dashboard polish
5. Business dashboard polish
6. Inventory polish
7. Analytics polish
8. Alerts polish
9. Waste polish
10. Recipe polish
11. Settings polish
12. Authentication polish
13. Loading/error states
14. Mobile responsiveness

The goal is for ShelfLife to look and feel like a real production SaaS product, not merely a functional prototype.
