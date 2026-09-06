# ShelfLife Project Overview (v1.0 Production Release)

## 📌 Product Summary

ShelfLife is a Next.js 16 application for consumers and commercial food businesses to manage inventory, track food freshness, reduce waste, and extract invoice/label data using AI. Deterministic application logic serves as the single source of truth, while AI assists with image extraction and recipe recommendations.

## 👥 Account Types & Isolation

- **Consumer**: Account data scoped to authenticated `userId` via `/dashboard` routes.
- **Business**: Account data scoped to `userId` and `businessId` via `/business/dashboard` routes.
- Server-side session checks guarantee strict data isolation between consumer and business accounts.

## 🛠️ Key Implemented Capabilities (v1.0)

1. **Inventory Management**: Full CRUD, search, status filtering (*Fresh*, *Expiring*, *Expired*, *Low Stock*), and multi-field sorting (*Expiry*, *Quantity*, *Name*, *Date Added*).
2. **Dedicated Export Hub**: `/dashboard/inventory/export` & `/business/dashboard/inventory/export` featuring status/category scope filters, live dataset preview, instant CSV spreadsheet downloads, and printable PDF report formatting.
3. **Dynamic Invoice Intelligence Analysis**: AI-assisted invoice parsing with real-time dynamic stats re-calculation as product fields are edited in the review table.
4. **Scan Label AI & Camera Capture**: Live camera capture or image file upload with Groq AI extraction (`llama-3.3-70b-versatile`).
5. **Alerts vs Notifications**: Urgent actionable inventory risks on `/dashboard/alerts` vs. informational activity log feed on `/dashboard/notifications`.
6. **Time-Accurate Dynamic Greetings**: Auto-evaluates user's local browser time for *Good morning*, *Good afternoon*, *Good evening*, and *Good night*.
7. **Recipe Generator**: Safety-enforced AI recipe generation strictly omitting expired ingredients.
8. **Theme System & Atmosphere**: Persistent Light/Dark/System themes with dynamic mesh gradients and landing-isolated scroll fog.

## 🔒 Safety Principles

- Session-based ownership validation on every server action.
- Expiry status is deterministic.
- Expired products are never sent to AI recipe generation.
- Missing expiry remains explicitly `Expiry not available`.
