# ShelfLife — AI Workflow Types

This document defines how AI should be used inside ShelfLife.

AI is an intelligence layer, not the source of truth.

---

# Workflow 1 — Invoice Extraction

Input:

Invoice image/file

Flow:

User uploads invoice
→ server receives file
→ AI extracts candidate products
→ validate structure
→ normalize fields
→ display preview
→ user reviews
→ user confirms
→ database save

AI should extract:

- product name
- category
- quantity
- unit
- expiry date where available

AI must not directly write unreviewed inventory.

---

# Workflow 2 — Label Scan

Input:

Product label image

Flow:

Camera/upload
→ image processing
→ Groq/OCR
→ structured extraction
→ validate
→ user review
→ save

Possible fields:

- name
- category
- quantity
- unit
- expiry date

---

# Workflow 3 — AI ShelfLife Brief

Input:

Current authenticated inventory

Before AI:

- fetch correct inventory
- calculate deterministic statuses
- calculate relevant metrics

Then:

validated inventory context
→ Groq
→ concise insight
→ sanitize output
→ display

Never display internal reasoning.

Output should be:

- concise
- actionable
- user-friendly

---

# Workflow 4 — Consumer Recipes

Input:

Current consumer inventory.

Step 1:
Fetch inventory.

Step 2:
Deterministically classify expiry.

Step 3:
REMOVE:

- expired products

Step 4:
Prioritize:

- soon-to-expire products
- usable products

Step 5:
Send valid candidates to AI.

Step 6:
Generate recipes.

Step 7:
Validate returned ingredients.

Step 8:
Display.

---

# Recipe Modes

## Use Soon

Highest priority:
products approaching expiry.

Never include expired products.

---

## Quick Meal

Optimize for:
- shorter preparation
- available ingredients

Still exclude expired products.

---

## Use What I Have

Maximize use of available inventory.

Still exclude expired products.

---

# Workflow 5 — Business Inventory Strategy

Input:

Business inventory.

Deterministic context:

- expiry
- quantity
- units
- stock levels
- FIFO ordering

AI may provide:

- operational observations
- recommendations
- prioritization explanations

AI must not replace deterministic FIFO or ownership logic.

---

# Workflow 6 — Waste Insights

Input:

Inventory + consumption history where available.

Deterministic calculations should establish:

- expired items
- near-expiry items
- stock exposure
- consumption quantities

AI can then explain:

- waste risks
- patterns
- possible actions

---

# AI Output Rules

Never trust arbitrary AI output.

Validate:

- schema
- dates
- quantities
- inventory IDs
- ingredient availability

AI-generated IDs must never be trusted as authoritative database IDs without verification.

---

# Prompt Rules

Prompts should explicitly request:

- final answer only
- no reasoning
- no <think>
- no internal analysis
- structured output when required

However, even if AI returns invalid or unexpected output, the application should sanitize or reject it.

---

# Failure Handling

If AI fails:

- show a clear user-facing error
- allow retry
- preserve existing inventory
- do not partially write corrupted data

AI failure must never corrupt the database.