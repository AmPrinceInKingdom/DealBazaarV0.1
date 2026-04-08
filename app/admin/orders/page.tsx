import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAllOrders } from "@/lib/services/orders";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="surface overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Order Status</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{order.payment_method}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                </td>
                <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                <td className="px-4 py-3">
                  <Badge>{order.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{order.payment_status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
