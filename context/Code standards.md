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
