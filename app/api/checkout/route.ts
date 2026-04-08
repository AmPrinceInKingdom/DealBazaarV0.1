import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import {
  normalizeCouponCode,
  validateCouponForAmount,
} from "@/lib/coupons";
import { checkoutSchema } from "@/lib/validations/checkout";

function generateOrderNumber() {
  return `DB-${Date.now().toString().slice(-8)}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid checkout data." },
      { status: 400 },
    );
  }

  const auth = await requireApiUser();
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error;
  }

  if (parsed.data.payment_method === "cod") {
    return NextResponse.json(
      { error: "Cash on delivery is coming soon." },
      { status: 400 },
    );
  }

  if (parsed.data.payment_method === "card") {
    return NextResponse.json(
      { error: "Card payment is coming soon." },
      { status: 400 },
    );
  }

  const productIds = parsed.data.items.map((item) => item.id);
  const invalidProductIds = productIds.filter((id) => !isUuid(id));
  if (invalidProductIds.length > 0) {
    return NextResponse.json(
      {
        error:
          "Your cart has outdated items. Please clear cart and add products again.",
      },
      { status: 400 },
    );
  }

  const { data: productsInDb, error: productsError } = await auth.supabase
    .from("products")
    .select("id, seller_id")
    .in("id", productIds);

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  const productsById = new Map((productsInDb ?? []).map((product) => [product.id, product]));
  const missingProducts = productIds.filter((id) => !productsById.has(id));
  if (missingProducts.length > 0) {
    return NextResponse.json(
      {
        error:
          "Some cart items are no longer available. Please refresh your cart and try again.",
      },
      { status: 400 },
    );
  }

  const subtotal = parsed.data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = subtotal > 100 ? 0 : 12;
  const orderAmount = subtotal + shippingFee;
  let total = orderAmount;
  let couponId: string | null = null;
  let couponCode: string | null = null;
  let discountAmount = 0;

  const requestedCouponCode = parsed.data.coupon_code?.trim();
  if (requestedCouponCode) {
    const normalizedCode = normalizeCouponCode(requestedCouponCode);
    const { data: coupon, error: couponError } = await auth.supabase
      .from("coupons")
      .select("*")
      .eq("code", normalizedCode)
      .maybeSingle();

    if (couponError) {
      return NextResponse.json({ error: couponError.message }, { status: 500 });
    }

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found." }, { status: 400 });
    }

    const couponValidation = validateCouponForAmount(coupon, orderAmount);
    if (!couponValidation.valid) {
      return NextResponse.json(
        { error: couponValidation.message ?? "Coupon is not valid." },
        { status: 400 },
      );
    }

    discountAmount = couponValidation.discountAmount;
    total = Math.max(orderAmount - discountAmount, 0);
    couponId = coupon.id;
    couponCode = coupon.code;
  }

  const orderPayload = {
    user_id: auth.user.id,
    order_number: generateOrderNumber(),
    payment_method: parsed.data.payment_method,
    payment_status:
      parsed.data.payment_method === "bank_transfer" ? "under_review" : "pending",
    subtotal,
    shipping_fee: shippingFee,
    discount_amount: discountAmount,
    total,
    coupon_id: couponId,
    coupon_code: couponCode,
    notes: parsed.data.notes || null,
    customer_name: parsed.data.customer_name,
    customer_phone: parsed.data.phone,
    customer_email: parsed.data.email,
    shipping_address: parsed.data.address,
  };

  const { data: order, error: orderError } = await auth.supabase
    .from("orders")
    .insert(orderPayload)
    .select("*")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message || "Unable to create order." },
      { status: 500 },
    );
  }

  const sellerByProductId = new Map(
    (productsInDb ?? []).map((product) => [product.id, product.seller_id]),
  );

  const orderItems = parsed.data.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    seller_id: sellerByProductId.get(item.id) ?? null,
    product_name: item.name,
    product_slug: item.slug,
    product_image: item.main_image,
    unit_price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }));

  const { error: itemError } = await auth.supabase.from("order_items").insert(orderItems);
  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  const sellerIds = Array.from(
    new Set(
      orderItems
        .map((item) => item.seller_id)
        .filter((sellerId): sellerId is string => Boolean(sellerId)),
    ),
  );

  if (sellerIds.length > 0) {
    const { error: sellerOrderError } = await auth.supabase
      .from("seller_orders")
      .insert(
        sellerIds.map((sellerId) => ({
          order_id: order.id,
          seller_id: sellerId,
          status: "pending",
        })),
      );

    if (sellerOrderError) {
      return NextResponse.json({ error: sellerOrderError.message }, { status: 500 });
    }
  }

  const { error: paymentError } = await auth.supabase.from("payments").insert({
    order_id: order.id,
    method: parsed.data.payment_method,
    status:
      parsed.data.payment_method === "bank_transfer" ? "under_review" : "pending",
    proof_url: parsed.data.payment_proof_url || null,
    instructions:
      parsed.data.payment_method === "bank_transfer"
        ? "Upload payment proof and wait for admin verification."
        : null,
  });

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  if (couponId) {
    const { error: couponConsumeError } = await auth.supabase.rpc("consume_coupon", {
      p_coupon_id: couponId,
    });

    if (couponConsumeError) {
      console.error("Coupon consume failed", couponConsumeError.message);
    }
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
  });
}
