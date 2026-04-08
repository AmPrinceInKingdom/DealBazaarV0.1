import { getAuthContext } from "@/lib/auth";
import { getSellerOrders, getSellerProducts } from "@/lib/services/seller";

export default async function SellerDashboardPage() {
  const auth = await getAuthContext();
  const sellerId = auth?.user.id ?? "";

  const [products, orders] = await Promise.all([
    sellerId ? getSellerProducts(sellerId) : [],
    sellerId ? getSellerOrders(sellerId) : [],
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article className="surface p-5">
        <p className="text-sm text-muted-foreground">My products</p>
        <p className="mt-1 text-3xl font-black">{products.length}</p>
      </article>
      <article className="surface p-5">
        <p className="text-sm text-muted-foreground">My orders</p>
        <p className="mt-1 text-3xl font-black">{orders.length}</p>
      </article>
      <article className="surface p-5">
        <p className="text-sm text-muted-foreground">Pending orders</p>
        <p className="mt-1 text-3xl font-black">
          {orders.filter((order) => order.status !== "delivered").length}
        </p>
      </article>
    </div>
  );
}
