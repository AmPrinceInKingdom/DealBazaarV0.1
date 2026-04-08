import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderSuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const params = await searchParams;
  const orderNumber = typeof params.order === "string" ? params.order : "N/A";

  return (
    <div className="container-wrap py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center">
        <CircleCheckBig className="mx-auto h-12 w-12 text-emerald-500" />
        <h1 className="mt-4 text-3xl font-black">Order placed successfully</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for shopping with Deal Bazaar. Your order number is{" "}
          <strong>{orderNumber}</strong>.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Orders paid by bank transfer stay under review until payment proof is
          approved by admin.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/account/orders">
            <Button>View orders</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Continue shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
