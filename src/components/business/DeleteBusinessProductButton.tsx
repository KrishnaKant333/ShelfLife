"use client";

import { useTransition } from "react";
import { deleteBusinessInventoryItem } from "@/lib/actions/business-inventory";

interface DeleteBusinessProductButtonProps {
  id: number;
}

export default function DeleteBusinessProductButton({
  id,
}: DeleteBusinessProductButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deleteBusinessInventoryItem(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-sm font-medium text-[var(--shelf-terracotta)] hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}