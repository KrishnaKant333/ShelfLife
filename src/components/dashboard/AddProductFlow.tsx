"use client";

import { useState, useEffect, useRef } from "react";
import { useActionState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { extractLabelAction } from "@/lib/actions/label-scan";
import { createInventoryItem, type CreateInventoryState } from "@/lib/actions/inventory";
import { Camera, QrCode, FileText, Upload, Plus, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";

interface AddProductFlowProps {
  isBusiness?: boolean;
}

const initialFormState: CreateInventoryState = {};

export default function AddProductFlow({ isBusiness = false }: AddProductFlowProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "barcode" | "label" | "import">("manual");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "barcode" || tab === "label" || tab === "import" || tab === "manual") {
        setActiveTab(tab as any);
      }
    }
  }, []);
  
  // Manual Form States (these can be pre-filled by scanner lookup)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pieces");
  const [expiryDate, setExpiryDate] = useState("");

  // Barcode scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Label scanning states
  const [labelFile, setLabelFile] = useState<File | null>(null);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelError, setLabelError] = useState("");

  // Server Action for product creation
  const [state, formAction, pending] = useActionState(
    createInventoryItem,
    initialFormState
  );

  // Clean up scanner on unmount or tab change
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "barcode") {
      stopScanner();
    }
  }, [activeTab]);

  async function startScanner() {
    setIsScanning(true);
    setScanError("");
    setLookupMessage("");
    
    // Give DOM time to mount reader div
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("barcode-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
          },
          (decodedText) => {
            handleBarcodeScanned(decodedText);
          },
          () => {
            // silent scan failure
          }
        );
      } catch (err) {
        setScanError("Unable to access camera. Please check camera permissions.");
        setIsScanning(false);
      }
    }, 100);
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.error("Scanner stop error", e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }

  async function handleBarcodeScanned(barcode: string) {
    stopScanner();
    setLookupLoading(true);
    setLookupMessage(`Barcode detected: ${barcode}. Looking up product...`);

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const prod = data.product;
        setName(prod.product_name || prod.product_name_en || "");
        
        let inferredCat = "Pantry";
        if (prod.categories_tags && prod.categories_tags.length > 0) {
          const rawCat = prod.categories_tags[0];
          inferredCat = rawCat.replace("en:", "").split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        } else if (prod.categories) {
          inferredCat = prod.categories.split(",")[0];
        }
        setCategory(inferredCat);
        
        if (prod.quantity) {
          setUnit(prod.quantity);
        }

        setLookupMessage("✓ Product found! Review details in the Manual tab.");
        setActiveTab("manual");
      } else {
        setLookupMessage("⚠ Product not found in Open Food Facts database. You can still enter it manually.");
        setActiveTab("manual");
      }
    } catch {
      setLookupMessage("⚠ Network lookup failed. Please enter details manually.");
      setActiveTab("manual");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleLabelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const inventoryPath = isBusiness ? "/business/dashboard/inventory" : "/dashboard/inventory";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Navigation Header */}
      <div>
        <Link href={inventoryPath} className="text-sm font-semibold text-[var(--shelf-forest)] hover:underline">
          ← Back to Inventory
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--shelf-dark)]">
          Add New Product
        </h1>
        <p className="mt-2 text-sm text-[var(--shelf-muted)]">
          Add single items manually, scan barcodes or labels, or import lists.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="rounded-2xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] overflow-hidden shadow-sm">
        <div className="flex border-b border-[var(--shelf-border)] bg-[var(--shelf-cream)]/40 overflow-x-auto">
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
            onClick={() => setActiveTab("barcode")}
            className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition whitespace-nowrap ${
              activeTab === "barcode"
                ? "border-[var(--shelf-forest)] text-[var(--shelf-forest)] bg-[var(--shelf-surface)]"
                : "border-transparent text-[var(--shelf-muted)] hover:text-[var(--shelf-dark)]"
            }`}
          >
            <QrCode size={16} />
            Barcode Scan
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
          {/* BARCODE SCAN TAB */}
          {activeTab === "barcode" && (
            <div className="space-y-6 text-center max-w-md mx-auto py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--shelf-forest)]/10 text-[var(--shelf-forest)]">
                <QrCode size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--shelf-dark)]">Barcode Product Lookup</h3>
                <p className="mt-2 text-sm text-[var(--shelf-muted)]">
                  Scan a food or household product barcode to pull details from the Open Food Facts catalog automatically.
                </p>
              </div>

              {isScanning ? (
                <div className="space-y-4">
                  <div
                    id="barcode-reader"
                    className="overflow-hidden rounded-xl border border-[var(--shelf-border)] bg-black"
                    style={{ width: "100%", height: "240px" }}
                  />
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-4 py-2 text-sm font-medium text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
                  >
                    Cancel Scan
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={startScanner}
                    className="w-full rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
                  >
                    Open Camera & Scan
                  </button>
                  {scanError && (
                    <p className="text-sm font-medium text-red-600 flex items-center justify-center gap-1">
                      <AlertCircle size={15} />
                      {scanError}
                    </p>
                  )}
                </div>
              )}

              {lookupLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--shelf-forest)] font-medium">
                  <RefreshCw size={16} className="animate-spin" />
                  {lookupMessage}
                </div>
              )}
            </div>
          )}

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
                <label className="block w-full cursor-pointer rounded-xl bg-[var(--shelf-forest)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 text-center shadow-sm">
                  {labelLoading ? "Extracting Details..." : "Upload Label Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLabelFileChange}
                    disabled={labelLoading}
                    className="sr-only"
                  />
                </label>

                {labelLoading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-[var(--shelf-forest)] font-medium">
                    <RefreshCw size={16} className="animate-spin" />
                    Extracting inventory attributes via AI...
                  </div>
                )}

                {labelError && (
                  <p className="text-sm font-medium text-red-600 flex items-center justify-center gap-1">
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
              {lookupMessage && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-700 font-medium">
                  {lookupMessage}
                </div>
              )}
              
              <div className="grid gap-6 md:grid-cols-2">
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
                    className="w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--shelf-forest)]"
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
                    className="w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--shelf-forest)]"
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
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 5"
                    required
                    className="w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--shelf-forest)]"
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
                    className="w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--shelf-forest)]"
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
                    required
                    className="w-full rounded-xl border border-[var(--shelf-border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[var(--shelf-forest)] font-mono"
                  />
                </div>
              </div>

              {state.error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {state.error}
                </p>
              )}

              <div className="mt-8 flex justify-end gap-3 border-t border-[var(--shelf-border)] pt-6">
                <Link
                  href={inventoryPath}
                  className="rounded-xl border border-[var(--shelf-border)] bg-[var(--shelf-surface)] px-5 py-3 text-sm font-semibold text-[var(--shelf-dark)] transition hover:bg-[var(--shelf-cream)]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl bg-[var(--shelf-forest)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
