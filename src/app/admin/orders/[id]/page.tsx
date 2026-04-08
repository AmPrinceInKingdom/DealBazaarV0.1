import { notFound } from "next/navigation";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { PaymentStatusActions } from "@/components/admin/payment-status-actions";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/services/orders";
import { formatCurrency } from "@/lib/utils";

const PAYMENT_PROOF_BUCKET = "payment-proofs";

type AdminOrderDetailProps = {
  params: Promise<{ id: string }>;
};

function extractPaymentProofPath(raw: string) {
  const value = raw.trim();

  if (!value) {
    return null;
  }

  const pattern =
    /\/storage\/v1\/object\/(?:public|sign)\/payment-proofs\/(.+)$/;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value);
      const matched = parsed.pathname.match(pattern);
      return matched?.[1] ? decodeURIComponent(matched[1]) : null;
    } catch {
      return null;
    }
  }

  const matched = value.match(pattern);
  if (matched?.[1]) {
    return decodeURIComponent(matched[1]);
  }

  return value.replace(/^payment-proofs\//, "");
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailProps) {
  const { id } = await params;
  const [order, supabase] = await Promise.all([
    getOrderById(id),
    createSupabaseServerClient(),
  ]);

  if (!order) {
    notFound();
  }

  const payments = supabase
    ? await supabase
        .from("payments")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
    : { data: [] };
  const sellerAssignments = supabase
    ? await supabase
        .from("seller_orders")
        .select("seller_id, status")
        .eq("order_id", order.id)
    : { data: [] };

  const payment = payments.data?.[0];
  let proofUrl: string | null = null;
  let proofUrlError: string | null = null;

  if (supabase && payment?.proof_url) {
    const paymentProofValue = payment.proof_url.trim();
    const extractedPath = extractPaymentProofPath(paymentProofValue);

    if (extractedPath) {
      const signed = await supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .createSignedUrl(extractedPath, 60 * 60);

      if (signed.error) {
        proofUrlError = signed.error.message;

        // Fallback for public buckets or older setups where signed URL permissions fail.
        const publicData = supabase.storage
          .from(PAYMENT_PROOF_BUCKET)
          .getPublicUrl(extractedPath);
        proofUrl = publicData.data.publicUrl || null;
      } else {
        proofUrl = signed.data.signedUrl;
      }
    } else {
      proofUrl = paymentProofValue;
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{order.order_number}</h2>
            <p className="text-sm text-muted-foreground">{order.customer_email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{order.status}</Badge>
            <Badge variant="secondary">{order.payment_status}</Badge>
          </div>
        </div>
        <div className="mt-2 text-sm">
          <p>Subtotal: {formatCurrency(order.subtotal)}</p>
          <p>Shipping: {order.shipping_fee === 0 ? "Free" : formatCurrency(order.shipping_fee)}</p>
          {order.discount_amount > 0 ? (
            <p className="text-emerald-600 dark:text-emerald-400">
              Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}: -
              {formatCurrency(order.discount_amount)}
            </p>
          ) : null}
          <p className="font-semibold">Total: {formatCurrency(order.total)}</p>
        </div>
      </section>

      <section className="surface p-6">
        <h3 className="text-lg font-bold">Order Status</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update fulfillment status as shipment progresses.
        </p>
        <div className="mt-3">
          <OrderStatusActions orderId={order.id} currentStatus={order.status} />
        </div>
      </section>

      <section className="surface p-6">
        <h3 className="text-lg font-bold">Payment Verification</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Method: {order.payment_method}
        </p>
        {proofUrl ? (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold">Uploaded payment proof</p>
            <div className="overflow-hidden rounded-xl border border-border">
              <img
                src={proofUrl}
                alt="Payment proof"
                className="h-auto max-h-[480px] w-full object-contain"
              />
            </div>
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
            >
              Open payment proof in new tab
            </a>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No payment proof uploaded.
          </p>
        )}
        {proofUrlError ? (
          <p className="mt-2 text-xs text-danger">Proof URL error: {proofUrlError}</p>
        ) : null}
        <div className="mt-4">
          <PaymentStatusActions orderId={order.id} />
        </div>
      </section>

      <section className="surface p-6">
        <h3 className="text-lg font-bold">Order Items</h3>
        {sellerAssignments.data?.length ? (
          <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Assigned Sellers</p>
            {sellerAssignments.data.map((assignment) => (
              <p key={assignment.seller_id}>
                Seller: {assignment.seller_id} | Status: {assignment.status}
              </p>
            ))}
          </div>
        ) : null}
        <div className="mt-3 space-y-2">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
            >
              <span>{item.product_name}</span>
              <span>
                {item.quantity} x {formatCurrency(item.unit_price)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
