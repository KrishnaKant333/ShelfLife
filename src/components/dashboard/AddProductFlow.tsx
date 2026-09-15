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
      <div>
        <Link href={inventoryPath} className="text-sm font-semibold text-[var(--shelf-forest)] hover:underline">
          ← Back to Inventory
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
          Add New Product
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Add single items manually, scan multiple product angles, or import lists.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] overflow-hidden shadow-sm">
        <div className="flex border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition whitespace-nowrap ${
              activeTab === "manual"
                ? "border-[var(--shelf-forest)] text-[var(--shelf-forest)] bg-[var(--shelf-surface)]"
                : "border-transparent text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
            }`}
          >
            <Plus size={16} />
            Review & Edit Form
          </button>
          <button
            onClick={() => setActiveTab("label")}
            className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition whitespace-nowrap ${
              activeTab === "label"
                ? "border-[var(--shelf-forest)] text-[var(--shelf-forest)] bg-[var(--shelf-surface)]"
                : "border-transparent text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
            }`}
          >
            <Camera size={16} />
            Multi-View Scan (AI)
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition whitespace-nowrap ${
              activeTab === "import"
                ? "border-[var(--shelf-forest)] text-[var(--shelf-forest)] bg-[var(--shelf-surface)]"
                : "border-transparent text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
            }`}
          >
            <Upload size={16} />
            Bulk Import
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="p-6 md:p-8">
          {/* MULTI-VIEW LABEL SCAN TAB */}
          {activeTab === "label" && (
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-bold text-[var(--shelf-dark)]">Multi-Angle Product Scanner</h3>
                <p className="text-sm text-[var(--shelf-muted)]">
                  Upload or snap multiple panels of one item (front brand, back nutrition/weight, rim expiry stamp).
                  ShelfLife synthesizes all views into <strong>one comprehensive product record</strong>.
                </p>
              </div>

              {/* Angle Action Buttons */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void openCamera()}
                  disabled={labelLoading || cameraOpen}
                  className="sl-focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Camera size={17} />
                  {views.length > 0 ? "Add Camera View" : "Capture with Camera"}
                </button>

                <label className="sl-focus-ring inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-5 py-3 text-center text-sm font-semibold text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]">
                  <Upload size={17} />
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
                <div className="space-y-3 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 p-3 text-left">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      aria-label="Live camera preview"
                      className="aspect-[4/3] w-full rounded-xl bg-black object-cover"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Angle {views.length + 1} of 4
                    </div>
                  </div>

                  {/* Camera Controls & Hint */}
                  <div className="p-1 space-y-2">
                    <p className="text-xs text-[var(--shelf-muted)]">
                      {views.length === 0 && "Point at front brand panel and tap Snap."}
                      {views.length === 1 && "Front captured! Now snap the back for ingredients & quantity, or rim for expiry."}
                      {views.length === 2 && "2 angles captured! Snap rim/cap for stamped expiry date, or finish now."}
                      {views.length >= 3 && "All key angles covered. Tap 'Extract Product' to synthesize with AI."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void captureCameraFrame()}
                        disabled={views.length >= 4}
                        className="sl-focus-ring inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        <Camera size={16} />
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
                          className="sl-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          <Sparkles size={16} />
                          Extract ({views.length})
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="sl-focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
                      >
                        Close Camera
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
                <div className="space-y-3 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-4 text-left shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--shelf-dark)]">
                      <Layers size={16} className="text-[var(--shelf-forest)]" />
                      <span>Captured Product Angles ({views.length}/4)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViews([])}
                      className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
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
                            ? "border-[var(--shelf-forest)] bg-[var(--shelf-forest)]/5 shadow-xs"
                            : "border-[var(--shelf-border)] bg-[var(--shelf-cream)]/30 hover:border-[var(--shelf-muted)]"
                        }`}
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black/5">
                          <Image
                            src={view.previewUrl}
                            alt={`Product view angle ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />

                          {/* Primary indicator badge */}
                          {view.isPrimary && (
                            <div className="absolute top-1.5 left-1.5 rounded-md bg-[var(--shelf-forest)] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                              Primary
                            </div>
                          )}

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeView(view.id)}
                            aria-label={`Remove view ${idx + 1}`}
                            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 transition"
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
                            className="w-full rounded-md border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-1.5 py-1 text-[11px] font-medium text-[var(--shelf-dark)] outline-none"
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
                              className="flex w-full items-center justify-center gap-1 rounded-md border border-[var(--shelf-border)] bg-[var(--shelf-surface)] py-1 text-[10px] font-semibold text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)] hover:border-[var(--shelf-forest)] transition"
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
                      className="sl-focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {labelLoading ? (
                        <>
                          <RefreshCw size={17} className="animate-spin" />
                          Synthesizing {views.length} Angles with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles size={17} />
                          Extract Single Product from {views.length} View{views.length > 1 ? "s" : ""}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {labelLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--shelf-forest)] font-medium">
                  <RefreshCw size={16} className="animate-spin" />
                  Merging product identity, net quantity, and stamped dates...
                </div>
              )}

              {labelError && (
                <p role="alert" aria-live="polite" className="text-sm font-medium text-red-600 flex items-center justify-center gap-1">
                  <AlertCircle size={15} />
                  {labelError}
                </p>
              )}
            </div>
          )}

          {/* BULK IMPORT TAB */}
          {activeTab === "import" && (
            <div className="grid gap-6 md:grid-cols-2 py-4">
              <div className="rounded-2xl border border-[var(--shelf-border)] p-6 space-y-4 text-center hover:border-[var(--shelf-sage)] transition">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]">
                  <FileText size={20} />
                </div>
                <h4 className="text-md font-semibold text-[var(--shelf-dark)]">Import CSV</h4>
                <p className="text-xs text-[var(--shelf-muted)]">
                  Upload standard spreadsheet lists (headers: name, category, quantity, unit, expiryDate).
                </p>
                <Link
                  href={isBusiness ? "/business/dashboard/inventory/import" : "/dashboard/inventory/import"}
                  className="inline-block rounded-xl bg-[var(--shelf-forest)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                >
                  Upload CSV
                </Link>
              </div>

              <div className="rounded-2xl border border-[var(--shelf-border)] p-6 space-y-4 text-center hover:border-[var(--shelf-sage)] transition">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]">
                  <Upload size={20} />
                </div>
                <h4 className="text-md font-semibold text-[var(--shelf-dark)]">Import Invoice</h4>
                <p className="text-xs text-[var(--shelf-muted)]">
                  Upload supplier invoice images (JPG, PNG) and auto-extract complete orders with AI.
                </p>
                <Link
                  href={isBusiness ? "/business/dashboard/inventory/invoice" : "/dashboard/inventory/invoice"}
                  className="inline-block rounded-xl border border-[var(--shelf-border)] px-4 py-2 text-xs font-semibold text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
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
                <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--shelf-forest)] flex items-center gap-1.5">
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
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove imagery
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Primary Image Thumbnail */}
                    <div className="relative flex items-center gap-3 rounded-xl border border-[var(--shelf-forest)] bg-[var(--shelf-surface)] p-2 shadow-xs">
                      <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-black/10">
                        <Image
                          src={imageUrl}
                          alt="Primary product thumbnail"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="inline-block rounded-md bg-[var(--shelf-forest)] px-2 py-0.5 text-[10px] font-bold text-white">
                          Primary Thumbnail
                        </span>
                        <p className="text-xs text-[var(--shelf-muted)] mt-0.5">Front product identity</p>
                      </div>
                    </div>

                    {/* Auxiliary Image Thumbnails */}
                    {additionalImageUrls.map((auxUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative h-14 w-14 overflow-hidden rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] p-1 hover:border-[var(--shelf-forest)] transition"
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
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 text-[9px] font-bold text-white transition"
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
                          className="absolute top-0.5 right-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition"
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

              <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[var(--shelf-dark)]">
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
                    className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-semibold text-[var(--shelf-dark)]">
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
                    className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="mb-2 block text-sm font-semibold text-[var(--shelf-dark)]">
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
                    className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="unit" className="mb-2 block text-sm font-semibold text-[var(--shelf-dark)]">
                    Unit
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
                    className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="expiryDate" className="block text-sm font-semibold text-[var(--shelf-dark)]">
                      Expiry Date
                    </label>
                    {isEstimated && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-help"
                        title={`Estimated based on standard grocery shelf life for ${category || "this product"}. Tap date to adjust.`}
                      >
                        <Sparkles size={12} className="shrink-0" />
                        Estimated ✦
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
                    className={`sl-focus-ring w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition font-mono ${
                      isEstimated
                        ? "border-amber-400/80 bg-amber-500/5 focus:border-amber-500"
                        : "border-[var(--shelf-border)]"
                    }`}
                  />
                  {isEstimated && (
                    <p className="mt-1.5 text-xs text-amber-700/80 dark:text-amber-300/80">
                      Standard {category || "product"} shelf life (+{daysEstimated ?? 7} days). Changing this date confirms it as manufacturer expiry.
                    </p>
                  )}
                </div>
              </div>

              {state.error && (
                <p role="alert" aria-live="polite" className="rounded-xl bg-[var(--shelf-terracotta)]/10 border border-[var(--shelf-terracotta)]/20 px-4 py-3 text-sm font-medium text-[var(--shelf-terracotta)]">
                  {state.error}
                </p>
              )}

              <div className="sticky bottom-3 z-10 -mx-1 mt-6 flex justify-end gap-3 border-t border-[var(--shelf-border)] bg-[var(--shelf-surface)]/95 px-1 pt-4 backdrop-blur-sm md:static md:mx-0 md:mt-8 md:bg-transparent md:px-0 md:pt-6 md:backdrop-blur-none">
                <Link
                  href={inventoryPath}
                  onClick={() => {
                    const urlsToDiscard = [imageUrl, ...additionalImageUrls].filter(Boolean);
                    if (urlsToDiscard.length > 0) {
                      void discardUploadedImagesAction(urlsToDiscard);
                    }
                  }}
                  className="sl-focus-ring rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-5 py-3 text-sm font-semibold text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={pending}
                  className="sl-focus-ring rounded-xl bg-[var(--shelf-forest)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
