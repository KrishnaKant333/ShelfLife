# ShelfLife Specification: Contextual Product Dossier Quick Actions

**Cycle**: P2 / UX and Workflow Improvements  
**Status**: 🟡 Queued for Implementation (Specification Ready)  
**Applies To**: Consumer Kitchen (`ProductDetailDrawer.tsx`) and Commercial Operations (`ProductDetailDrawer.tsx`)

---

## 1. Objective

Replace disorienting screen redirects in the Partial Product Dossier with **immediate, contextual slide-over sheets and dialogs**. Enable users to restock quantities, reassign categories, configure item-specific expiration reminders, and safely delete items directly within the dossier flow without navigating away to full edit or alerts pages.

---

## 2. Problem & Observed Friction

The Partial Product Dossier (`ProductDetailDrawer.tsx`) currently presents five quick actions:
1. *View Full Digital Dossier*
2. *Add More Stock*
3. *Set Expiry Reminder*
4. *Move to Another Category*
5. *Delete Item*

Currently, several of these actions act as clumsy shortcuts that redirect the user away from their active context:
- **"Add More Stock"** and **"Move to Another Category"** simply navigate to `/inventory/[id]/edit`—a full-page multi-field form where the user must hunt for the specific field they wanted to change.
- **"Set Expiry Reminder"** navigates to `/dashboard/alerts`—a system-wide alert feed rather than an item-specific notification configuration.
- This creates cognitive friction, forces extra page reloads, and breaks the user's inventory review momentum.

---

## 3. Product Principle

**An action on a product should happen on that product.** If a user wants to add 1 litre of milk to their existing bottle, they should type `1`, see the new total (`2.5 L`), tap confirm, and remain in their inventory workspace.

---

## 4. Contextual Quick Action Specifications

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PARTIAL PRODUCT DOSSIER                           │
├─────────────────────────────────────────────────────────────────────────┤
│ [Quick Use]  [Add Stock]  [Move Category]  [Set Reminder]  [Delete]     │
└──────┬────────────┬──────────────┬────────────────┬────────────┬────────┘
       │            │              │                │            │
       ▼            ▼              ▼                ▼            ▼
  [Portion Modal] [Restock Sheet][Category Picker][Reminder Pop][Confirm]
```

### 4.1 Action A: Add More Stock (Contextual Restock)

Instead of routing to the full edit page, clicking **"Add More Stock"** opens a dedicated, focused modal or sub-sheet:

1. **State & Display**:
   - Header: *"Add Stock to [Product Name]"*
   - Current balance indicator: `Current Stock: 2.5 kg`
   - Numeric input field: `Amount to Add: [ 1.25 ] kg`
   - Real-time resulting balance calculator:
     $$\text{New Total} = \text{CurrentStock} + \text{AddedAmount} \quad (\text{e.g. } 2.5\text{ kg} + 1.25\text{ kg} = 3.75\text{ kg})$$
2. **Deterministic Rules**:
   - Continuous units accept decimals (`min="0.0001"`, `step="any"`, `inputMode="decimal"`).
   - Discrete units strictly enforce whole integers (`min="1"`, `step="1"`).
   - Prevents zero or negative inputs.
3. **Audit Ledger Logging**:
   - Appends an `InventoryActivity` record: `action: "restocked"`, `quantity: addedAmount`, `occurredAt: now()`.
   - Confirms instantly with a micro-toast: *"Added [amount] [unit] to [name]. New total: [total] [unit]"*.

---

### 4.2 Action B: Move to Another Category (Inline Category Reassigner)

Instead of navigating to the edit page, clicking **"Move to Another Category"** opens an inline category selector:

1. **Category Options**:
   - Grid or list of existing pantry categories with current category checked.
   - Quick-search filter if the category list exceeds 6 items.
   - **"+ Add New Category"** inline field enabling instant creation of custom tags (e.g. *"Cellar"*, *"Freezer Chest"*, *"Baking Drawer"*).
2. **Instant Execution**:
   - Tapping a new category immediately submits a lightweight server action (`updateProductCategoryAction(itemId, newCategory)`).
   - Updates the dossier badge dynamically and refreshes the parent catalog without full-page navigation.

---

### 4.3 Action C: Set Expiry Reminder (Item-Specific Alert Workflow)

Clicking **"Set Expiry Reminder"** does **NOT** redirect to `/dashboard/alerts`. Instead, it opens an item-specific reminder configuration popover:

1. **Clarification of Roles**:
   - **Alerts (`/dashboard/alerts`)**: System-level actionable warnings (items currently expired or critically low).
   - **Notifications (`/dashboard/notifications`)**: Activity feed and scheduled reminders.
2. **Item Reminder Schedule Options**:
   - `1 day before expiry`
   - `2 days before expiry`
   - `3 days before expiry` *(Default)*
   - `1 week before expiry`
   - `Custom Date / Time` *(Datepicker)*
3. **Behavior**:
   - Schedules a targeted notification in the user's notification ledger tied specifically to `inventoryItemId`.
   - Visual feedback: A subtle bell badge appears in the dossier header (`🔔 Reminder active for [date]`).

---

### 4.4 Action D: Delete Item (Safe Confirmation & Audit Logging)

1. **Safety Modal**:
   - Displays clear warning: *"Are you sure you want to remove [Product Name] ([Quantity] [Unit]) from inventory?"*
2. **Reason Prompt (Enables Accurate Waste Analytics)**:
   - Radio buttons or buttons:
     - `Consumed / Finished` → Logs as healthy consumption.
     - `Spoiled / Expired` → Logs as discarded waste (feeds into Waste Analytics).
     - `Entry Error / Accidental Duplicate` → Completely deletes record without skewing waste metrics.
3. **Execution**:
   - Closes dossier, smoothly removes item row from catalog, and displays a 5-second undo toast: *"Removed [name]. [Undo]"*.

---

## 5. Mobile Ergonomics

- On screens <768px, all four sub-actions render as smooth **slide-up bottom sheets** (`rounded-t-3xl`, drag handle, background scrim).
- Primary confirmation buttons are pinned to the bottom thumb zone with standard 44px minimum heights.

---

## 6. Consumer vs. Business Parity

- **Consumer**: Focuses on quick kitchen pantry adjustments, household leftovers, and cooking prep.
- **Business**: In commercial mode, "Add More Stock" includes optional fields for `Supplier Invoice #`, `Batch / Lot ID`, and `Unit Cost` to preserve commercial FIFO and inventory valuation accuracy.

---

## 7. Acceptance Criteria

- [ ] Zero quick actions in the Partial Product Dossier navigate the browser to a full edit page.
- [ ] "Add More Stock" displays current stock, input amount, and resulting total before confirmation.
- [ ] Restock operations record an `InventoryActivity` ledger entry.
- [ ] Category moves can be executed and confirmed in under 3 seconds.
- [ ] "Set Expiry Reminder" configures an item-specific schedule without navigating to `/alerts`.
- [ ] Deletion prompts for reason to ensure waste analytics remain pure.
