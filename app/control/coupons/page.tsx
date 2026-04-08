import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CouponManager } from "@/components/control/coupon-manager";
import type { Coupon } from "@/types/domain";

export default async function ControlCouponsPage() {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();

  const coupons = supabase
    ? await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="container-wrap py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Coupon Control</h1>
          <p className="text-sm text-muted-foreground">
            Manage discount campaigns with super admin access.
          </p>
        </div>
        <Link
          href="/control"
          className="rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
        >
          Back to Control Center
        </Link>
      </div>

      <CouponManager initialCoupons={(coupons.data ?? []) as Coupon[]} />
    </div>
  );
}
