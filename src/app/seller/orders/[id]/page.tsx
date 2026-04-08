import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getAuthContext } from "@/lib/auth";
import { getSellerOrderById } from "@/lib/services/seller";
import type { OrderItem } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";

type SellerOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerOrderDetailPage({
  params,
}: SellerOrderDetailPageProps) {
  const auth = await getAuthContext();
  const { id } = await params;
  const order = auth ? await getSellerOrderById(auth.user.id, id) : null;

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
      </section>

      <section className="surface p-6">
        <h3 className="text-lg font-bold">Your order items</h3>
        <div className="mt-4 space-y-3">
          {order.items?.map((item: OrderItem) => (
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
      </section>
    </div>
  );
}
