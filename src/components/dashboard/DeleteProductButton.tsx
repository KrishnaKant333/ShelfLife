"use client";

import { useTransition } from "react";

import { deleteInventoryItem } from "@/lib/actions/inventory";

interface DeleteProductButtonProps {
  id: number;
}

export default function DeleteProductButton({
  id,
}: DeleteProductButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      await deleteInventoryItem(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}