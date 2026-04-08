import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/api-auth";
import { normalizeCouponCode } from "@/lib/coupons";
import { createCouponSchema } from "@/lib/validations/coupon";

export async function GET() {
  const auth = await requireApiSuperAdmin();
  if (auth.error || !auth.supabase) {
    return auth.error;
  }

  const { data, error } = await auth.supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireApiSuperAdmin();
  if (auth.error || !auth.supabase || !auth.user) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = createCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid coupon data." },
      { status: 400 },
    );
  }

  const payload = {
    ...parsed.data,
    code: normalizeCouponCode(parsed.data.code),
    description: parsed.data.description || null,
    created_by: auth.user.id,
    starts_at: parsed.data.starts_at || null,
    ends_at: parsed.data.ends_at || null,
    max_discount_amount: parsed.data.max_discount_amount ?? null,
    usage_limit: parsed.data.usage_limit ?? null,
  };

  const { data, error } = await auth.supabase
    .from("coupons")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data });
}
