# ShelfLife Code Standards

## 🏛️ General Engineering Principles

- Inspect existing code and reuse shared components before adding new ones.
- Keep routes thin and put domain logic in `src/lib`.
- Server actions authenticate, derive ownership, validate input with Zod, mutate database, and revalidate caches.
- Use strict TypeScript and domain types; avoid `any` and unsafe casts.
- **Continuous vs. Discrete Units**: Continuous units (`L`, `kg`, `ml`, `g`, `oz`, `lb`) must accept decimals (`min="0.0001"`, `step="any"`). Discrete units (`pcs`, `pack`, `can`, `bottle`) enforce integers (`min="1"`, `step="1"`). Never use `parseInt` on continuous items.
- **Fractional Precision**: Round decimal operations to 4 decimal places (`Math.round(val * 10000) / 10000`) before saving to eliminate IEEE 754 float drift.
- **Database Schema Parity**: Development and production databases must remain in 100% lockstep (`float8` for `quantityUsed` and `quantity`). Never use `prisma db push` or `prisma db reset` against production.
- **5-Tier Expiry Provenance**: AI-estimated freshness must be visually distinguished (`Estimated ✦`), editable, and never passed off as manufacturer truth.
- **Authentic Product Imagery**: Adhere to the 6-tier image hierarchy. Never scrape or inject random stock photos.
- **Strict Business Recipe Isolation**: Business workspaces (`/business/dashboard`) strictly omit all recipe UI, endpoints, tabs, and buttons.
- Deterministic expiry, unit, stock, ownership, FIFO, and recipe-safety logic outranks AI output.
- Run `npm run build` after each major phase and fix regressions before continuing.
- Barcode scanning remains deferred and hidden from active entry flows.

---

## 🎨 Dual Visual Architecture & Design Principles

```
Landing:            "Cinematic / Editorial / Immersive"
Authenticated App:  "Editorial Productivity / Intelligent Workspace"
Dashboard:          "Understand everything immediately"
Inventory:          "Manage products effortlessly"
Product Details:    "See the digital representation of the physical product"
Analytics:          "Understand what is happening"
Recipes:            "Be inspired to use what you already have"
Waste:              "Understand impact and improve decisions"
Settings:           "Everything is clear and mature"
```

1. **Visual Metaphor Isolation**:
   - The scroll-controlled cinematic pantry video background is **strictly isolated** to the public marketing page (`src/app/(marketing)/layout.tsx`). It must **never** be injected into authenticated workspace pages.
   - The landing page theme toggle has intentionally been removed to preserve art direction. Do **not** reintroduce it unless explicitly requested.
   - The authenticated application maintains dynamic Light and Dark mode options.
2. **Surface & Palette Rules**:
   - Light mode: Warm ivory/off-white (`#fbfbfa`, `#f4f3ef`) with soft borders (`#e8e6df`).
   - Dark mode: Sophisticated charcoal/slate (`#0e120f`, `#151a16`) with fine borders (`#222a23`).
   - Accents: Restrained Forest Emerald (`#15803d` / `#22c55e`); warm amber for imminent expiry; terracotta for expired/risks.
   - Prohibited: Monochromatic green UI, neon glows, full-screen saturated gradients, or unreadable heavy glassmorphism in workspace views.
3. **Typography**:
   - Editorial Serif (`font-serif`) for top-level page headers, product dossier titles, and report mastheads.
   - Modern Sans-Serif (`font-sans`) for body and interface controls.
   - Monospace Tabular Numerals (`font-mono tabular-nums`) for all quantities, weights, expiry dates, and metrics.
4. **App Motion Doctrine**:
   - Restrained motion only where it improves comprehension (metric count-ups, list/grid morphs, button compressions, bottom sheet slides).
   - Strictly NO cinematic scroll storytelling in authenticated views.
   - Respect `prefers-reduced-motion` at all times (instant state swaps, 0ms transitions).
5. **Mobile-First Ergonomics (320px – 414px)**:
   - Mobile is a distinct product experience, NOT a desktop layout stacked with `flex-col`.
   - High-frequency actions placed in the lower-half one-handed thumb zone.
   - Bottom sheets replace centered modals on screens <768px.
   - Minimum 44x44px touch targets on all interactive elements.
   - Horizontal snap carousels prevent endless vertical scrolling.
6. **Consumer & Business Parity**:
   - Shared capabilities must maintain functional parity.
   - Business-specific features (FIFO tracking, inventory valuation, operational strategy) must remain intact.
