import type { Database } from "@/types/database";

export type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];

export type CouponValidationResult = {
  valid: boolean;
  message?: string;
  discountAmount: number;
};

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase();
}

export function calculateCouponDiscount(coupon: CouponRow, amount: number) {
  if (amount <= 0) {
    return 0;
  }

  const discountValue = toNumber(coupon.discount_value);
  const maxDiscount = coupon.max_discount_amount
    ? toNumber(coupon.max_discount_amount)
    : null;

  let discount =
    coupon.discount_type === "percentage"
      ? (amount * discountValue) / 100
      : discountValue;

  if (maxDiscount !== null && Number.isFinite(maxDiscount)) {
    discount = Math.min(discount, maxDiscount);
  }

  return roundMoney(Math.min(discount, amount));
}

export function validateCouponForAmount(
  coupon: CouponRow,
  orderAmount: number,
  nowDate: Date = new Date(),
): CouponValidationResult {
  if (!coupon.is_active) {
    return {
      valid: false,
      message: "This coupon is inactive.",
      discountAmount: 0,
    };
  }

  if (coupon.starts_at && new Date(coupon.starts_at) > nowDate) {
    return {
      valid: false,
      message: "This coupon is not active yet.",
      discountAmount: 0,
    };
  }

  if (coupon.ends_at && new Date(coupon.ends_at) < nowDate) {
    return {
      valid: false,
      message: "This coupon has expired.",
      discountAmount: 0,
    };
  }

  const minimumOrder = toNumber(coupon.min_order_total);
  if (orderAmount < minimumOrder) {
    return {
      valid: false,
      message: `Minimum order amount is ${minimumOrder.toFixed(2)} for this coupon.`,
      discountAmount: 0,
    };
  }

  if (
    coupon.usage_limit !== null &&
    coupon.used_count >= coupon.usage_limit
  ) {
    return {
      valid: false,
      message: "This coupon has reached its usage limit.",
      discountAmount: 0,
    };
  }

  const discountAmount = calculateCouponDiscount(coupon, orderAmount);
  if (discountAmount <= 0) {
    return {
      valid: false,
      message: "Coupon discount is not valid for this order.",
      discountAmount: 0,
    };
  }

  return { valid: true, discountAmount };
}
