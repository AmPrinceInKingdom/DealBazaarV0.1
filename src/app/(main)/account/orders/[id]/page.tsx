import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getAuthContext } from "@/lib/auth";
import { getOrderById } from "@/lib/services/orders";
import { formatCurrency } from "@/lib/utils";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const auth = await getAuthContext();
  const { id } = await params;
  const order = auth ? await getOrderById(id, auth.user.id) : null;

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Order number</p>
            <h2 className="text-xl font-bold">{order.order_number}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{order.status}</Badge>
            <Badge variant="secondary">{order.payment_status}</Badge>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Payment method: {order.payment_method}
        </p>
        <p className="text-sm text-muted-foreground">
          Shipping address: {order.shipping_address}
        </p>
      </section>

      <section className="surface p-6">
        <h3 className="text-lg font-bold">Order items</h3>
        <div className="mt-4 space-y-3">
          {order.items?.map((item) => (
            <article
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-border p-3"
            >
              <div>
                <p className="font-semibold">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.unit_price)} x {item.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 border-t border-border pt-3 text-right">
          <p className="text-sm text-muted-foreground">
            Subtotal: {formatCurrency(order.subtotal)}
          </p>
          <p className="text-sm text-muted-foreground">
            Shipping: {order.shipping_fee === 0 ? "Free" : formatCurrency(order.shipping_fee)}
          </p>
          {order.discount_amount > 0 ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}: -
              {formatCurrency(order.discount_amount)}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Total:{" "}
            <span className="text-lg font-bold text-primary">
              {formatCurrency(order.total)}
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
