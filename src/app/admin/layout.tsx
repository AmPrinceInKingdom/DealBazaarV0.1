import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAuthContext } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/login?next=/admin");
  }

  if (auth.profile?.role !== "admin" && auth.profile?.role !== "super_admin") {
    redirect("/");
  }

  return (
    <div className="container-wrap py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">
          Manage products, inventory, orders, payments, and users.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <AdminSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
