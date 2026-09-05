# ShelfLife Code Standards

- Inspect existing code and reuse shared components before adding new ones.
- Keep routes thin and put domain logic in `src/lib`.
- Server actions authenticate, derive ownership, validate input, mutate, and revalidate.
- Use strict TypeScript and domain types; avoid `any` and unsafe casts.
- Keep Consumer and Business behavior isolated while sharing identical UI behavior.
- Deterministic expiry, unit, stock, ownership, FIFO, and recipe-safety logic outranks AI output.
- Never invent missing expiry data. Model unknown expiry explicitly.
- Preserve original quantity/unit display while using normalized values only for compatible comparisons.
- Use semantic CSS tokens so Light, Dark, and System themes remain usable.
- Keep controls keyboard accessible, labelled, responsive, and visually distinguishable without color alone.
- Do not introduce dependencies or duplicate actions without a concrete requirement.
- Run `npm run build` after each major phase and fix regressions before continuing.

## UI redesign workflow

- Follow `specs/UI redesign roadmap.md` and complete stages in order; do not mix later-stage motion or 3D work into foundation, auth, or productivity-screen stages.
- Build reusable semantic tokens and primitives before page-specific visual polish.
- Treat marketing as expressive and authenticated screens as restrained, information-dense productivity surfaces.
- Design mobile structure intentionally at 320px, 375px, 390px, 414px, tablet, desktop, and large desktop; do not only stack desktop layouts.
- Preserve light, dark, and system themes, keyboard access, visible focus, reduced motion, and non-color status cues.
- Barcode scanning remains deferred/hidden and must not be reintroduced by visual redesign work.
