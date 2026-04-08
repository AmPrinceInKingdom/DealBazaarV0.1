import { getAdminDashboardStats } from "@/lib/services/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article className="surface p-5">
        <p className="text-sm text-muted-foreground">Total products</p>
        <p className="mt-1 text-3xl font-black">{stats.products}</p>
      </article>
      <article className="surface p-5">
        <p className="text-sm text-muted-foreground">Total categories</p>
        <p className="mt-1 text-3xl font-black">{stats.categories}</p>
      </article>
      <article className="surface p-5">
        <p className="text-sm text-muted-foreground">Total customers</p>
        <p className="mt-1 text-3xl font-black">{stats.customers}</p>
      </article>
      <article className="surface p-5">
        <p className="text-sm text-muted-foreground">Orders</p>
        <p className="mt-1 text-3xl font-black">{stats.totalOrders}</p>
      </article>
      <article className="surface p-5">
        <p className="text-sm text-muted-foreground">Pending payments</p>
        <p className="mt-1 text-3xl font-black">{stats.pendingPayments}</p>
      </article>
    </div>
  );
}
