import { NextResponse } from "next/server";
import { requireApiSuperAdmin } from "@/lib/api-auth";
import { normalizeCouponCode } from "@/lib/coupons";
import { createCouponSchema, updateCouponSchema } from "@/lib/validations/coupon";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const auth = await requireApiSuperAdmin();
  if (auth.error || !auth.supabase) {
    return auth.error;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid coupon update." },
      { status: 400 },
    );
  }

  const { data: existingCoupon, error: existingCouponError } = await auth.supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();

  if (existingCouponError || !existingCoupon) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  }

  const normalizedPatch = {
    ...parsed.data,
    code: parsed.data.code ? normalizeCouponCode(parsed.data.code) : undefined,
    description:
      parsed.data.description === undefined
        ? undefined
        : parsed.data.description || null,
    starts_at:
      parsed.data.starts_at === undefined ? undefined : parsed.data.starts_at,
    ends_at: parsed.data.ends_at === undefined ? undefined : parsed.data.ends_at,
    max_discount_amount:
      parsed.data.max_discount_amount === undefined
        ? undefined
        : parsed.data.max_discount_amount,
    usage_limit:
      parsed.data.usage_limit === undefined ? undefined : parsed.data.usage_limit,
  };

  const mergedForValidation = {
    code: normalizedPatch.code ?? existingCoupon.code,
    description:
      normalizedPatch.description === undefined
        ? (existingCoupon.description ?? "")
        : (normalizedPatch.description ?? ""),
    discount_type: normalizedPatch.discount_type ?? existingCoupon.discount_type,
    discount_value: normalizedPatch.discount_value ?? existingCoupon.discount_value,
    min_order_total:
      normalizedPatch.min_order_total ?? existingCoupon.min_order_total,
    max_discount_amount:
      normalizedPatch.max_discount_amount === undefined
        ? existingCoupon.max_discount_amount
        : normalizedPatch.max_discount_amount,
    usage_limit:
      normalizedPatch.usage_limit === undefined
        ? existingCoupon.usage_limit
        : normalizedPatch.usage_limit,
    starts_at:
      normalizedPatch.starts_at === undefined
        ? existingCoupon.starts_at
        : normalizedPatch.starts_at,
    ends_at:
      normalizedPatch.ends_at === undefined ? existingCoupon.ends_at : normalizedPatch.ends_at,
    is_active: normalizedPatch.is_active ?? existingCoupon.is_active,
  };

  const mergedValidation = createCouponSchema.safeParse(mergedForValidation);
  if (!mergedValidation.success) {
    return NextResponse.json(
      { error: mergedValidation.error.issues[0]?.message || "Invalid coupon update." },
      { status: 400 },
    );
  }

  const payload = {
    ...normalizedPatch,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await auth.supabase
    .from("coupons")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data });
}
