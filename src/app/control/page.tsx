import { redirect } from "next/navigation";
import Link from "next/link";
import { UserRoleManager } from "@/components/control/user-role-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth";

type ControlUser = {
  id: string;
  full_name: string | null;
  role: "customer" | "seller" | "admin" | "super_admin";
};

export default async function ControlCenterPage() {
  const auth = await getAuthContext();
  const supabase = await createSupabaseServerClient();

  if (!auth || auth.profile?.role !== "super_admin") {
    redirect("/");
  }

  const users = supabase
    ? await supabase
        .from("users")
        .select("id, full_name, role")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="container-wrap py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Control Center</h1>
        <p className="text-sm text-muted-foreground">
          Super admin full-control access for roles and system oversight.
        </p>
      </div>
      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Link
          href="/admin"
          className="surface p-4 text-sm font-semibold hover:border-primary"
        >
          Open Admin Dashboard
        </Link>
        <Link
          href="/admin/analytics"
          className="surface p-4 text-sm font-semibold hover:border-primary"
        >
          Open Admin Analytics
        </Link>
        <Link
          href="/seller"
          className="surface p-4 text-sm font-semibold hover:border-primary"
        >
          Open Seller Panel
        </Link>
        <Link
          href="/"
          className="surface p-4 text-sm font-semibold hover:border-primary"
        >
          Open Storefront
        </Link>
        <Link
          href="/control/coupons"
          className="surface p-4 text-sm font-semibold hover:border-primary"
        >
          Manage Coupons
        </Link>
      </section>
      <UserRoleManager users={(users.data ?? []) as ControlUser[]} />
    </div>
  );
}
