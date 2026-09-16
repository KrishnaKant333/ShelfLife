"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import Image from "next/image";
import {
  extractMultiViewLabelAction,
  discardUploadedImagesAction,
} from "@/lib/actions/label-scan";
import { createInventoryItem, type CreateInventoryState } from "@/lib/actions/inventory";
import { createBusinessInventoryItem } from "@/lib/actions/business-inventory";
import { isIntegerUnit } from "@/lib/normalization";
import {
  Camera,
  FileText,
  Upload,
  Plus,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  Star,
  Layers,
  CheckCircle2,
  Trash2,
  Package,
  Scale,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface AddProductFlowProps {
  isBusiness?: boolean;
}

const initialFormState: CreateInventoryState = {};
type AddProductTab = "manual" | "label" | "import";

interface ProductViewItem {
  id: string;
  file: File;
  previewUrl: string;
  angle: "front" | "back" | "rim" | "side";
  isPrimary: boolean;
}

const ANGLE_LABELS: Record<string, string> = {
  front: "Front (Brand & Name)",
  back: "Back (Quantity & Ingredients)",
  rim: "Rim/Cap (Stamped Expiry)",
  side: "Side (Nutrition & Storage)",
};

export default function AddProductFlow({ isBusiness = false }: AddProductFlowProps) {
  const [activeTab, setActiveTab] = useState<AddProductTab>("manual");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "label" || tab === "import" || tab === "manual") {
        window.setTimeout(() => setActiveTab(tab), 0);
      }
    }
  }, []);

  // Form Field States (pre-filled by multi-view AI extraction or edited manually)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pieces");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryType, setExpiryType] = useState<string>("UNKNOWN");
  const [isEstimated, setIsEstimated] = useState<boolean>(false);
  const [daysEstimated, setDaysEstimated] = useState<number | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState("");
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>([]);

  // Multi-View Image Collection States
  const [views, setViews] = useState<ProductViewItem[]>([]);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelError, setLabelError] = useState("");

  // Camera States
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Server Action for product creation
  const [state, formAction, pending] = useActionState(
    isBusiness ? createBusinessInventoryItem : createInventoryItem,
    initialFormState
  );

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      views.forEach((v) => URL.revokeObjectURL(v.previewUrl));
    };
  }, [views]);

  function addFilesToViews(newFiles: File[]) {
    setLabelError("");
    const maxAvailable = 4 - views.length;
    if (maxAvailable <= 0) {
      setLabelError("Maximum 4 angles per product reached.");
      return;
    }

    const filesToAdd = newFiles.slice(0, maxAvailable);
    const defaultAngles: Array<"front" | "back" | "rim" | "side"> = ["front", "back", "rim", "side"];

    const newViewItems: ProductViewItem[] = filesToAdd.map((file, idx) => {
      const angleIndex = (views.length + idx) % defaultAngles.length;
      return {
        id: `view-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        angle: defaultAngles[angleIndex],
        isPrimary: views.length === 0 && idx === 0,
      };
    });

    setViews((prev) => {
      const updated = [...prev, ...newViewItems];
      // Ensure at least one item is marked primary
      if (!updated.some((v) => v.isPrimary) && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  }

  function removeView(id: string) {
    setViews((prev) => {
      const target = prev.find((v) => v.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const filtered = prev.filter((v) => v.id !== id);
      if (filtered.length > 0 && !filtered.some((v) => v.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  }

  function setPrimaryView(id: string) {
    setViews((prev) =>
      prev.map((v) => ({
        ...v,
        isPrimary: v.id === id,
      }))
    );
  }

  function updateViewAngle(id: string, angle: "front" | "back" | "rim" | "side") {
    setViews((prev) =>
      prev.map((v) => (v.id === id ? { ...v, angle } : v))
    );
  }

  async function triggerMultiViewExtraction(viewsToExtract = views) {
    if (viewsToExtract.length === 0) {
      setLabelError("Please provide at least one product photo.");
      return;
    }

    setLabelError("");
    setLabelLoading(true);

    try {
      // Clean up previous unconfirmed images if user is rescanning
      const prevPending = [imageUrl, ...additionalImageUrls].filter(Boolean);
      if (prevPending.length > 0) {
        void discardUploadedImagesAction(prevPending);
      }

      const formData = new FormData();
      // Ensure primary view is first in the payload
      const sorted = [...viewsToExtract].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      sorted.forEach((view) => {
        formData.append("files", view.file);
      });

      const result = await extractMultiViewLabelAction(formData);

      if (result.name) setName(result.name);
      if (result.category) setCategory(result.category);
      if (result.quantity != null) setQuantity(String(result.quantity));
      if (result.unit) setUnit(result.unit);
      if (result.expiryDate) setExpiryDate(result.expiryDate);
      if (result.expiryType) setExpiryType(result.expiryType);
      setIsEstimated(result.isEstimated ?? false);
      setDaysEstimated(result.daysEstimated);
      if (result.imageUrl) setImageUrl(result.imageUrl);
      if (result.additionalImageUrls) setAdditionalImageUrls(result.additionalImageUrls);

      setLabelError("");
      setActiveTab("manual");
    } catch (err) {
      setLabelError(err instanceof Error ? err.message : "Multi-view product extraction failed.");
    } finally {
      setLabelLoading(false);
    }
  }

  function stopCamera() {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraOpen(false);
  }

  useEffect(() => {
    if (!cameraOpen || !cameraStreamRef.current || !videoRef.current) return;

    const video = videoRef.current;
    const stream = cameraStreamRef.current;
    let cancelled = false;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    const startPlayback = async () => {
      try {
        await video.play();
        if (!cancelled) setCameraError("");
      } catch {
        if (!cancelled) {
          setCameraError("The camera preview could not start. Check browser camera permission and try again.");
        }
      }
    };

    const handleLoadedMetadata = () => {
      void startPlayback();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    void startPlayback();

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.pause();
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [cameraOpen]);

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  async function openCamera() {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera capture is unavailable in this browser. Use Upload image instead.");
      return;
    }

    try {
      cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setCameraOpen(true);
    } catch {
      setCameraError("Camera access was blocked or unavailable. Allow camera access or use Upload image instead.");
    }
  }

  async function captureCameraFrame() {
    if (views.length >= 4) {
      setCameraError("Maximum 4 angles captured. Tap 'Extract & Review' to proceed.");
      return;
    }

    const video = videoRef.current;
    if (!video) {
      setCameraError("The camera preview is unavailable.");
      return;
    }

    try {
      await video.play();
    } catch {
      setCameraError("Camera preview could not start.");
      return;
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("The camera is still focusing. Try again in a moment.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );

    if (!blob) {
      setCameraError("Unable to capture frame. Please try again.");
      return;
    }

    const file = new File([blob], `camera-angle-${views.length + 1}-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    addFilesToViews([file]);
    setCameraError("");
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      addFilesToViews(Array.from(fileList));
    }
    // reset input value so identical files can be re-selected if removed
    e.target.value = "";
  }

  const inventoryPath = isBusiness ? "/business/dashboard/inventory" : "/dashboard/inventory";

  return (
    <div className="mx-auto max-w-4xl space-y-5 md:space-y-6">
      {/* Navigation Header */}
      {/* Page Header */}
      <div>
        <Link
          href={inventoryPath}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--shelf-forest)] hover:underline transition-colors"
        >
          <span aria-hidden="true">←</span> Back to Inventory
        </Link>
        <h1 className="sl-display-serif mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-[var(--app-text-display)]">
          Add New Product
        </h1>
        <p className="mt-1.5 text-sm text-[var(--app-text-muted)]">
          Add individual products manually, synthesize details from multiple camera angles with AI, or batch import lists.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="sl-editorial-card rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] overflow-hidden shadow-xl">
        {/* Segmented Tab Pill Navigation */}
        <div className="p-3 border-b border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/70">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border-subtle)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === "manual"
                  ? "bg-[var(--app-accent-emerald)] text-white shadow-sm"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] hover:bg-[var(--app-surface-base)]"
              }`}
            >
              <Plus size={14} />
              Review & Edit Form
            </button>
            <button
              onClick={() => setActiveTab("label")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === "label"
                  ? "bg-[var(--app-accent-emerald)] text-white shadow-sm"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] hover:bg-[var(--app-surface-base)]"
              }`}
            >
              <Camera size={14} />
              Multi-View Scan (AI)
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === "import"
                  ? "bg-[var(--app-accent-emerald)] text-white shadow-sm"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] hover:bg-[var(--app-surface-base)]"
              }`}
            >
              <Upload size={14} />
              Bulk Import
            </button>
          </div>
        </div>

        {/* Tab Content Box */}
        <div className="p-5 md:p-8">
          {/* MULTI-VIEW LABEL SCAN TAB */}
          {activeTab === "label" && (
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--app-accent-emerald)]">
                  <Sparkles size={24} />
                </div>
                <h3 className="sl-display-serif text-2xl font-semibold text-[var(--app-text-display)]">Multi-Angle Product Scanner</h3>
                <p className="text-xs md:text-sm text-[var(--app-text-muted)] leading-relaxed">
                  Upload or snap multiple angles of a single item (front brand, back nutrition/weight, rim expiry stamp).
                  ShelfLife synthesizes all views into <strong className="text-[var(--app-text-display)]">one comprehensive product dossier</strong>.
                </p>
              </div>

              {/* Angle Action Buttons */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void openCamera()}
                  disabled={labelLoading || cameraOpen}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent-emerald)] px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Camera size={16} />
                  {views.length > 0 ? "Add Camera Angle" : "Capture with Camera"}
                </button>

                <label className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)]/80 hover:text-[var(--app-text-display)] transition-all">
                  <Upload size={16} />
                  {views.length > 0 ? "Add More Photos" : "Upload Photos (1–4)"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    disabled={labelLoading}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* PROGRESSIVE CAMERA VIEWFINDER */}
              {cameraOpen && (
                <div className="space-y-3 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] p-3.5 text-left">
                  <div className="relative overflow-hidden rounded-xl bg-black border border-white/10">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      aria-label="Live camera preview"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-black/70 border border-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Angle {views.length + 1} of 4
                    </div>
                  </div>

                  {/* Camera Controls & Hint */}
                  <div className="p-1 space-y-3">
                    <p className="text-xs text-[var(--app-text-muted)] font-medium">
                      {views.length === 0 && "Point at front brand panel and tap Snap Angle."}
                      {views.length === 1 && "Front captured! Now snap the back for ingredients & quantity, or rim for expiry."}
                      {views.length === 2 && "2 angles captured! Snap rim/cap for stamped expiry date, or finish now."}
                      {views.length >= 3 && "All key angles covered. Tap 'Extract Single Product' to synthesize with AI."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void captureCameraFrame()}
                        disabled={views.length >= 4}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--app-accent-emerald)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        <Camera size={15} />
                        Snap Angle ({views.length}/4)
                      </button>

                      {views.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            stopCamera();
                            void triggerMultiViewExtraction();
                          }}
                          disabled={labelLoading}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm"
                        >
                          <Sparkles size={15} />
                          Extract ({views.length})
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {cameraError && (
                <p role="alert" aria-live="polite" className="text-sm font-medium text-red-600">
                  {cameraError}
                </p>
              )}

              {/* SELECTED VIEWS TRAY / STRIP */}
              {views.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/50 p-4 text-left shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--app-text-display)]">
                      <Layers size={15} className="text-[var(--app-accent-emerald)]" />
                      <span>Captured Product Angles ({views.length}/4)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViews([])}
                      className="text-xs font-semibold text-red-500 hover:text-red-400 transition flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {views.map((view, idx) => (
                      <div
                        key={view.id}
                        className={`group relative flex flex-col rounded-xl border p-2 transition ${
                          view.isPrimary
                            ? "border-[var(--app-accent-emerald)] bg-[var(--app-accent-emerald)]/10 shadow-xs"
                            : "border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] hover:border-[var(--app-border-strong)]"
                        }`}
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black/20">
                          <Image
                            src={view.previewUrl}
                            alt={`Product view angle ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />

                          {/* Primary indicator badge */}
                          {view.isPrimary && (
                            <div className="absolute top-1.5 left-1.5 rounded-md bg-[var(--app-accent-emerald)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                              Primary
                            </div>
                          )}

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeView(view.id)}
                            aria-label={`Remove view ${idx + 1}`}
                            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600 transition"
                          >
                            <X size={12} />
                          </button>
                        </div>

                        {/* Angle selector & set primary control */}
                        <div className="mt-2 space-y-1.5">
                          <select
                            value={view.angle}
                            onChange={(e) =>
                              updateViewAngle(
                                view.id,
                                e.target.value as "front" | "back" | "rim" | "side"
                              )
                            }
                            className="w-full rounded-md border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] px-2 py-1 text-[11px] font-medium text-[var(--app-text-display)] outline-none"
                          >
                            <option value="front">{ANGLE_LABELS.front}</option>
                            <option value="back">{ANGLE_LABELS.back}</option>
                            <option value="rim">{ANGLE_LABELS.rim}</option>
                            <option value="side">{ANGLE_LABELS.side}</option>
                          </select>

                          {!view.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryView(view.id)}
                              className="flex w-full items-center justify-center gap-1 rounded-md border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)] py-1 text-[10px] font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text-display)] hover:border-[var(--app-accent-emerald)] transition"
                            >
                              <Star size={10} /> Make Primary
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Extract Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => void triggerMultiViewExtraction()}
                      disabled={labelLoading}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-accent-emerald)] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {labelLoading ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          Synthesizing {views.length} Angles with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          Extract Single Product from {views.length} View{views.length > 1 ? "s" : ""}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {labelLoading && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--app-accent-emerald)]">
                  <RefreshCw size={14} className="animate-spin" />
                  Merging product identity, net quantity, and stamped dates...
                </div>
              )}

              {labelError && (
                <div role="alert" aria-live="polite" className="flex items-center justify-center gap-1.5 text-sm font-medium text-red-500">
                  <AlertCircle size={15} />
                  <span>{labelError}</span>
                </div>
              )}
            </div>
          )}

          {/* BULK IMPORT TAB */}
          {activeTab === "import" && (
            <div className="grid gap-6 md:grid-cols-2 py-4">
              <div className="group rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-6 space-y-4 text-center hover:border-[var(--app-accent-emerald)] transition-all">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[var(--app-accent-emerald)]">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="sl-display-serif text-xl font-semibold text-[var(--app-text-display)]">Import CSV</h4>
                  <p className="mt-1 text-xs text-[var(--app-text-muted)] leading-relaxed">
                    Upload standard spreadsheet inventories (headers: name, category, quantity, unit, expiryDate).
                  </p>
                </div>
                <Link
                  href={isBusiness ? "/business/dashboard/inventory/import" : "/dashboard/inventory/import"}
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--app-accent-emerald)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Upload CSV
                </Link>
              </div>

              <div className="group rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-6 space-y-4 text-center hover:border-[var(--app-accent-emerald)] transition-all">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                  <Upload size={24} />
                </div>
                <div>
                  <h4 className="sl-display-serif text-xl font-semibold text-[var(--app-text-display)]">Import Invoice</h4>
                  <p className="mt-1 text-xs text-[var(--app-text-muted)] leading-relaxed">
                    Upload supplier invoice or receipt photos (JPG, PNG) and auto-extract complete orders with AI.
                  </p>
                </div>
                <Link
                  href={isBusiness ? "/business/dashboard/inventory/invoice" : "/dashboard/inventory/invoice"}
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-display)] transition-all"
                >
                  Upload Invoice
                </Link>
              </div>
            </div>
          )}

          {/* MANUAL FORM & PRE-FILLED CONFIRMATION */}
          {activeTab === "manual" && (
            <form action={formAction} className="space-y-6">
              {/* Product Imagery Banner if images were extracted */}
              {imageUrl && (
                <div className="rounded-2xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-accent-emerald)] flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Associated Product Imagery
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const urlsToDiscard = [imageUrl, ...additionalImageUrls].filter(Boolean);
                        setImageUrl("");
                        setAdditionalImageUrls([]);
                        if (urlsToDiscard.length > 0) {
                          void discardUploadedImagesAction(urlsToDiscard);
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-400 font-medium transition"
                    >
                      Remove imagery
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Primary Image Thumbnail */}
                    <div className="relative flex items-center gap-3 rounded-xl border border-[var(--app-accent-emerald)] bg-[var(--app-surface-elevated)] p-2 shadow-xs">
                      <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-black/20">
                        <Image
                          src={imageUrl}
                          alt="Primary product thumbnail"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="inline-block rounded-md bg-[var(--app-accent-emerald)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          Primary Thumbnail
                        </span>
                        <p className="text-xs text-[var(--app-text-muted)] mt-0.5">Front product identity</p>
                      </div>
                    </div>

                    {/* Auxiliary Image Thumbnails */}
                    {additionalImageUrls.map((auxUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative h-14 w-14 overflow-hidden rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-1 hover:border-[var(--app-accent-emerald)] transition"
                      >
                        <Image
                          src={auxUrl}
                          alt={`Auxiliary view ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            // Swap primary and this auxiliary image
                            const newAux = [...additionalImageUrls];
                            newAux[idx] = imageUrl;
                            setImageUrl(auxUrl);
                            setAdditionalImageUrls(newAux);
                          }}
                          title="Set as primary thumbnail"
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 text-[9px] font-bold uppercase text-white transition"
                        >
                          Make Primary
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const removed = auxUrl;
                            setAdditionalImageUrls((prev) => prev.filter((_, i) => i !== idx));
                            if (removed && removed !== imageUrl) {
                              void discardUploadedImagesAction([removed]);
                            }
                          }}
                          title="Remove view"
                          aria-label={`Remove auxiliary view ${idx + 1}`}
                          className="absolute top-0.5 right-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden Inputs for Stored Images & Expiry Provenance */}
              <input type="hidden" name="imageUrl" value={imageUrl} />
              <input
                type="hidden"
                name="additionalImageUrls"
                value={additionalImageUrls.length > 0 ? JSON.stringify(additionalImageUrls) : ""}
              />
              <input type="hidden" name="expiryType" value={expiryType} />

              <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                {/* Product Name */}
                <div className="group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
                  <label htmlFor="name" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                    <Package size={13} className="text-[var(--app-accent-emerald)]" />
                    Product Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Strawberries"
                    required
                    autoComplete="off"
                    className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)]/50 outline-none transition"
                  />
                </div>

                {/* Category */}
                <div className="group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
                  <label htmlFor="category" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                    <Layers size={13} className="text-[var(--app-accent-emerald)]" />
                    Category
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Produce"
                    required
                    autoComplete="off"
                    className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)]/50 outline-none transition"
                  />
                </div>

                {/* Quantity */}
                <div className="group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
                  <label htmlFor="quantity" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                    <Scale size={13} className="text-[var(--app-accent-emerald)]" />
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={isIntegerUnit(unit) ? "1" : "0.0001"}
                    step={isIntegerUnit(unit) ? "1" : "any"}
                    inputMode={isIntegerUnit(unit) ? "numeric" : "decimal"}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={isIntegerUnit(unit) ? "e.g. 5" : "e.g. 0.5"}
                    required
                    className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)]/50 outline-none transition"
                  />
                </div>

                {/* Unit */}
                <div className="group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
                  <label htmlFor="unit" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                    <span className="text-[10px] font-bold text-[var(--app-accent-emerald)]">#</span>
                    Unit of Measure
                  </label>
                  <input
                    id="unit"
                    name="unit"
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. packs, kg, items"
                    required
                    autoComplete="off"
                    className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] placeholder:text-[var(--app-text-muted)]/50 outline-none transition"
                  />
                </div>

                {/* Expiry Date */}
                <div className="md:col-span-2 group rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/60 p-3.5 transition focus-within:border-[var(--app-accent-emerald)] focus-within:bg-[var(--app-surface-base)]">
                  <div className="flex items-center justify-between">
                    <label htmlFor="expiryDate" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                      <Calendar size={13} className="text-[var(--app-accent-emerald)]" />
                      Expiry Date
                    </label>
                    {isEstimated && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-500 border border-amber-500/20 cursor-help"
                        title={`Estimated based on standard grocery shelf life for ${category || "this product"}. Tap date to adjust.`}
                      >
                        <Sparkles size={11} className="shrink-0" />
                        AI Estimated ✦
                      </span>
                    )}
                  </div>
                  <input
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => {
                      setExpiryDate(e.target.value);
                      setIsEstimated(false);
                      setExpiryType(e.target.value ? "MANUFACTURER_EXPIRY" : "UNKNOWN");
                    }}
                    className="mt-1.5 w-full bg-transparent text-sm md:text-base font-medium text-[var(--app-text-display)] outline-none transition font-mono"
                  />
                  {isEstimated && (
                    <p className="mt-2 text-xs text-amber-500/90 flex items-center gap-1.5">
                      <Sparkles size={12} className="shrink-0" />
                      Standard {category || "product"} shelf life (+{daysEstimated ?? 7} days). Changing this date confirms it as authoritative manufacturer expiry.
                    </p>
                  )}
                </div>
              </div>

              {state.error && (
                <div role="alert" aria-live="polite" className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* Form Action Bar */}
              <div className="sticky bottom-3 z-20 -mx-2 mt-8 flex items-center justify-end gap-3 border-t border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)]/95 px-3 pt-4 backdrop-blur-md md:static md:mx-0 md:mt-10 md:border-t md:border-[var(--app-border-subtle)]/70 md:bg-transparent md:px-0 md:pt-6 md:backdrop-blur-none">
                <Link
                  href={inventoryPath}
                  onClick={() => {
                    const urlsToDiscard = [imageUrl, ...additionalImageUrls].filter(Boolean);
                    if (urlsToDiscard.length > 0) {
                      void discardUploadedImagesAction(urlsToDiscard);
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-base)]/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--app-text-body)] hover:bg-[var(--app-surface-base)] hover:text-[var(--app-text-display)] transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--app-accent-emerald)] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Saving Product..." : "Save Product"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
