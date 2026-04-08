"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();

  const onDelete = async () => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      toast.error(body.error ?? "Delete failed.");
      return;
    }

    toast.success("Product deleted");
    router.refresh();
  };

  return (
    <Button variant="danger" size="sm" onClick={onDelete}>
      Delete
    </Button>
  );
}
