# ShelfLife Agent Handoff Rules

This is an existing functioning SaaS prototype. Inspect before editing and preserve authentication, Consumer/Business isolation, ownership checks, imports, exports, barcode/label scanning, AI safety, recipe safety, analytics, waste, FIFO, pricing, and current theme behavior.

Work through the roadmap strictly in order. After each major phase, update `context/Progress tracker.md`, the relevant specification, and `README.md`. Run `npm run build` at phase checkpoints.

Do not fabricate functionality. Unimplemented features must be marked incomplete or Coming Soon. Never expose model chain-of-thought or trust AI with ownership, expiry, quantity, or safety decisions.

The 2026-09-05 final P2 pass audited consumer, business, authentication, inventory, analytics, recipes, waste, settings, import/export, and marketing routes. It preserved the existing architecture, added shared async and accessibility polish, and confirmed that no native browser alert/confirm flows remain.
