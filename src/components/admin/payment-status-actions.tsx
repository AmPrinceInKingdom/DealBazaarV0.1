"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PaymentStatusActions({ orderId }: { orderId: string }) {
  const router = useRouter();

  const updateStatus = async (status: "approved" | "rejected" | "under_review") => {
    const response = await fetch(`/api/orders/${orderId}/payment-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      toast.error(body.error ?? "Unable to update payment status.");
      return;
    }

    toast.success("Payment status updated.");
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={() => updateStatus("approved")}>
        Approve
      </Button>
      <Button size="sm" variant="danger" onClick={() => updateStatus("rejected")}>
        Reject
      </Button>
      <Button size="sm" variant="outline" onClick={() => updateStatus("under_review")}>
        Set Review
      </Button>
    </div>
  );
}
