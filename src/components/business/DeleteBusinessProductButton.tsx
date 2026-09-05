"use client";

import { useState, useTransition } from "react";
import { deleteBusinessInventoryItem } from "@/lib/actions/business-inventory";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastProvider, useToast } from "@/components/ui/Toast";

interface DeleteBusinessProductButtonProps {
  id: number;
}

export default function DeleteBusinessProductButton({ id }: DeleteBusinessProductButtonProps) {
  return <ToastProvider><DeleteBusinessProductButtonInner id={id} /></ToastProvider>;
}

function DeleteBusinessProductButtonInner({ id }: DeleteBusinessProductButtonProps) {
  const [pending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useToast();

  function handleDelete() {
    setShowConfirm(true);
  }

  function confirmDelete() {
    setShowConfirm(false);
    startTransition(async () => {
      try {
        await deleteBusinessInventoryItem(id);
      } catch {
        showToast("Unable to delete this product. Please try again.", "error");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="text-sm font-medium text-[var(--shelf-terracotta)] hover:underline disabled:opacity-50"
      >
        {pending ? "Deleting..." : "Delete"}
      </button>

      {showConfirm && (
        <ConfirmDialog
          title="Delete Product"
          message="Are you sure you want to delete this product? This cannot be undone."
          confirmLabel="Delete"
          isDestructive
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
