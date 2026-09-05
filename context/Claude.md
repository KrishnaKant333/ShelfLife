# ShelfLife Agent Handoff Rules

This is an existing functioning SaaS prototype. Inspect before editing and preserve authentication, Consumer/Business isolation, ownership checks, imports, exports, label scanning, AI safety, recipe safety, analytics, waste, FIFO, pricing, and current theme behavior. Barcode scanning is deferred and hidden from product entry until a suitable data source is selected.

Work through the roadmap strictly in order. After each major phase, update `context/Progress tracker.md`, the relevant specification, and `README.md`. Run `npm run build` at phase checkpoints.

Do not fabricate functionality. Unimplemented features must be marked incomplete or Coming Soon. Never expose model chain-of-thought or trust AI with ownership, expiry, quantity, or safety decisions.

The 2026-09-05 final P2 pass audited consumer, business, authentication, inventory, analytics, recipes, waste, settings, import/export, and marketing routes. It preserved the existing architecture, added shared async and accessibility polish, and confirmed that no native browser alert/confirm flows remain.

The visual redesign is planning-only until the staged specifications are explicitly started. Follow `specs/UI redesign roadmap.md` and its Stage 0-12 files in order. Do not implement UI changes while a request is limited to specification work.
