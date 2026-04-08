import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAuthContext } from "@/lib/auth";
import { getOrdersByUser } from "@/lib/services/orders";

export default async function AccountDashboardPage() {
  const auth = await getAuthContext();
  const orders = auth ? await getOrdersByUser(auth.user.id) : [];

  return (
    <div className="space-y-6">
      <section className="surface p-6">
        <h2 className="text-xl font-bold">
          Welcome back{auth?.profile?.full_name ? `, ${auth.profile.full_name}` : ""}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Track order progress, update your profile, and manage shipping addresses.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="surface p-4">
          <p className="text-sm text-muted-foreground">Total orders</p>
          <p className="mt-1 text-2xl font-black">{orders.length}</p>
        </article>
        <article className="surface p-4">
          <p className="text-sm text-muted-foreground">Pending payments</p>
          <p className="mt-1 text-2xl font-black">
            {orders.filter((order) => order.payment_status !== "approved").length}
          </p>
        </article>
        <article className="surface p-4">
          <p className="text-sm text-muted-foreground">Delivered orders</p>
          <p className="mt-1 text-2xl font-black">
            {orders.filter((order) => order.status === "delivered").length}
          </p>
        </article>
      </section>

      <section className="surface p-6">
        <h3 className="text-lg font-bold">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/account/orders">
            <Button>View orders</Button>
          </Link>
          <Link href="/account/profile">
            <Button variant="outline">Edit profile</Button>
          </Link>
          <Link href="/wishlist">
            <Button variant="outline">Manage wishlist</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
