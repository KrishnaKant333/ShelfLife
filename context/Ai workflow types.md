# ShelfLife AI Workflow Types

AI is an untrusted assistance layer. It may suggest structured values, but application validation and deterministic rules remain authoritative.

## 1. Invoice, Receipt, and Multi-View Label Extraction

- **Multi-View Synthesis**: Accepts up to 4 images per product (Front, Back, Bottom/Rim). The vision extractor merges fields across angles into ONE unified draft record. It must never create duplicate items from multiple angles.
- **Image Retention**: The front-facing packaging capture is retained as the persistent primary product thumbnail (`imageUrl`), while auxiliary views are saved in `additionalImageUrls`.
- **5-Tier Expiry Hierarchy**:
  1. *Manufacturer Expiry*: Explicit stamped date (authoritative).
  2. *Best Before / Use By*: Explicit date (authoritative).
  3. *Mfg Date + Shelf Life Duration*: Deterministically derived (authoritative).
  4. *AI-Estimated Shelf Life*: Category-based culinary heuristic (e.g. bread: +4d, bananas: +5d) explicitly badged as `Estimated ✦`, editable, and never passed off as manufacturer truth.
  5. *Unknown*: Displayed as `Expiry Not Tracked`.
- **Anti-Confusion Filter**: Billing timestamps, delivery dates, store IDs, and barcode SKU digits must NEVER be confused with expiration dates.
- Editable review table is mandatory before committing any AI-extracted item to the database.

## 2. Culinary Recipes (Consumer Only)

Fetch owned inventory -> exclude discarded and deterministically expired items -> compile trackable ingredient candidates -> call Groq LLM -> validate ingredient names against owned stock -> render recipe cards with Cooking Mode.
- **Commercial Isolation**: Recipes are 100% disabled and purged from Business workspaces (`/business/dashboard`).

## 3. ShelfLife Brief & Business Strategy Center

Compute deterministic expiry countdowns, quantity balances, ownership boundaries, FIFO queues, stock velocity, and waste analytics first. AI may summarize and recommend operational improvements, but can never override mathematical facts.

## 4. Failure Handling & Defensive Guardrails

Malformed extractions, unreadable panels, ambiguous dates, invalid quantities, or LLM network errors produce a graceful user-facing review state. They never write partial, invented, or hallucinated records to the database.

