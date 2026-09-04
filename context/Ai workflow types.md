# ShelfLife AI Workflow Types

AI is an untrusted assistance layer. It may suggest structured values, but application validation and deterministic rules remain authoritative.

## Invoice and label extraction

Upload -> extract candidate fields -> parse and validate -> resolve expiry evidence -> show editable review -> save only after confirmation.

The extractor may return a visible expiry date, a manufacturing date, a shelf-life/best-before duration, or no usable date. It must return null when evidence is ambiguous. The application may derive expiry only when the input dates and duration are reliable and unambiguous. It must never guess.

Products without reliable expiry are valid inventory and must be displayed as `Expiry not available` and `Not trackable` rather than classified as Fresh, Expiring, or Expired.

## Recipes

Fetch owned inventory -> exclude discarded items and deterministic expired items -> keep only usable/trackable candidates -> call Groq -> validate ingredient names against safe candidates -> display. Unknown expiry must not be silently treated as safe when the recipe workflow requires a consumability decision.

## ShelfLife Brief and Business Strategy

Compute expiry, quantity, ownership, FIFO, stock, and waste facts first. AI may summarize and recommend but cannot override those facts.

## Failure handling

Malformed extraction, ambiguous dates, invalid quantities, unauthorized IDs, or AI failures produce a user-facing error or review state. They never partially write unreviewed or invented inventory.
