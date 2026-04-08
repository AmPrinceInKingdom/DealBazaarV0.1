import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthContext } from "@/lib/auth";
import { getOrdersByUser } from "@/lib/services/orders";
import { formatCurrency } from "@/lib/utils";

export default async function OrdersPage() {
  const auth = await getAuthContext();
  const orders = auth ? await getOrdersByUser(auth.user.id) : [];

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Once you place an order, it will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <article key={order.id} className="surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Order</p>
              <p className="font-bold">{order.order_number}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{order.status}</Badge>
              <Badge variant="secondary">{order.payment_status}</Badge>
            </div>
            <p className="font-bold text-primary">{formatCurrency(order.total)}</p>
            <Link
              href={`/account/orders/${order.id}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              View details
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
