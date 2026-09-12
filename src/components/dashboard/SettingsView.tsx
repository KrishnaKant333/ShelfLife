"use client";

import { useState, useEffect, useTransition } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { type PlanId } from "@/lib/plans";
import SettingsNavRail, { type SettingsTabId } from "@/components/settings/SettingsNavRail";
import StickySaveBar from "@/components/settings/StickySaveBar";
import AccountTab from "@/components/settings/AccountTab";
import PreferencesTab from "@/components/settings/PreferencesTab";
import AlertsTab from "@/components/settings/AlertsTab";
import AIPreferencesTab from "@/components/settings/AIPreferencesTab";
import SecurityTab from "@/components/settings/SecurityTab";
import DataHubTab from "@/components/settings/DataHubTab";
import BillingTab from "@/components/settings/BillingTab";
import { updateProfileNameAction } from "@/lib/actions/settings";

interface SettingsViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    accountType: "consumer" | "business";
    businessId?: string | number | null;
    plan?: PlanId;
  };
  business?: {
    name?: string | null;
    industry?: string | null;
  } | null;
}

export default function SettingsView({ user, business }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("account");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const initialData = {
    name: user.name || "",
    businessName: business?.name || "",
    industry: business?.industry || "Restaurant & Culinary",
    shelfLifeBuffer: "5",
    unitSystem: "metric",
    showCulinaryDualDisplay: true,
    expiryAlerts: true,
    lowStockAlerts: true,
    expiryThreshold: "7",
    emailDigest: true,
    urgentBanner: true,
    recipeAiMode: "balanced",
    invoiceAutoCategorize: true,
    duplicateAutoMerge: true,
  };

  const [pristineData, setPristineData] = useState(initialData);
  const [formData, setFormData] = useState(initialData);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const storedBuffer = localStorage.getItem("shelf_shelf_life_buffer") || "5";
      const storedUnits = localStorage.getItem("shelf_unit_system") || "metric";
      const storedDual = localStorage.getItem("shelf_culinary_dual_display") !== "false";
      const storedExpiryAlerts = localStorage.getItem("shelf_expiry_alerts") !== "false";
      const storedLowStock = localStorage.getItem("shelf_lowstock_alerts") !== "false";
      const storedThreshold = localStorage.getItem("shelf_expiry_threshold") || "7";
      const storedDigest = localStorage.getItem("shelf_email_digest") !== "false";
      const storedBanner = localStorage.getItem("shelf_urgent_banner") !== "false";
      const storedAiMode = localStorage.getItem("shelf_recipe_ai_mode") || "balanced";
      const storedAutoCat = localStorage.getItem("shelf_invoice_auto_categorize") !== "false";
      const storedAutoMerge = localStorage.getItem("shelf_duplicate_auto_merge") !== "false";

      const loaded = {
        name: user.name || "",
        businessName: business?.name || "",
        industry: business?.industry || "Restaurant & Culinary",
        shelfLifeBuffer: storedBuffer,
        unitSystem: storedUnits,
        showCulinaryDualDisplay: storedDual,
        expiryAlerts: storedExpiryAlerts,
        lowStockAlerts: storedLowStock,
        expiryThreshold: storedThreshold,
        emailDigest: storedDigest,
        urgentBanner: storedBanner,
        recipeAiMode: storedAiMode,
        invoiceAutoCategorize: storedAutoCat,
        duplicateAutoMerge: storedAutoMerge,
      };

      setPristineData(loaded);
      setFormData(loaded);
    } catch {
      // Ignore local storage error in sandboxed environments
    }
  }, [user.name, business?.name, business?.industry]);

  // Track dirty state
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(pristineData);

  function handleFieldChange(field: string, value: any) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleDiscard() {
    setFormData(pristineData);
    setToastMessage({
      type: "success",
      text: "Modifications discarded. Form restored.",
    });
    setTimeout(() => setToastMessage(null), 3000);
  }

  function handleSave() {
    startTransition(async () => {
      // 1. Save profile (and business details if business account)
      const isBusiness = user.accountType === "business";
      const profilePayload = {
        name: formData.name,
        ...(isBusiness
          ? {
              businessName: formData.businessName,
              industry: formData.industry,
            }
          : {}),
      };

      const profileRes = await updateProfileNameAction(profilePayload);

      if (profileRes.error) {
        setToastMessage({ type: "error", text: profileRes.error });
        return;
      }

      // 2. Persist local workspace preferences
      try {
        localStorage.setItem("shelf_shelf_life_buffer", formData.shelfLifeBuffer);
        localStorage.setItem("shelf_unit_system", formData.unitSystem);
        localStorage.setItem("shelf_culinary_dual_display", String(formData.showCulinaryDualDisplay));
        localStorage.setItem("shelf_expiry_alerts", String(formData.expiryAlerts));
        localStorage.setItem("shelf_lowstock_alerts", String(formData.lowStockAlerts));
        localStorage.setItem("shelf_expiry_threshold", formData.expiryThreshold);
        localStorage.setItem("shelf_email_digest", String(formData.emailDigest));
        localStorage.setItem("shelf_urgent_banner", String(formData.urgentBanner));
        localStorage.setItem("shelf_recipe_ai_mode", formData.recipeAiMode);
        localStorage.setItem("shelf_invoice_auto_categorize", String(formData.invoiceAutoCategorize));
        localStorage.setItem("shelf_duplicate_auto_merge", String(formData.duplicateAutoMerge));
      } catch (err) {
        console.error("Local storage error:", err);
      }

      setPristineData(formData);
      setToastMessage({
        type: "success",
        text: "All workspace preferences and profile settings saved successfully.",
      });
      setTimeout(() => setToastMessage(null), 4000);
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Executive Masthead */}
      <div className="border-b border-[var(--shelf-border)] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[var(--shelf-cream)]/80 dark:bg-emerald-950/40 border border-[var(--shelf-border)] text-[var(--shelf-forest)] mb-2">
              <Sparkles size={11} />
              Administrative Command
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[var(--shelf-dark)]">
              Workspace Settings & Control Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--shelf-muted)]">
              Configure profile identity, freshness heuristics, safeguard thresholds, AI algorithms, and data security.
            </p>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 max-w-sm animate-in fade-in slide-in-from-top-2 duration-150 ${
                toastMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20"
              }`}
            >
              {toastMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span className="font-medium">{toastMessage.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Navigation Rail */}
        <SettingsNavRail
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasUnsavedChanges={hasUnsavedChanges}
          isBusiness={user.accountType === "business"}
        />

        {/* Content Viewport */}
        <main className="flex-1 w-full min-w-0" role="region" aria-label="Settings Tab Content">
          {activeTab === "account" && (
            <AccountTab
              user={user}
              business={business}
              formData={formData}
              onChange={handleFieldChange}
            />
          )}

          {activeTab === "preferences" && (
            <PreferencesTab
              formData={formData}
              onChange={handleFieldChange}
              isBusiness={user.accountType === "business"}
            />
          )}

          {activeTab === "alerts" && (
            <AlertsTab
              formData={formData}
              onChange={handleFieldChange}
            />
          )}

          {activeTab === "ai" && (
            <AIPreferencesTab
              formData={formData}
              onChange={handleFieldChange}
              isBusiness={user.accountType === "business"}
            />
          )}

          {activeTab === "security" && <SecurityTab />}

          {activeTab === "data" && (
            <DataHubTab isBusiness={user.accountType === "business"} />
          )}

          {activeTab === "billing" && (
            <BillingTab user={user} />
          )}
        </main>
      </div>

      {/* Sticky Save Bar for Dirty State */}
      <StickySaveBar
        visible={hasUnsavedChanges}
        isSaving={isPending}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  );
}
