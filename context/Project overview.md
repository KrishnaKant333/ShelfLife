# ShelfLife — Project Overview

## Product

ShelfLife is a food inventory intelligence SaaS designed for both individual consumers and food businesses.

The core objective is:

> Know what you have. Know what to use first. Waste less.

ShelfLife combines deterministic inventory management with AI-assisted intelligence.

It is NOT simply an AI application.

Deterministic application logic is responsible for safety-critical decisions such as:

- Expiry classification
- Inventory ownership
- Quantity calculations
- Unit normalization
- Expired-product exclusion
- Stock status

AI is used to enhance the experience through:

- Invoice extraction
- Product label extraction
- Inventory insights
- Consumer recipe generation
- Business intelligence recommendations

---

# Account Types

ShelfLife has two account types.

## Consumer

Designed for household/personal inventory.

Primary capabilities:

- Personal inventory
- Expiry tracking
- Alerts
- Analytics
- Waste insights
- Barcode scanning
- Label scanning
- CSV import
- Invoice import
- Consumption tracking
- AI recipe generation
- Recipe modes
- Shopping assistance
- Data export

Consumer dashboard route:

`/dashboard`

---

## Business

Designed for food businesses such as:

- Grocery stores
- Restaurants
- Cafes
- Bakeries
- Small food businesses

Primary capabilities:

- Business inventory
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

Business dashboard route:

`/business/dashboard`

---

# Feature Philosophy

Consumer and Business accounts should have strong feature parity where functionality is generally useful to both.

The distinction should primarily come from the context of the feature rather than arbitrary restrictions.

Examples:

Common:
- Inventory
- Alerts
- Analytics
- Waste Management
- Barcode
- Label scanning
- CSV import
- Invoice import
- Consumption tracking
- Exports

Consumer-focused:
- AI Recipes
- Recipe modes
- Personal meal/shopping assistance

Business-focused:
- FIFO
- Inventory Strategy
- Operational insights
- Future team/location management

---

# Current Application

The application currently has:

- Landing page
- Account-type selection page
- Consumer authentication
- Business authentication
- Shared dashboard visual language
- Consumer dashboard
- Business dashboard
- Inventory management
- Alerts
- Analytics
- Waste Management
- Consumer AI Recipes
- Settings
- Sign out
- Barcode scanning
- Label/OCR scanning
- CSV import
- Invoice import
- Groq integration
- CSV export
- PDF export
- Consumption tracking
- Quantity/unit normalization
- FIFO
- Business Inventory Strategy
- AI ShelfLife Brief

---

# AI Provider

Current AI provider:

Groq

Current model usage includes:

- Invoice extraction
- Label extraction
- AI inventory insights
- Recipe generation

AI output must always be validated before being treated as authoritative inventory information.

---

# Critical AI Safety Rule

Expired products MUST NOT be used as recipe ingredients.

The correct flow is:

Database inventory
→ deterministic expiry classification
→ remove expired products
→ select valid candidates
→ send candidates to AI
→ validate AI response
→ display recipe

AI must never be allowed to decide that an expired product is safe to consume.

---

# Current Pricing Model

## Consumers

Free:
₹0/month

Plus:
₹149/month

## Businesses

Starter:
₹0/month

Pro:
₹499/month

Growth:
₹999/month

The current product does not have real payment processing.

Future premium features should be represented as "Coming Soon" until actually implemented.

---

# Current Design Direction

The landing page has already received a major redesign and is currently the strongest visual part of the application.

Current visual language:

- Warm cream/off-white backgrounds
- Forest/deep green
- Muted green
- Amber
- Terracotta
- Subtle borders
- Rounded cards
- Restrained shadows
- Clean typography
- Minimal animations

However, the dashboard/application UI still requires a major visual refinement.

The next major objective is to make the ENTIRE application feel visually consistent with a polished commercial SaaS product.

The application should NOT remain monochromatically green.

The new design should use a restrained multi-color palette with meaningful semantic colors while remaining professional.

---

# Current Navigation

The application uses a shared sidebar for Consumer and Business dashboards.

Navigation includes:

- Overview
- Inventory
- Alerts
- Analytics
- Waste Insights
- Recipes
- Settings
- Sign Out

The navbar on the public landing page contains:

- Product
- For Business
- For Consumers
- Pricing
- Get Started

A new theme/mode control is required in the public navbar.

Modes:

- Light
- Dark
- System

---

# Product Positioning

Consumer:

> Know what's in your kitchen. Eat what you have. Waste nothing.

Business:

> Turn inventory data into smarter stock decisions.

Overall:

> Start free. Upgrade when you need more.