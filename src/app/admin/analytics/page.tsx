import { getCategories } from "@/lib/services/categories";
import { getAdminAnalytics } from "@/lib/services/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const [analytics, categories] = await Promise.all([
    getAdminAnalytics(),
    getCategories(),
  ]);

  const categoryName = (categoryId: string) =>
    categories.find((category) => category.id === categoryId)?.name ?? "Unknown";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="surface p-5">
          <p className="text-sm text-muted-foreground">Approved revenue</p>
          <p className="mt-1 text-2xl font-black text-primary">
            {formatCurrency(analytics.totalRevenue)}
          </p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-muted-foreground">Total orders</p>
          <p className="mt-1 text-2xl font-black">{analytics.totalOrders}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-muted-foreground">Approved payments</p>
          <p className="mt-1 text-2xl font-black">{analytics.approvedPayments}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-muted-foreground">Pending/Review payments</p>
          <p className="mt-1 text-2xl font-black">{analytics.pendingPayments}</p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-muted-foreground">Approved revenue (30d)</p>
          <p className="mt-1 text-2xl font-black text-primary">
            {formatCurrency(analytics.revenue30d)}
          </p>
        </article>
        <article className="surface p-5">
          <p className="text-sm text-muted-foreground">Average order value</p>
          <p className="mt-1 text-2xl font-black">
            {formatCurrency(analytics.averageOrderValue)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="surface p-5">
          <h2 className="text-lg font-bold">Top categories by order items</h2>
          <div className="mt-4 space-y-2">
            {analytics.topCategories.map((item) => (
              <div
                key={item.category_id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>{categoryName(item.category_id)}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
            {!analytics.topCategories.length ? (
              <p className="text-sm text-muted-foreground">No category data yet.</p>
            ) : null}
          </div>
        </article>
        <article className="surface p-5">
          <h2 className="text-lg font-bold">Top sellers by sold items</h2>
          <div className="mt-4 space-y-2">
            {analytics.topSellers.map((seller) => (
              <div
                key={seller.seller_id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="line-clamp-1">{seller.seller_name}</span>
                <span className="font-semibold">{seller.count}</span>
              </div>
            ))}
            {!analytics.topSellers.length ? (
              <p className="text-sm text-muted-foreground">No seller sales data yet.</p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="surface p-5">
        <h2 className="text-lg font-bold">Recent orders</h2>
        <div className="mt-4 space-y-2">
          {analytics.recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span>{order.order_number}</span>
              <span className="text-muted-foreground">{order.payment_status}</span>
              <span className="font-semibold">{formatCurrency(order.total)}</span>
            </div>
          ))}
          {!analytics.recentOrders.length ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
