import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api-auth";
import {
  normalizeCouponCode,
  validateCouponForAmount,
} from "@/lib/coupons";

const validateCouponSchema = z.object({
  code: z.string().min(2),
  subtotal: z.coerce.number().min(0),
  shippingFee: z.coerce.number().min(0),
});

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.error || !auth.supabase) {
    return auth.error;
  }

  const body = await request.json().catch(() => null);
  const parsed = validateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid coupon request." },
      { status: 400 },
    );
  }

  const code = normalizeCouponCode(parsed.data.code);
  const orderAmount = parsed.data.subtotal + parsed.data.shippingFee;

  const { data: coupon, error } = await auth.supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!coupon) {
    return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
  }

  const validation = validateCouponForAmount(coupon, orderAmount);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.message ?? "Coupon is not valid." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    code: coupon.code,
    discountAmount: validation.discountAmount,
    totalAfterDiscount: Math.max(orderAmount - validation.discountAmount, 0),
  });
}
