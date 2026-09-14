# ShelfLife Specification: Mobile Inventory Default List View

**Cycle**: P2 / UX and Workflow Improvements  
**Status**: 🟡 Queued for Implementation (Specification Ready)  
**Applies To**: Consumer Kitchen (`/dashboard/inventory`) and Commercial Operations (`/business/dashboard/inventory`)

---

## 1. Objective

Deliver a high-density, ergonomically optimized **Mobile Default List View** for inventory browsing on smartphone screens (<768px). Eliminate awkward vertical card stacking, maximize information density, support one-handed thumb scanning, and enable fast visual auditing of dozens of products with minimal scrolling—while keeping Grid view as the default on desktop viewports.

---

## 2. Problem & Observed Friction

Currently, both mobile and desktop viewports inherit the same default layout state:
- On desktop monitors, the Grid card layout provides a spacious, visual catalog with rich product metadata.
- On mobile devices (320px–414px width), the grid layout collapses into massive, vertically stacked cards where each item consumes 220px–280px of vertical height.
- A user with 30 pantry items is forced to scroll through 7,000+ vertical pixels just to locate one product.
- High-frequency metrics (quantity, unit, expiration countdown) are spread out across multiple lines, slowing down quick pantry inspections.

---

## 3. Product Principle

**Mobile pantry management is a scanning activity, not a showroom gallery.** When standing in front of an open refrigerator or pantry shelf, users need to see 6 to 8 items per screen, immediately identify what is expiring soon, check remaining quantities, and tap to consume—all with one thumb.

---

## 4. Responsive Viewport Defaults

| Viewport | Default Presentation | Manual Switcher Available? | Persistence |
| :--- | :--- | :---: | :--- |
| **Desktop (≥ 768px)** | **Grid View** (Bento / Catalog Cards) | Yes (Grid ↔ List toggle in toolbar) | Saved in `localStorage` (`shelflife_pref_inventory_view`) |
| **Mobile (< 768px)** | **List View** (High-Density Row Layout) | Yes (Compact toggle chip in mobile bar) | Saved in `localStorage` (`shelflife_pref_inventory_view`) |

- **Automatic Adaptive Default**:
  - If a user has never explicitly toggled the layout, mobile automatically defaults to **List**, and desktop defaults to **Grid**.
  - If the user explicitly selects a layout, their preference is remembered on that device.

---

## 5. Mobile List Row Architecture (Dedicated Component)

The mobile list is **not** a resized desktop card. It is a purpose-built row component (`MobileInventoryRow.tsx`) designed for dense vertical rhythm (height: 64px–72px per item):

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌─────┐  Organic Whole Milk                   1.8 L       [● In 3d]  ⋮  │
│ │ IMG │  Dairy • Opened yesterday             (Stock: Good)          >  │
│ └─────┘                                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Layout Elements

1. **Left: Compact Thumbnail (`48x48px` or `52x52px`)**:
   - High-fidelity product thumbnail or category fallback icon.
   - Rounded corners (`rounded-xl`), subtle border (`border-white/10`).
   - Aspect-ratio locked with `object-cover`.
2. **Center-Left: Product Identity & Context**:
   - **Primary Line**: Product title (`text-sm font-semibold truncate text-[var(--app-text-display)]`).
   - **Secondary Line**: Category tag + fresh indicator / location note (`text-[11px] text-[var(--app-text-muted)]`).
3. **Center-Right: Quantity & Stock Level**:
   - **Quantity Display**: `text-sm font-mono font-bold tabular-nums` (e.g. `0.25 kg`, `1.5 L`, `6 pcs`).
   - **Low Stock Indicator**: If quantity is below safety threshold, renders a subtle terracotta/amber dot or badge (`Low Stock`).
4. **Right: Expiration Status Badge**:
   - High-contrast, color-coded countdown chip:
     - *Expired*: Terracotta badge (`Expired 2d ago`).
     - *Expiring Soon (≤ 3d)*: Amber badge (`In 2 days`).
     - *Fresh (> 3d)*: Subtle emerald/slate pill (`In 18 days`).
     - *Unknown/Estimated*: Dotted border chip (`Est. 5d`).
5. **Far Right: Contextual Touch Action (`≥ 44px` target)**:
   - Chevron / Quick Action trigger button opening the Partial Product Dossier slide-up bottom sheet.

---

## 6. Touch Ergonomics & Interaction Design

1. **One-Handed Thumb Navigation**:
   - Entire row surface is a touch target. Tapping anywhere on the row smoothly opens the Partial Product Dossier (`ProductDetailDrawer.tsx` in mobile bottom-sheet mode).
   - Quick "Swipe to Consume" or long-press contextual menus are reserved for future phases to prevent accidental multi-touch deletions.
2. **Dense Screen Capacity**:
   - On a standard iPhone 14/15/16 viewport (844px height):
     - Header, search bar, and status pills consume ~180px.
     - Visible inventory list space is ~580px.
     - At ~68px per row, **8 to 9 distinct products** are visible simultaneously without scrolling.
3. **Smooth Scroll Performance**:
   - Uses lightweight DOM elements without expensive nested backdrop-blur filters in list rows to guarantee 60fps / 120fps scrolling on mobile browsers.

---

## 7. Desktop List View vs. Mobile List View

| Feature | Desktop List View (Table Mode) | Mobile List View (Row Mode) |
| :--- | :--- | :--- |
| **Container** | Wide tabular grid (`table` / CSS grid with 6 columns) | Stacked touch-row cards |
| **Columns** | Checkbox, Image, Name, Category, Stock, Expiry, Actions | Image, Name+Category, Qty, Expiry Badge, Action |
| **Row Height** | 52px | 68px (ergonomic touch target) |
| **Batch Selection** | Multi-select checkboxes visible | Long-press or dedicated "Select" toolbar button |

---

## 8. Consumer vs. Business Parity

- **Consumer**: Optimized for fast kitchen shelf checkoffs and instant culinary ingredient verification.
- **Business**: Mobile list view additionally surfaces batch/lot numbers or supplier initials in the secondary text line, allowing kitchen line cooks and baristas to check prep stock from their mobile phones.

---

## 9. Acceptance Criteria

- [ ] On viewports <768px, inventory defaults to the high-density List view on initial load.
- [ ] On viewports ≥768px, inventory defaults to Grid view.
- [ ] Users can toggle between Grid and List on mobile, and the preference persists across sessions.
- [ ] At least 7 full products are visible on a standard mobile viewport (height ≥ 800px) above the fold.
- [ ] Tapping any row opens the contextual bottom sheet within 100ms.
- [ ] All interactive elements meet the minimum 44x44px touch target guideline.
