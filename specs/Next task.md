# ShelfLife — Next Task: Complete UI Overhaul + Theme System

## Objective

Perform a major visual polish pass across the ENTIRE ShelfLife application.

The application functionality is already strong.

This task is primarily about making the product look and feel like a polished commercial SaaS.

DO NOT rewrite working business logic.

---

# P0 — Theme System

Implement three global appearance modes:

- Light
- Dark
- System

System should follow the user's OS/browser preference.

Requirements:

- Persist the user's selected preference.
- Keep the preference across navigation and reloads.
- Avoid visible theme flashing where reasonably possible.
- Use a global theme mechanism rather than page-specific state.
- Ensure every major page works correctly in all three modes.

---

# P1 — Design System

The current UI relies too heavily on cream/white + green.

Keep ShelfLife's identity but introduce a restrained multi-color palette.

Suggested semantic roles:

Primary:
Forest Green

Secondary:
Deep Teal / Blue-Green

Accent:
Warm Amber

Warning:
Terracotta

Success:
Muted Green

Neutral:
Warm Slate

Light background:
Warm cream

Dark background:
Deep charcoal / green-black

IMPORTANT:

Do not use all colors equally.

Colors should have semantic meaning.

The final design should feel:

- premium
- modern
- warm
- trustworthy
- professional

NOT:

- rainbow-like
- overly colourful
- neon
- generic purple AI SaaS

---

# P2 — Public Navbar

Add a theme control to the existing navbar.

Options:

Light
Dark
System

The control should be compact and polished.

Do not make it visually dominant.

Preserve existing navigation:

- Product
- For Business
- For Consumers
- Pricing
- Get Started

Ensure mobile navigation still works.

---

# P3 — Landing Page

The landing page is already the strongest visual section.

DO NOT redesign it from scratch.

Instead:

- integrate the new design tokens
- ensure dark mode works
- refine spacing where necessary
- ensure cards and sections transition naturally between themes
- keep existing content
- keep existing pricing
- keep Consumer/Business positioning
- preserve navbar/footer improvements

Do not remove existing sections.

---

# P4 — Authentication Pages

Polish:

Consumer Login
Consumer Signup
Business Login
Business Signup

Requirements:

- Light/dark/system compatibility
- Better form hierarchy
- Better inputs
- Clear validation
- Clear errors
- Loading states
- Password visibility
- Responsive layout
- Consistent branding

Do not modify authentication logic.

---

# P5 — Consumer Dashboard

Refine:

- Overview
- Inventory
- Alerts
- Analytics
- Waste
- Recipes
- Settings

Improve:

- page hierarchy
- cards
- stat blocks
- spacing
- typography
- tables
- badges
- buttons
- empty states
- loading states
- error states
- charts

Avoid turning everything into cards.

Use varied layouts where appropriate.

---

# P6 — Business Dashboard

Apply the same design quality as Consumer.

Business should NOT feel like a secondary interface.

Refine:

- Overview
- Inventory
- Alerts
- Analytics
- Waste
- Settings
- Inventory Strategy
- FIFO

Business-specific intelligence should be visually emphasized without creating a completely separate design language.

---

# P7 — Inventory

This is one of the most important screens.

Improve:

- table hierarchy
- column spacing
- status badges
- quantity display
- expiry display
- action buttons
- search
- filters
- sort controls
- bulk actions
- responsive behavior

Use distinct semantic colors:

Expired → terracotta/red

Expiring → amber

Low Stock → warning/terracotta depending on severity

Fresh → muted green

Do NOT confuse Expired and Expiring.

---

# P8 — Add Product

Polish the existing Add Product experience.

Existing methods:

- Manual
- Barcode
- Label Scan
- CSV
- Invoice

Make the modes feel like one cohesive product workflow.

Improve:

- tabs
- forms
- scanner area
- upload areas
- progress states
- review state
- success state
- errors

Do not rewrite extraction logic.

---

# P9 — Analytics

Make analytics look like a serious SaaS analytics dashboard.

Use:

- metric cards
- charts
- category breakdown
- expiry distribution
- consumption information
- waste indicators

Use multiple semantic colors in charts, but keep the palette restrained.

Do not fabricate data.

Use real database data.

Ensure charts work in light and dark mode.

---

# P10 — Alerts

