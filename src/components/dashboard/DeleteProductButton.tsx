"use client";

import { useState, useTransition } from "react";
import { deleteInventoryItem } from "@/lib/actions/inventory";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ToastProvider, useToast } from "@/components/ui/Toast";

interface DeleteProductButtonProps {
  id: number;
}

export default function DeleteProductButton({ id }: DeleteProductButtonProps) {
  return <ToastProvider><DeleteProductButtonInner id={id} /></ToastProvider>;
}

function DeleteProductButtonInner({ id }: DeleteProductButtonProps) {
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
        await deleteInventoryItem(id);
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
        className="text-sm cursor-pointer font-medium text-red-600 hover:underline disabled:opacity-50"
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
