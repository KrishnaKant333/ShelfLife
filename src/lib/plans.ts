// Centralized plan configuration for ShelfLife
// This is the single source of truth for pricing and plan definitions

export type PlanId = 
  | "consumer_free" 
  | "consumer_plus" 
  | "business_starter" 
  | "business_pro" 
  | "business_growth";

export type AccountType = "consumer" | "business";

export type Feature = 
  // Common features
  | "inventory"
  | "barcode_scan"
  | "label_scan"
  | "csv_import"
  | "invoice_import"
  | "expiry_alerts"
  | "waste_insights"
  | "analytics"
  | "use_first"
  | "consumption_tracking"
  | "csv_export"
  | "pdf_export"
  
  // Consumer features
  | "ai_recipes"
  | "recipe_modes"
  | "shopping_list"
  | "advanced_ai_recipes"
  | "historical_analytics"
  | "consumption_trends"
  | "waste_trends"
  | "advanced_reports"
  | "xlsx_export"
  | "higher_import_limits"
  | "extended_history"
  | "weekly_meal_planning"
  
  // Business features
  | "fifo"
  | "inventory_strategy"
  | "advanced_analytics"
  | "team_members"
  | "roles_permissions"
  | "multiple_locations"
  | "forecasting"
  | "integrations"
  | "advanced_inventory_strategy"
  | "advanced_waste_insights"
  | "advanced_invoice_intelligence"
  | "higher_unlimited_imports";

export interface Plan {
  id: PlanId;
  name: string;
  accountType: AccountType;
  price: number; // in rupees
  billingPeriod: "monthly" | "yearly";
  description: string;
  longDescription?: string;
  features: Feature[];
  recommended?: boolean;
  status: "available" | "coming_soon";
}

export const PLANS: Record<PlanId, Plan> = {
  consumer_free: {
    id: "consumer_free",
    name: "Free",
    accountType: "consumer",
    price: 0,
    billingPeriod: "monthly",
    description: "Everything you need to manage your food inventory.",
    longDescription: "Perfect for personal use. Track your inventory, monitor expiry dates, and reduce waste.",
    features: [
      "inventory",
      "barcode_scan",
      "label_scan",
      "csv_import",
      "invoice_import",
      "expiry_alerts",
      "waste_insights",
      "analytics",
      "use_first",
      "consumption_tracking",
      "csv_export",
      "pdf_export",
      "ai_recipes",
      "recipe_modes",
      "shopping_list",
    ],
    status: "available",
  },
  consumer_plus: {
    id: "consumer_plus",
    name: "Plus",
    accountType: "consumer",
    price: 149,
    billingPeriod: "monthly",
    description: "Smarter planning, deeper insights and more personalized AI.",
    longDescription: "Everything in Free, plus advanced analytics, AI-powered meal planning and detailed consumption insights.",
    features: [
      "inventory",
      "barcode_scan",
      "label_scan",
      "csv_import",
      "invoice_import",
      "expiry_alerts",
      "waste_insights",
      "analytics",
      "use_first",
      "consumption_tracking",
      "csv_export",
      "pdf_export",
      "ai_recipes",
      "recipe_modes",
      "shopping_list",
      "advanced_ai_recipes",
      "historical_analytics",
      "consumption_trends",
      "waste_trends",
      "weekly_meal_planning",
      "advanced_reports",
      "xlsx_export",
      "higher_import_limits",
      "extended_history",
    ],
    status: "available",
  },
  business_starter: {
    id: "business_starter",
    name: "Starter",
    accountType: "business",
    price: 0,
    billingPeriod: "monthly",
    description: "Essential inventory management for small businesses.",
    longDescription: "Start tracking inventory smartly. Monitor expiry dates and manage stock efficiently.",
    features: [
      "inventory",
      "barcode_scan",
      "label_scan",
      "csv_import",
      "invoice_import",
      "expiry_alerts",
      "waste_insights",
      "analytics",
      "use_first",
      "consumption_tracking",
      "csv_export",
      "pdf_export",
      "fifo",
      "inventory_strategy",
    ],
    status: "available",
  },
  business_pro: {
    id: "business_pro",
    name: "Pro",
    accountType: "business",
    price: 499,
    billingPeriod: "monthly",
    description: "AI-powered inventory intelligence for growing businesses.",
    longDescription: "Advanced analytics, team collaboration, and AI-driven inventory strategy.",
    features: [
      "inventory",
      "barcode_scan",
      "label_scan",
      "csv_import",
      "invoice_import",
      "expiry_alerts",
      "waste_insights",
      "analytics",
      "use_first",
      "consumption_tracking",
      "csv_export",
      "pdf_export",
      "fifo",
      "inventory_strategy",
      "advanced_analytics",
      "historical_analytics",
      "advanced_inventory_strategy",
      "advanced_waste_insights",
      "advanced_invoice_intelligence",
      "team_members",
      "roles_permissions",
      "higher_unlimited_imports",
      "xlsx_export",
      "advanced_reports",
    ],
    recommended: true,
    status: "available",
  },
  business_growth: {
    id: "business_growth",
    name: "Growth",
    accountType: "business",
    price: 999,
    billingPeriod: "monthly",
    description: "Centralized intelligence for larger multi-location operations.",
    longDescription: "Everything in Pro, plus multi-location support, forecasting and integrations.",
    features: [
      "inventory",
      "barcode_scan",
      "label_scan",
      "csv_import",
      "invoice_import",
      "expiry_alerts",
      "waste_insights",
      "analytics",
      "use_first",
      "consumption_tracking",
      "csv_export",
      "pdf_export",
      "fifo",
      "inventory_strategy",
      "advanced_analytics",
      "historical_analytics",
      "advanced_inventory_strategy",
      "advanced_waste_insights",
      "advanced_invoice_intelligence",
      "team_members",
      "roles_permissions",
      "higher_unlimited_imports",
      "xlsx_export",
      "advanced_reports",
      "multiple_locations",
      "forecasting",
      "integrations",
    ],
    status: "available",
  },
};

