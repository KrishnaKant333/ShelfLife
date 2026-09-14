# ShelfLife Agent Handoff Rules

This is an existing functioning SaaS product. Inspect before editing and preserve authentication, Consumer/Business isolation, ownership checks, imports, exports, label scanning, AI safety, recipe safety, analytics, waste, FIFO, pricing, and current theme behavior. Barcode scanning is deferred and hidden from product entry until a suitable data source is selected.

Work through the roadmap strictly in order. After each major phase, update `context/Progress tracker.md`, the relevant specification, and `README.md`. Run `npm run build` at phase checkpoints.

Do not fabricate functionality. Unimplemented features must be marked incomplete or Coming Soon. Never expose model chain-of-thought or trust AI with ownership, expiry, quantity, or safety decisions.

---

## 🎨 Dual Visual Architecture Handoff Notes

1. **Cinematic Landing Page (Completed)**:
   - Uses scroll-scrubbed video (`public/videos/shelflife-cinematic-sequence.mp4`) in `(marketing)/layout.tsx`.
   - Floating suspended capsule navbar with scroll-aware transparency.
   - Art direction is permanently dark-default; the landing page theme toggle has intentionally been removed. Do NOT reintroduce it.
   - The video background is strictly for the landing page; do NOT inject it into authenticated workspace routes.
2. **Authenticated App & Workspace Status**:
   - Guided by: *"Editorial Productivity / Intelligent Workspace"*.
   - Stages A–L Redesign: **100% Completed & Built**.
   - Business Recipe Isolation: **100% Completed** (Zero recipe UI, routes, or recommendations in Business).
   - Get Started & Auth Modernization: **100% Completed**.
   - P0 Fractional Quantities & Production DB Parity: **100% Completed & Verified**.
3. **Active Real-World Usage Cycle (P1–P3)**:
   - Next ready implementation task: **P1-B (Intelligent Missing Expiry)** or **P1-A (Multi-View Understanding)**.
   - DO NOT implement application code until explicitly instructed by the user.
   - Database Rule: Production and dev schemas must remain in lockstep (`float8`). Never run `prisma db push` or `prisma db reset` against production.
   - Unit Rule: Enforce continuous decimals (`L`, `kg`, `ml`, `g`) vs. discrete whole numbers (`pcs`, `pack`). Never use `parseInt` on continuous units.
   - Expiry Rule: AI-estimated dates must be visibly labeled `Estimated ✦` and editable. Never pass off an AI estimate as manufacturer truth.
   - Imagery Rule: Adhere to the 6-tier image priority cascade; never scrape or inject random stock photos.
   - Maintain full light and dark mode support for authenticated views.