Create clear visual hierarchy between:

- Expired
- Expiring
- Low Stock

Make actions obvious without excessive buttons.

Maintain current functionality.

---

# P11 — Waste Insights

Make Waste Insights visually distinctive.

Use:

- risk gauge
- at-risk items
- recommendations
- consumption information

Use amber/terracotta carefully.

Do not make the whole page red.

---

# P12 — Consumer Recipes

Make the recipe experience feel premium.

Use:

- recipe cards
- recipe mode selector
- ingredient status
- expiry priority
- preparation information

IMPORTANT:

Expired products MUST NEVER appear as usable ingredients.

Do not modify the existing deterministic filtering unless necessary to preserve this rule.

---

# P13 — Settings

Polish Settings.

Include clear sections for:

- Profile
- Account type
- Current plan
- Preferences
- Theme
- Sign out

If plan information already exists, display it.

Do not implement payments.

---

# P14 — Sidebar

The existing shared sidebar is good.

Refine it rather than replacing it.

Requirements:

- works in Light/Dark/System
- active route is obvious
- hover states
- clean icons
- good spacing
- responsive/mobile behavior
- sign-out clearly separated

Do not create separate visual systems for Consumer and Business.

---

# P15 — Loading / Transition States

Add contextual loading states where users may otherwise think the app is broken.

Prioritize:

- authentication submission
- dashboard navigation when slow
- inventory loading
- invoice extraction
- label extraction
- barcode scanning
- AI recipes
- AI ShelfLife Brief
- analytics loading

Use lightweight skeletons/spinners appropriate to the context.

Do not add artificial delays.

---

# P16 — Error States

Create consistent user-facing error treatment.

Errors should:

- explain what happened
- avoid technical stack traces
- provide retry/action where appropriate
- work in both themes

Do not swallow errors silently.

---

# P17 — Empty States

Preserve existing good empty states.

Only refine visual consistency.

Do not introduce unnecessary illustrations.

---

# P18 — Responsive Design

Audit all major pages at:

- desktop
- laptop
- tablet
- mobile

Fix:

- overflow
- cramped cards
- broken tables
- navigation issues
- buttons wrapping badly
- charts overflowing

---

# P19 — Visual Consistency

Create/reuse centralized design tokens where possible.

Avoid scattering:

`bg-white`

`text-black`

`border-gray-*`

throughout the application if those values prevent theme support.

Prefer semantic variables/classes.

Example conceptual tokens:

--background
--surface
--surface-muted
--foreground
--muted
--border
--primary
--secondary
--accent
--warning
--danger
--success

Use the project's existing styling architecture where possible.

---

# P20 — DO NOT CHANGE

Do NOT change:

- Auth.js logic
- database ownership
- Consumer/Business separation
- Groq integration
- inventory CRUD
- expiry logic
- quantity normalization
- imports
- exports
- barcode functionality
- label scanning
- FIFO
- Inventory Strategy
- recipe safety logic

unless a change is strictly necessary to support the UI.

---

# P21 — Do Not Overdesign

Avoid:

- excessive gradients
- neon colours
- excessive glassmorphism
- huge shadows
- excessive animations
- random illustrations
- fake statistics
- fake testimonials
- fake logos

The design should feel like a serious SaaS product.

---

# P22 — Verification

After implementation:

Run:

npm run build

Fix all build/type errors.

Then manually verify:

Consumer:
- login
- dashboard
- inventory
- alerts
- analytics
- waste
- recipes
- settings

Business:
- login
- dashboard
- inventory
- alerts
- analytics
- waste
- FIFO
- Inventory Strategy
- settings

Theme:
- Light
- Dark
- System
- reload persistence

Do not finish with broken routes or TypeScript errors.

---

# Definition of Done

The task is complete when:

1. ShelfLife has a coherent global design system.
2. Light/Dark/System modes work across the entire application.
3. Theme selection exists in the navbar.
4. Consumer and Business dashboards feel equally polished.
5. Inventory is visually strong and readable.
6. Analytics looks like a real SaaS analytics product.
7. Alerts and Waste have clear semantic hierarchy.
8. Recipes feel premium.
9. Authentication is polished.
10. Loading/error states are consistent.
11. Mobile layouts work.
12. Existing functionality remains intact.
13. npm run build passes.