// Get default plan for account type
export function getDefaultPlan(accountType: AccountType): PlanId {
  return accountType === "consumer" ? "consumer_free" : "business_starter";
}

// Get all plans for account type
export function getPlansByAccountType(accountType: AccountType): Plan[] {
  return Object.values(PLANS).filter(plan => plan.accountType === accountType);
}

// Get plan by ID
export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

// Check if user has access to feature
export function canUseFeature(planId: PlanId, feature: Feature): boolean {
  const plan = PLANS[planId];
  return plan.features.includes(feature);
}

// Get feature status for display
export function getFeatureStatus(planId: PlanId, feature: Feature): "included" | "not_included" | "coming_soon" {
  // For this implementation, if feature is in the plan, it's included
  // Otherwise it's not included (we don't separate "coming soon" at feature level)
  return canUseFeature(planId, feature) ? "included" : "not_included";
}

// Feature display information
export const FEATURE_LABELS: Record<Feature, { label: string; category: string }> = {
  // Common
  "inventory": { label: "Inventory Management", category: "core" },
  "barcode_scan": { label: "Barcode Scanning", category: "core" },
  "label_scan": { label: "AI Label Scanning", category: "core" },
  "csv_import": { label: "CSV Import", category: "core" },
  "invoice_import": { label: "Invoice Import", category: "core" },
  "expiry_alerts": { label: "Expiry Alerts", category: "core" },
  "waste_insights": { label: "Waste Insights", category: "core" },
  "analytics": { label: "Basic Analytics", category: "core" },
  "use_first": { label: "Use First / FIFO", category: "core" },
  "consumption_tracking": { label: "Consumption Tracking", category: "core" },
  "csv_export": { label: "CSV Export", category: "export" },
  "pdf_export": { label: "PDF Export", category: "export" },
  
  // Consumer
  "ai_recipes": { label: "AI Recipes", category: "consumer" },
  "recipe_modes": { label: "Recipe Modes", category: "consumer" },
  "shopping_list": { label: "Shopping List", category: "consumer" },
  "advanced_ai_recipes": { label: "Advanced AI Recipes", category: "consumer" },
  "historical_analytics": { label: "Historical Analytics", category: "consumer" },
  "consumption_trends": { label: "Consumption Trends", category: "consumer" },
  "waste_trends": { label: "Waste Trends", category: "consumer" },
  "weekly_meal_planning": { label: "Weekly Meal Planning", category: "consumer" },
  "advanced_reports": { label: "Advanced Reports", category: "reports" },
  "xlsx_export": { label: "XLSX Export", category: "export" },
  "higher_import_limits": { label: "Higher Import Limits", category: "limits" },
  "extended_history": { label: "Extended History", category: "history" },
  
  // Business
  "fifo": { label: "FIFO Prioritization", category: "business" },
  "inventory_strategy": { label: "Inventory Strategy", category: "business" },
  "advanced_analytics": { label: "Advanced Analytics", category: "business" },
  "team_members": { label: "Team Members", category: "business" },
  "roles_permissions": { label: "Roles & Permissions", category: "business" },
  "multiple_locations": { label: "Multiple Locations", category: "business" },
  "forecasting": { label: "Forecasting", category: "business" },
  "integrations": { label: "Integrations", category: "business" },
  "advanced_inventory_strategy": { label: "Advanced Inventory Strategy", category: "business" },
  "advanced_waste_insights": { label: "Advanced Waste Insights", category: "business" },
  "advanced_invoice_intelligence": { label: "Advanced Invoice Intelligence", category: "business" },
  "higher_unlimited_imports": { label: "Unlimited Imports", category: "limits" },
};
