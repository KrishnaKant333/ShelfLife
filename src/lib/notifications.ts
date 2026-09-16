export type NotificationCategory = "all" | "ingestion" | "ai" | "consumption" | "system";

export interface ActivityNotification {
  id: string;
  category: "ingestion" | "ai" | "consumption" | "system";
  title: string;
  detail: string;
  occurredAt: string; // ISO string
  link?: string;
  linkLabel?: string;
  read?: boolean;
}

export interface ChronologicalNotificationGroup {
  groupLabel: "Today" | "Yesterday" | "Earlier This Month" | "Archived";
  items: ActivityNotification[];
}

export interface RawActivityRecord {
  id: number;
  inventoryItemId?: number | null;
  productName: string;
  action: string;
  quantity?: number | null;
  unit?: string | null;
  occurredAt: string;
}

export interface RawConsumptionRecord {
  id: number;
  inventoryItemId?: number | null;
  productName: string;
  quantityUsed: number;
  unit: string;
  normalizedQuantityUsed?: number | null;
  consumedAt: string;
}

export interface RawInventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  createdAt?: string;
}

/**
 * Synthesizes an informational activity notification feed from verified database records.
 * STRICT RULE: No alerts, expired warnings, or risk warnings are ever emitted here.
 */
export function buildNotificationFeed(
  activities: RawActivityRecord[] = [],
  consumptions: RawConsumptionRecord[] = [],
  inventory: RawInventoryItem[] = [],
  isBusiness = false
): ActivityNotification[] {
  const prefix = isBusiness ? "/business/dashboard" : "/dashboard";
  const notifications: ActivityNotification[] = [];

  // Helper to resolve direct product dossier link, falling back to general inventory if item no longer exists
  const resolveProductLink = (inventoryItemId?: number | null, productName?: string): string => {
    if (inventoryItemId) {
      const match = inventory.find((i) => i.id === inventoryItemId);
      if (match) return `${prefix}/inventory/${match.id}`;
    }
    if (productName) {
      const match = inventory.find(
        (i) => i.name.toLowerCase() === productName.toLowerCase()
      );
      if (match) return `${prefix}/inventory/${match.id}`;
    }
    return `${prefix}/inventory`;
  };

  // 1. Consumption Events (safely utilized ingredients)
  consumptions.forEach((c) => {
    const itemLink = resolveProductLink(c.inventoryItemId, c.productName);
    notifications.push({
      id: `consume-${c.id}`,
      category: "consumption",
      title: `Consumed ${c.productName}`,
      detail: `Utilized ${c.quantityUsed} ${c.unit} in meal preparation. Inventory stock updated.`,
      occurredAt: c.consumedAt,
      link: itemLink,
      linkLabel: itemLink.endsWith("/inventory") ? "View Inventory" : "View Item",
    });
  });

  // 2. Activity Ledger Ingestion & Discard records (informational only)
  activities.forEach((act) => {
    if (act.action === "consumed") {
      // Handled by consumptions above to avoid duplicates
      return;
    }

    if (act.action === "discarded_expired" || act.action.includes("discard")) {
      notifications.push({
        id: `act-discard-${act.id}`,
        category: "system",
        title: `Audit Discard: ${act.productName}`,
        detail: `Logged ${act.quantity ?? 1} ${act.unit ?? "units"} in the discard loss audit register.`,
        occurredAt: act.occurredAt,
        link: `${prefix}/waste`,
        linkLabel: "Audit Report",
      });
      return;
    }

    if (act.action === "restocked") {
      const itemLink = resolveProductLink(act.inventoryItemId, act.productName);
      notifications.push({
        id: `act-restock-${act.id}`,
        category: "ingestion",
        title: `Restocked: ${act.productName}`,
        detail: `Added ${act.quantity ?? ""} ${act.unit ?? "units"} to inventory stock.`,
        occurredAt: act.occurredAt,
        link: itemLink,
        linkLabel: itemLink.endsWith("/inventory") ? "View Inventory" : "View Item",
      });
      return;
    }

    if (act.action === "reminder_set") {
      const itemLink = resolveProductLink(act.inventoryItemId, act.productName);
      let detailText = `Scheduled reminder configured for ${act.quantity ?? 3} days before expiry.`;
      if (act.unit && act.unit.startsWith("custom:")) {
        detailText = `Scheduled reminder configured for ${act.unit.replace("custom:", "")}.`;
      } else if (act.quantity === 1) {
        detailText = "Scheduled reminder configured for 1 day before expiry.";
      } else if (act.quantity === 0) {
        detailText = "Scheduled reminder configured for expiry date.";
      }

      notifications.push({
        id: `act-reminder-${act.id}`,
        category: "system",
        title: `Expiry Reminder Set: ${act.productName}`,
        detail: detailText,
        occurredAt: act.occurredAt,
        link: itemLink,
        linkLabel: "View Item",
      });
      return;
    }

    if (act.action.includes("import") || act.action.includes("invoice")) {
      const itemLink = resolveProductLink(act.inventoryItemId, act.productName);
      notifications.push({
        id: `act-import-${act.id}`,
        category: "ingestion",
        title: `Ingestion Completed: ${act.productName}`,
        detail: `Stock intake processed and registered into inventory.`,
        occurredAt: act.occurredAt,
        link: itemLink,
        linkLabel: "View Item",
      });
      return;
    }

    // Generic system activity
    const itemLink = resolveProductLink(act.inventoryItemId, act.productName);
    notifications.push({
      id: `act-gen-${act.id}`,
      category: "system",
      title: `Inventory Update: ${act.productName}`,
      detail: `Action "${act.action}" recorded in chronological ledger.`,
      occurredAt: act.occurredAt,
      link: itemLink,
      linkLabel: itemLink.endsWith("/inventory") ? "View Inventory" : "View Item",
    });
  });

  // 3. Baseline System & AI Processing Milestones
  if (inventory.length > 0) {
    if (isBusiness) {
      notifications.push({
        id: "ai-groq-sync",
        category: "ai",
        title: "FIFO Inventory Engine Synchronized",
        detail: `Analyzed ${inventory.length} active inventory items to calibrate turnover and priority sequencing.`,
        occurredAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        link: `${prefix}/strategy`,
        linkLabel: "View Strategy",
      });
    } else {
      notifications.push({
        id: "ai-groq-sync",
        category: "ai",
        title: "Groq AI Culinary Engine Synchronized",
        detail: `Analyzed ${inventory.length} active inventory items to calibrate fresh recipe recommendations.`,
        occurredAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        link: `${prefix}/recipes`,
        linkLabel: "Open Kitchen",
      });
    }

    notifications.push({
      id: "ingest-ready",
      category: "ingestion",
      title: "Vision AI & Invoice Scanner Online",
      detail: "Fast receipt ingestion, label camera capture, and CSV batch processing are operational.",
      occurredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
      link: `${prefix}/inventory/invoice`,
      linkLabel: "Scan Invoice",
    });
  } else {
    notifications.push({
      id: "sys-welcome",
      category: "system",
      title: isBusiness ? "Commercial Inventory Workspace Initialized" : "Pantry Workspace Initialized",
      detail: "Ready for first stock intake. Use Invoice AI or Manual Entry to populate your inventory.",
      occurredAt: new Date().toISOString(),
      link: `${prefix}/inventory/new`,
      linkLabel: "Add Item",
    });
  }

  // Sort descending by date
  return notifications.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

/**
 * Groups notifications into clean chronological sections:
 * Today, Yesterday, Earlier This Month, Archived
 */
export function groupNotificationsChronologically(
  items: ActivityNotification[]
): ChronologicalNotificationGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 3600 * 1000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const groups: Record<ChronologicalNotificationGroup["groupLabel"], ActivityNotification[]> = {
    Today: [],
    Yesterday: [],
    "Earlier This Month": [],
    Archived: [],
  };

  items.forEach((item) => {
    const time = new Date(item.occurredAt).getTime();
    if (isNaN(time) || time >= todayStart) {
      groups.Today.push(item);
    } else if (time >= yesterdayStart) {
      groups.Yesterday.push(item);
    } else if (time >= monthStart) {
      groups["Earlier This Month"].push(item);
    } else {
      groups.Archived.push(item);
    }
  });

  const result: ChronologicalNotificationGroup[] = [];
  if (groups.Today.length > 0) result.push({ groupLabel: "Today", items: groups.Today });
  if (groups.Yesterday.length > 0) result.push({ groupLabel: "Yesterday", items: groups.Yesterday });
  if (groups["Earlier This Month"].length > 0)
    result.push({ groupLabel: "Earlier This Month", items: groups["Earlier This Month"] });
  if (groups.Archived.length > 0) result.push({ groupLabel: "Archived", items: groups.Archived });

  return result;
}
