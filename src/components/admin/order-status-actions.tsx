"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export function OrderStatusActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  const updateStatus = async (status: string) => {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      toast.error(body.error ?? "Failed to update order status.");
      return;
    }
    toast.success("Order status updated.");
    router.refresh();
  };

  return (
    <Select
      defaultValue={currentStatus}
      onChange={(event) => updateStatus(event.target.value)}
      className="max-w-xs"
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </Select>
  );
}
