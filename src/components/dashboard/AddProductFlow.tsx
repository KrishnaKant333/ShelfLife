"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { extractLabelAction } from "@/lib/actions/label-scan";
import { createInventoryItem, type CreateInventoryState } from "@/lib/actions/inventory";
import { Camera, FileText, Upload, Plus, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";

interface AddProductFlowProps {
  isBusiness?: boolean;
}

const initialFormState: CreateInventoryState = {};
type AddProductTab = "manual" | "label" | "import";

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
  
  // Manual Form States (these can be pre-filled by label extraction)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pieces");
  const [expiryDate, setExpiryDate] = useState("");

  // Label scanning states
  const [labelFile, setLabelFile] = useState<File | null>(null);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelError, setLabelError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Server Action for product creation
  const [state, formAction, pending] = useActionState(
    createInventoryItem,
    initialFormState
  );

  async function handleLabelFile(file: File) {
    setLabelFile(file);
    setLabelError("");
    setLabelLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await extractLabelAction(formData);

      if (result.name) setName(result.name);
      if (result.category) setCategory(result.category);
      if (result.quantity) setQuantity(String(result.quantity));
      if (result.unit) setUnit(result.unit);
      if (result.expiryDate) setExpiryDate(result.expiryDate);

      setLabelError("");
      setActiveTab("manual");
    } catch (err) {
      setLabelError(err instanceof Error ? err.message : "Label scan failed.");
    } finally {
      setLabelLoading(false);
      setLabelFile(null);
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

    void startPlayback();

    return () => {
      cancelled = true;
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
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("The camera is still starting. Try again in a moment.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );

    if (!blob) {
      setCameraError("Unable to capture the camera image. Try again or use Upload image.");
      return;
    }

    stopCamera();
    await handleLabelFile(new File([blob], `shelflife-label-${Date.now()}.jpg`, { type: "image/jpeg" }));
  }

  function handleLabelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleLabelFile(file);
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
          Add single items manually, scan labels, or import lists.
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
            Manual Form
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
            Scan Label (AI)
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
          {/* LABEL SCAN TAB */}
          {activeTab === "label" && (
            <div className="space-y-6 text-center max-w-md mx-auto py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]">
                <Sparkles size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--shelf-dark)]">Scan Label with Groq AI</h3>
                <p className="mt-2 text-sm text-[var(--shelf-muted)]">
                  Upload an image of a food packaging or product label to automatically extract name, quantity, category, and expiry details.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void openCamera()}
                    disabled={labelLoading || cameraOpen}
                    className="sl-focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Camera size={17} />
                    Capture with camera
                  </button>

                  <label className="sl-focus-ring inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-5 py-3 text-center text-sm font-semibold text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]">
                    <Upload size={17} />
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLabelFileChange}
                      disabled={labelLoading}
                      className="sr-only"
                    />
                  </label>
                </div>

                {cameraOpen && (
                  <div className="space-y-3 rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 p-3 text-left">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      onCanPlay={() => void videoRef.current?.play()}
                      aria-label="Live camera preview"
                      className="aspect-[4/3] w-full rounded-xl bg-black object-cover"
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => void captureCameraFrame()}
                        className="sl-focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[var(--shelf-forest)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Capture photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="sl-focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <p role="alert" aria-live="polite" className="text-sm font-medium text-red-600">
                    {cameraError}
                  </p>
                )}

                <p className="text-center text-xs text-[var(--shelf-muted)]">
                  Capture a fresh label or choose an existing image. Extracted details will remain editable before saving.
                </p>

                {labelLoading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-[var(--shelf-forest)] font-medium">
                    <RefreshCw size={16} className="animate-spin" />
                    Extracting inventory attributes via AI...
                  </div>
                )}

                {labelError && (
                  <p role="alert" aria-live="polite" className="text-sm font-medium text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle size={15} />
                    {labelError}
                  </p>
                )}
              </div>
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
                    min="1"
                    step="any"
                    inputMode="decimal"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 5"
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
                  <label htmlFor="expiryDate" className="mb-2 block text-sm font-semibold text-[var(--shelf-dark)]">
                    Expiry Date
                  </label>
                  <input
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="sl-focus-ring w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition font-mono"
                  />
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
