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
2. **Authenticated App Roadmap (Post-1.0 Stages A–L)**:
   - Guided by: *"Editorial Productivity / Intelligent Workspace"*.
   - First Task Ready for Implementation: **Stage A — App Visual Foundation & Shared Shell** (Unstarted / Queued).
   - DO NOT implement Stage A or any UI/code changes until explicitly prompted by the user.
   - Maintain full light and dark mode support for authenticated views.
